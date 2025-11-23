import { Controller, Post, Body, Inject, Get, Param, Req, UseGuards } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BtcpayService } from '../btcpay/btcpay.service';
import { TronService } from '../tron/tron.service';
import { LedgerService } from '../ledger/ledger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { randomUUID } from 'crypto';

@Controller('deposits')
export class DepositsController {
  constructor(
    @Inject('PRISMA') private prisma: PrismaClient,
    private btcpayService: BtcpayService,
    private tronService?: TronService,
    private ledgerService?: LedgerService,
  ) { }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const { currency, amount, userId, walletAddress } = body;
    // Prefer authenticated user id (req.user.sub) if available, fall back to provided userId or seed-user for dev
    const authUserId = req?.user?.sub;
    const user = userId || authUserId || 'seed-user'; // replace with auth enforcement when ready

    // Ensure a user record exists for the provided userId (simple dev helper).
    // Use upsert to atomically create the user if missing. In production replace
    // with proper auth/user lookup.
    try {
      await this.prisma.user.upsert({
        where: { id: user },
        update: {},
        create: {
          id: user,
          email: `${user}@local.invalid`,
          name: user,
          password: process.env.DEFAULT_SEED_PASSWORD || 'changeme',
        },
      });
      console.log(`[Deposits] ensured user exists id=${user}`);
    } catch (err) {
      // If upsert fails (unique constraint on email or other), surface a clear error
      // rather than silently continuing and hitting FK errors later.
      console.error('[Deposits] failed to ensure user exists', err?.message || err);
      throw err;
    }

    // Generate deposit ID first for orderId
    const depositId = randomUUID();

    // Determine if BTCPay is enabled for this environment.
    // Rules:
    //  - If BTCPAY_ENABLED='true' -> enabled
    //  - If BTCPAY_ENABLED='false' -> disabled
    //  - Else: enabled only when creds present AND SKIP_BTCPAY !== 'true'
    const explicit = (process.env.BTCPAY_ENABLED || '').toLowerCase();
    const hasCreds = !!(process.env.BTCPAY_HOST && process.env.BTCPAY_API_KEY && process.env.BTCPAY_STORE_ID);
    const skip = (process.env.SKIP_BTCPAY || '').toLowerCase() === 'true';
    const btcpayEnabled = explicit === 'true' ? true : explicit === 'false' ? false : (hasCreds && !skip);

    // If currency is USDT and caller did not provide a destination wallet, try to derive
    // a destination. Prefer environment default in minimal mode; otherwise try store-configured
    // TRON/TRC20 address. This allows the server to operate in store-driven mode when available.
    const curr = currency || 'USDT';
    let resolvedWalletAddress = walletAddress || null;
    let storePermissionMissing: string | null = null;
    if (curr === 'USDT' && !resolvedWalletAddress) {
      if (!btcpayEnabled && process.env.TRON_DEFAULT_RECEIVER) {
        resolvedWalletAddress = process.env.TRON_DEFAULT_RECEIVER;
        console.log(`[Deposits] minimal mode: using TRON_DEFAULT_RECEIVER ${resolvedWalletAddress}`);
      } else if (btcpayEnabled) {
        try {
          const status = await this.btcpayService.getStoreWalletAddressStatus(curr);
          if (status) {
            if (status.address) {
              resolvedWalletAddress = status.address;
              console.log(`[Deposits] using store-configured wallet address ${status.address}`);
            } else if (status.missingPermission) {
              storePermissionMissing = status.missingPermission;
              console.warn(`[Deposits] BTCPay API missing permission: ${storePermissionMissing} - ${status.error || ''}`);
            } else if (status.error) {
              console.warn('[Deposits] getStoreWalletAddressStatus returned error', status.error);
            }
          }
        } catch (e) {
          console.warn('[Deposits] failed to derive store wallet address', e?.message || e);
        }
      }
    }

    // create BTCPay invoice. Do NOT pass the user's walletAddress under a metadata key that plugins might use
    // as a payment destination. Store user-provided or resolved wallet in a non-actionable metadata field instead.
    const metadata = {
      userId: user,
      // place the client-provided or store-derived address in a non-actionable field
      customerWallet: resolvedWalletAddress || null,
      orderId: depositId
    };
    let invoice: any = null;
    let invoiceId: string | null = null;
    let checkout: string | null = null;
    if (btcpayEnabled) {
      try {
        invoice = await this.btcpayService.createInvoice(amount ? Number(amount) : undefined, currency || 'USDT', metadata);
        console.log(`[Deposits] BTCPay invoice creation result:`, JSON.stringify(invoice, null, 2));
        invoiceId = invoice?.data?.id || invoice?.id || null;
        checkout = invoice?.data?.checkoutLink || invoice?.checkoutLink || null;

        console.log(`[Deposits] Extracted invoiceId: ${invoiceId}, checkout: ${checkout}`);

        // Check if the created invoice is valid
        const invoiceStatus = invoice?.data?.status || invoice?.status;
        console.log(`[Deposits] Invoice status: ${invoiceStatus}`);
        if (invoiceId && invoiceStatus === 'Invalid') {
          console.warn(`[Deposits] BTCPay created invalid invoice ${invoiceId}, will use fallback for on-chain payments`);
          console.warn(`[Deposits][debug] invalid-invoice-payload: ${JSON.stringify(invoice, null, 2)}`);
          // Only use local-fallback if no env/store recipient is available
          if (!resolvedWalletAddress) {
            invoiceId = `local-fallback-${Date.now()}`;
            checkout = null;
          } else {
            console.log(`[Deposits] Keeping invalid invoiceId ${invoiceId} for env/store recipient case, will skip settlement`);
          }
        }
      } catch (e) {
        // If invoice creation failed but we have a store-derived or env fallback address, rethrow (don't create deposit)
        console.warn('[Deposits] BTCPay createInvoice failed', e?.response?.data || e?.message || e);
        if (resolvedWalletAddress) {
          // For env/store recipient cases, rethrow to prevent creating deposit without BTCPay invoice
          throw e;
        }
        // mark invoiceId as a placeholder so UI can still use depositId + walletAddress
        invoiceId = `local-fallback-${Date.now()}`;
        checkout = null;
      }
    } else {
      // Minimal mode: no BTCPay. Use a local-fallback invoice id so the client can proceed.
      invoiceId = `local-fallback-${Date.now()}`;
      checkout = null;
    }
    // Try to extract an explicit invoice-provided payment recipient (only from explicit fields).
    // IMPORTANT: do not infer recipient by regex from the invoice JSON because metadata (customerWallet)
    // may contain the user's wallet and would be misinterpreted as the payment destination.
    let invoiceRecipient: string | null = null;
    try {
      invoiceRecipient = invoice?.paymentDestination || invoice?.data?.paymentDestination || invoice?.data?.address || invoice?.data?.addresses?.[0]?.address || null;
    } catch (e) { invoiceRecipient = null; }
    // Persist the invoice-provided recipient if present; otherwise attempt to derive the store-configured
    // recipient (safer than trusting caller-provided metadata). If neither is available, leave null
    // so the client shows the QR/manual flow.
    let walletToPersist: string | null = invoiceRecipient || null;
    if (!walletToPersist && btcpayEnabled) {
      try {
        const status = await this.btcpayService.getStoreWalletAddressStatus(currency || 'USDT');
        if (status && status.address) {
          walletToPersist = status.address;
          console.log(`[Deposits] derived store wallet address ${walletToPersist} for currency=${currency}`);
        } else if (status && status.missingPermission) {
          console.warn('[Deposits] cannot read store payment-methods, missing permission:', status.missingPermission);
        }
      } catch (e) { console.warn('[Deposits] failed to derive store wallet address', e?.message || e); }
    }
    // If still no wallet to persist, fall back to an environment-configured receiver (useful for testing/ops)
    if (!walletToPersist) {
      if (process.env.TRON_DEFAULT_RECEIVER) {
        walletToPersist = process.env.TRON_DEFAULT_RECEIVER;
        console.log(`[Deposits] using TRON_DEFAULT_RECEIVER fallback ${walletToPersist}`);
      } else if (storePermissionMissing && process.env.TRON_DEFAULT_RECEIVER) {
        // redundant, kept for clarity
        walletToPersist = process.env.TRON_DEFAULT_RECEIVER;
        console.log(`[Deposits] using TRON_DEFAULT_RECEIVER fallback due to missing permission ${storePermissionMissing}`);
      }
    }
    // debug log for visibility in container logs
    console.log(`[Deposits] create -> user=${user} amount=${amount} currency=${currency} invoiceId=${invoiceId} walletRequested=${walletAddress} walletResolved=${resolvedWalletAddress} storePermissionMissing=${storePermissionMissing}`);

    // persist deposit using Prisma client
    const dep = await this.prisma.deposit.create({
      data: {
        id: depositId,
        userId: user,
        invoiceId,
        amount: amount ? Number(amount) : 0.0,
        currency: currency || 'USDT',
        status: 'PENDING',
        btcpayStatus: 'NEW',
        walletAddress: walletToPersist
      }
    });
    console.log(`[Deposits] persisted -> depositId=${dep.id} invoiceId=${invoiceId} status=${dep.status}`);
    return {
      depositId: dep.id,
      paymentUrl: checkout,
      invoiceId,
      walletAddress: walletToPersist,
      storePermissionMissing,
      expiresAt: invoice?.data?.expirationTime || null
    };
  }

  @Get(':id')
  async getDeposit(@Param('id') id: string) {
    const dep = await this.prisma.deposit.findUnique({ where: { id } });
    if (!dep) return { error: 'not found' };
    return {
      depositId: dep.id,
      invoiceId: dep.invoiceId,
      amount: dep.amount,
      currency: dep.currency,
      status: dep.status,
      btcpayStatus: dep.btcpayStatus,
      walletAddress: dep.walletAddress,
      confirmedAt: dep.confirmedAt || null,
      createdAt: dep.createdAt,
    };
  }

  @Post('direct')
  async direct(@Body() body: any, @Req() req: any) {
    const { txHash, contract, toAddress, amount, userId } = body;
    const authUserId = req?.user?.sub;
    const user = userId || authUserId || 'seed-user';
    if (!txHash) return { error: 'txHash required' };
    console.log(`[Deposits] direct -> tx=${txHash} user=${user} contract=${contract} to=${toAddress} amount=${amount}`);

    // idempotency: check if txHash already recorded
    const existingByTx = await this.prisma.deposit.findFirst({ where: { txHash } as any } as any);
    if (existingByTx) {
      console.log(`[Deposits] direct -> already processed tx=${txHash} depositId=${existingByTx.id}`);
      return { ok: true, depositId: existingByTx.id, status: existingByTx.status };
    }

    // verify tx on TRON
    if (!this.tronService) return { error: 'TronService not available' };
    const verified = await this.tronService.verifyTx(txHash);
    if (!verified || !verified.ok) return { error: 'tx not found or invalid', detail: verified?.raw };

    // check recipient and contract if provided
    const txTo = verified.to || verified.raw?.to || null;
    const txContract = verified.contract || verified.raw?.token_address || null;
    const txAmount = verified.amount || (verified.raw?.amount ? Number(verified.raw.amount) : null);
    if (contract && txContract && contract.toLowerCase() !== txContract.toLowerCase()) {
      return { error: 'contract mismatch', txContract };
    }
    if (toAddress && txTo && toAddress !== txTo) {
      return { error: 'recipient mismatch', txTo };
    }

    // Defensive server-side guard: if there's an existing Deposit that expects a particular walletAddress,
    // ensure the reported tx recipient matches. This prevents client-side mistakes from crediting the wrong user.
    try {
      const existingInv = await this.prisma.deposit.findFirst({ where: { txHash } as any } as any);
      if (!existingInv) {
        // Also try to find a pending deposit that matches the contract/toAddress and amount (best-effort correlation)
        const possible = await this.prisma.deposit.findFirst({ where: { walletAddress: txTo } as any } as any);
        if (possible && possible.walletAddress && txTo && possible.walletAddress !== txTo) {
          return { error: 'reported tx recipient does not match deposit walletAddress', expected: possible.walletAddress, actual: txTo };
        }
      } else if (existingInv && existingInv.walletAddress && txTo && existingInv.walletAddress !== txTo) {
        return { error: 'reported tx recipient does not match existing deposit walletAddress', expected: existingInv.walletAddress, actual: txTo };
      }
    } catch (e) {
      console.warn('[Deposits] guard check failed', e?.message || e);
    }

    // Try to find a pending deposit that expects funds at this recipient. If found, update it instead of creating a new deposit.
    let dep = null as any;
    try {
      // Build where clause: match walletAddress and status, optionally amount if provided
      let whereClause: any = { walletAddress: txTo, status: 'PENDING' };
      const matchAmount = amount ? Number(amount) : (txAmount ? Number(txAmount) : null);
      if (matchAmount && matchAmount > 0) {
        whereClause.amount = matchAmount;
      }
      console.log(`[Deposits] direct -> looking for pending deposit with wallet=${txTo}, amount=${matchAmount}, where=${JSON.stringify(whereClause)}`);
      const match = await this.prisma.deposit.findFirst({ where: whereClause, orderBy: { createdAt: 'desc' } });
      if (match) {
        console.log(`[Deposits] direct -> matched deposit id=${match.id}, invoiceId=${match.invoiceId}, createdAt=${match.createdAt}, amount=${match.amount}`);
        dep = await this.prisma.deposit.update({ where: { id: match.id }, data: { txHash, status: 'CONFIRMED', btcpayStatus: 'ONCHAIN', confirmedAt: new Date(), amount: amount ? Number(amount) : (txAmount ? Number(txAmount) : match.amount) } as any });
        console.log(`[Deposits] direct -> reconciled pending deposit id=${dep.id} tx=${txHash} amount=${dep.amount}`);

        // Auto-settle BTCPay invoice for verified on-chain transactions
        // This maintains unified accounting where all payments are tracked via BTCPay invoices
        // Debug: log the stored invoiceId so we can see why settlement may be skipped
        console.log(`[Deposits] debug -> deposit.invoiceId=${dep.invoiceId}`);
        // Only attempt settlement when we have a non-placeholder BTCPay invoice id.
        // Previously we compared against the exact `tx-${txHash}` string which could miss other
        // synthetic `tx-...` placeholders. Use a startsWith check to more robustly detect placeholders.
        if (dep.invoiceId && !String(dep.invoiceId).startsWith('tx-') && !String(dep.invoiceId).startsWith('local-fallback-')) {
          // Verify the invoice actually exists on BTCPay before attempting settlement
          console.log(`[Deposits] verifying BTCPay invoice ${dep.invoiceId} before settlement`);
          let invoiceObj = null;
          try { invoiceObj = await this.btcpayService.getInvoice(dep.invoiceId); } catch (e) { console.warn('[Deposits] getInvoice error', e?.message || e); }

          // If invoice not found on BTCPay, attempt to locate a matching invoice via recent webhook events payloads stored in DB
          if (!invoiceObj) {
            console.log(`[Deposits] invoice ${dep.invoiceId} not found on BTCPay. Searching local webhook events for exact invoice id match`);
            const recent = await this.prisma.webhookEvent.findMany({ where: { processed: true }, orderBy: { id: 'desc' }, take: 50 });
            let foundId: string | null = null;
            for (const ev of recent) {
              const payload: any = ev.payload as any;
              if (!payload) continue;
              // direct id fields
              const cand1 = payload?.id || payload?.invoiceId || (payload?.data && payload.data.id);
              console.log(`[Deposits][debug] webhook-candidate id=${cand1} eventId=${ev.eventId} processed=${ev.processed}`);
              if (cand1 && String(cand1) === String(dep.invoiceId)) { foundId = String(cand1); console.log(`[Deposits][debug] exact webhook payload invoice id matched candidate=${cand1}`); break; }
            }
            if (foundId) {
              console.log(`[Deposits] found invoice id in webhook payload: ${foundId} — using it for settlement attempt`);
              invoiceObj = await this.btcpayService.getInvoice(foundId).catch(() => null);
              if (invoiceObj) dep.invoiceId = foundId; // update to the correct id
            }
          }

          if (!invoiceObj) {
            console.log(`[Deposits] no BTCPay invoice object found for deposit ${dep.id} (invoiceId=${dep.invoiceId}). Skipping settlement.`);
          } else {
            // Skip settling if the invoice is invalid
            if (invoiceObj.status === 'Invalid') {
              console.log(`[Deposits] BTCPay invoice ${dep.invoiceId} is invalid, skipping settlement`);
            } else {
              console.log(`[Deposits] settling BTCPay invoice ${dep.invoiceId} for verified on-chain tx ${txHash}`);
              const settleResult = await this.btcpayService.settleInvoice(dep.invoiceId, 'Settled', true);
              if (settleResult.error) {
                // For on-chain verified transactions, settlement failure is not critical
                // The deposit is already confirmed and ledger entries posted
                if (settleResult.error.includes('Invalid invoice')) {
                  console.log(`[Deposits] BTCPay invoice ${dep.invoiceId} is invalid (creation failed), but on-chain tx is verified - proceeding`);
                } else {
                  console.warn(`[Deposits] failed to settle BTCPay invoice ${dep.invoiceId}:`, settleResult.error);
                }
              } else {
                console.log(`[Deposits] BTCPay invoice ${dep.invoiceId} settled successfully for on-chain payment`);
              }
            }
          }
        } else if (dep.invoiceId?.startsWith('local-fallback-')) {
          // TRON-only/minimal mode: once on-chain tx is verified and deposit is confirmed,
          // replace the placeholder invoice id with a synthetic tx-based id to avoid
          // repeated fallback logs and make idempotency obvious. Skip BTCPay settlement entirely.
          try {
            const syntheticId = `tx-${txHash}`;
            await this.prisma.deposit.update({ where: { id: dep.id }, data: { invoiceId: syntheticId } as any });
            console.log(`[Deposits] deposit ${dep.id} used minimal mode (local-fallback). Replaced invoiceId with synthetic ${syntheticId} and skipped BTCPay settlement (expected in TRON-only mode).`);
          } catch (e) {
            console.warn('[Deposits] failed to set synthetic tx-based invoiceId for local-fallback', e?.message || e);
          }
        }
      }
    } catch (e) { console.warn('[Deposits] matching deposit lookup failed', e?.message || e); }

    if (!dep) {
      // create Deposit and mark confirmed
      const depData = {
        userId: user,
        invoiceId: `tx-${txHash}`,
        txHash,
        amount: amount ? Number(amount) : (txAmount ? Number(txAmount) : 0),
        currency: 'USDT',
        status: 'CONFIRMED',
        btcpayStatus: 'ONCHAIN',
        walletAddress: txTo || null,
        confirmedAt: new Date()
      };
      dep = await this.prisma.deposit.create({ data: depData as any });
      console.log(`[Deposits] direct persisted -> depositId=${dep.id} tx=${txHash} amount=${dep.amount}`);
    }

    // post ledger entries
    if (this.ledgerService) {
      const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);
      const minor = Math.round((dep.amount || 0) * Math.pow(10, decimals));
      await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(minor), dep.currency, 'deposit', dep.id);
      await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-minor), dep.currency, 'deposit', dep.id);

      // Check if this is the user's first confirmed deposit and apply 10% welcome bonus
      try {
        const confirmedDeposits = await this.prisma.deposit.count({
          where: {
            userId: dep.userId,
            status: 'CONFIRMED'
          }
        });

        if (confirmedDeposits === 1) { // This is the first confirmed deposit
          const bonusAmount = Math.round(minor * 0.1); // 10% bonus
          console.log(`[Deposits] Applying 10% welcome bonus for user ${dep.userId}: ${bonusAmount} minor units`);

          // Credit the bonus to the user's account
          await this.ledgerService.post(
            dep.userId,
            `Liabilities:User:${dep.userId}:${dep.currency}`,
            BigInt(-bonusAmount),
            dep.currency,
            'welcome_bonus',
            dep.id
          );

          // Debit from a bonus expense account
          await this.ledgerService.post(
            null,
            `Expenses:Bonuses:Welcome`,
            BigInt(bonusAmount),
            dep.currency,
            'welcome_bonus',
            dep.id
          );
        }
      } catch (bonusError) {
        console.error('[Deposits] Failed to apply welcome bonus:', bonusError?.message || bonusError);
        // Don't fail the deposit if bonus application fails
      }
    }

    const network = process.env.TRON_NETWORK || (process.env.TRON_PROVIDER_URL && process.env.TRON_PROVIDER_URL.includes('shasta') ? 'shasta' : 'mainnet');
    const explorerBase = network === 'mainnet' ? 'https://tronscan.org/#/transaction/' : 'https://shasta.tronscan.org/#/transaction/';
    const explorerUrl = txHash ? `${explorerBase}${txHash}` : null;
    return { ok: true, depositId: dep.id, status: dep.status, txHash, explorerUrl };
  }

  @Get('public')
  async publicList() {
    // return recent deposits for public display (no sensitive user fields)
    const rows = await this.prisma.deposit.findMany({ take: 100, orderBy: { createdAt: 'desc' }, select: { id: true, invoiceId: true, amount: true, currency: true, status: true, createdAt: true, txHash: true } });
    return rows.map(r => ({ depositId: r.id, invoiceId: r.invoiceId, amount: r.amount, currency: r.currency, status: r.status, createdAt: r.createdAt, txHash: r.txHash }));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async myDeposits(@Req() req: any) {
    const authUserId = req?.user?.sub;
    const user = authUserId || 'seed-user';
    const rows = await this.prisma.deposit.findMany({ where: { userId: user }, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, currency: true, status: true, createdAt: true, txHash: true, invoiceId: true, walletAddress: true } });
    return rows.map(r => ({ depositId: r.id, amount: r.amount, currency: r.currency, status: r.status, createdAt: r.createdAt, txHash: r.txHash, invoiceId: r.invoiceId, walletAddress: r.walletAddress }));
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async myBalance(@Req() req: any) {
    const authUserId = req?.user?.sub;
    const user = authUserId || 'seed-user';
    if (!this.ledgerService) return { error: 'LedgerService not available' };

    const balances = await this.ledgerService.balanceByUser(user);
    // balances is array of { currency, _sum: { deltaMinor } }
    // Convert to major units
    const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);

    const result = balances.map(b => {
      const minor = b._sum.deltaMinor ? Number(b._sum.deltaMinor) : 0;
      return {
        currency: b.currency,
        amount: minor / Math.pow(10, decimals)
      };
    });

    return { balances: result };
  }

  // Prefer the concrete route before the param route so 
  // /store/current/tron-address is not captured by :storeId
  @Get('store/current/tron-address')
  async getCurrentStoreTronAddress() {
    try {
      const status = await this.btcpayService.getStoreWalletAddressStatus('USDT');
      if (status) {
        if (status.address) return { ok: true, address: status.address, network: status.address.startsWith('T') ? 'tron' : 'unknown', source: status.source || 'store' };
        if (status.missingPermission) {
          // if env fallback available, return it and indicate permission missing
          if (process.env.TRON_DEFAULT_RECEIVER) return { ok: true, address: process.env.TRON_DEFAULT_RECEIVER, network: process.env.TRON_DEFAULT_RECEIVER.startsWith('T') ? 'tron' : 'unknown', source: 'env', missingPermission: status.missingPermission };
          return { ok: false, missingPermission: status.missingPermission, error: status.error || 'missing permission' };
        }
      }
      if (process.env.TRON_DEFAULT_RECEIVER) return { ok: true, address: process.env.TRON_DEFAULT_RECEIVER, network: process.env.TRON_DEFAULT_RECEIVER.startsWith('T') ? 'tron' : 'unknown', source: 'env' };
      return { ok: false, message: 'No Tron/TRC20 address configured for current store' };
    } catch (e) {
      console.error('[Deposits] getCurrentStoreTronAddress failed', e?.message || e);
      return { ok: false, message: 'Failed to fetch store address' };
    }
  }

  @Get('store/:storeId/tron-address')
  async getStoreTronAddress(@Param('storeId') storeId: string) {
    // route guard: if client calls /store/current/tron-address, delegate to the explicit handler
    if (storeId === 'current') return this.getCurrentStoreTronAddress();
    try {
      const status = await this.btcpayService.getStoreWalletAddressStatus('USDT', storeId);
      if (status) {
        if (status.address) return { ok: true, address: status.address, source: status.source || 'store', network: status.address.startsWith('T') ? 'tron' : 'unknown' };
        if (status.missingPermission) return { ok: false, missingPermission: status.missingPermission, error: status.error || 'missing permission' };
      }
      // If BTCPay not available or no address configured for this store, return env fallback when present
      if (process.env.TRON_DEFAULT_RECEIVER) return { ok: true, address: process.env.TRON_DEFAULT_RECEIVER, source: 'env', network: process.env.TRON_DEFAULT_RECEIVER.startsWith('T') ? 'tron' : 'unknown' };
      return { ok: false, message: 'No Tron/TRC20 address configured for this store' };
    } catch (e) {
      console.error('[Deposits] getStoreTronAddress failed', e?.message || e);
      return { ok: false, message: 'Failed to fetch store address' };
    }
  }

  // Temporary admin endpoint: reconcile existing deposits that used local-fallback invoice ids
  // Scans recent webhook events to find a matching real invoice id, persists it, and attempts settlement.
  @Get('reconcile/local-fallbacks')
  async reconcileLocalFallbacks() {
    try {
      const rows = await this.prisma.deposit.findMany({ where: { invoiceId: { startsWith: 'local-fallback-' } as any }, take: 200 });
      const results: any[] = [];
      for (const d of rows) {
        try {
          console.log(`[Deposits][reconcile] processing deposit ${d.id} invoice=${d.invoiceId} wallet=${d.walletAddress} amount=${d.amount}`);
          const recent = await this.prisma.webhookEvent.findMany({ where: { processed: true }, orderBy: { id: 'desc' }, take: 500 });
          let foundId: string | null = null;
          for (const ev of recent) {
            const payload: any = ev.payload as any;
            if (!payload) continue;
            const cand1 = payload?.id || payload?.invoiceId || (payload?.data && payload.data.id);
            if (cand1 && String(cand1) === String(d.invoiceId)) { foundId = String(cand1); break; }
            const amt = payload?.data?.amount?.value || payload?.data?.amount;
            const meta = payload?.data?.metadata || payload?.metadata || {};
            const custWallet = meta?.customerWallet || meta?.customer_wallet || meta?.wallet || null;
            if (amt && d.amount && Number(amt) === Number(d.amount) && custWallet && d.walletAddress && String(custWallet) === String(d.walletAddress)) {
              foundId = payload?.data?.id || payload?.id || payload?.invoiceId || null;
              if (foundId) break;
            }
          }
          if (!foundId) {
            // If no BTCPay invoice was found and the deposit has a txHash, migrate the invoiceId
            // to a synthetic tx-based id to clean up local-fallbacks in TRON-only environments.
            if (d.txHash) {
              const synthetic = `tx-${d.txHash}`;
              try {
                await this.prisma.deposit.update({ where: { id: d.id }, data: { invoiceId: synthetic } as any });
                results.push({ depositId: d.id, resolved: true, syntheticInvoiceId: synthetic, note: 'no matching BTCPay invoice; set synthetic tx-based id' });
              } catch (e) {
                results.push({ depositId: d.id, resolved: false, error: e?.message || String(e) });
              }
            } else {
              results.push({ depositId: d.id, resolved: false });
            }
            continue;
          }
          console.log(`[Deposits][reconcile] found invoice id ${foundId} for deposit ${d.id}`);
          const invoiceObj = await this.btcpayService.getInvoice(foundId).catch(() => null);
          if (!invoiceObj) { results.push({ depositId: d.id, resolved: false, foundId, note: 'btcpay getInvoice missing' }); continue; }
          await this.prisma.deposit.update({ where: { id: d.id }, data: { invoiceId: foundId } as any });
          const settleResult = await this.btcpayService.settleInvoice(foundId, 'Settled', true);
          results.push({ depositId: d.id, resolved: true, foundId, settled: !settleResult.error, settleResult });
        } catch (e) {
          console.warn('[Deposits][reconcile] failed', e?.message || e);
          results.push({ depositId: d.id, error: e?.message || String(e) });
        }
      }
      return { ok: true, count: rows.length, results };
    } catch (e) {
      console.error('[Deposits][reconcile] failed', e?.message || e);
      return { ok: false, error: e?.message || e };
    }
  }
}
