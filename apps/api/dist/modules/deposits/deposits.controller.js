"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositsController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const btcpay_service_1 = require("../btcpay/btcpay.service");
const tron_service_1 = require("../tron/tron.service");
const ledger_service_1 = require("../ledger/ledger.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const crypto_1 = require("crypto");
let DepositsController = class DepositsController {
    constructor(prisma, btcpayService, tronService, ledgerService) {
        this.prisma = prisma;
        this.btcpayService = btcpayService;
        this.tronService = tronService;
        this.ledgerService = ledgerService;
    }
    async create(body, req) {
        const { currency, amount, walletAddress } = body;
        const user = req.user.sub;
        const email = req.user.email;
        if (!user) {
            throw new Error('User not authenticated');
        }
        console.log(`[Deposits] create -> authenticated user=${user} email=${email}`);
        const depositId = (0, crypto_1.randomUUID)();
        const explicit = (process.env.BTCPAY_ENABLED || '').toLowerCase();
        const hasCreds = !!(process.env.BTCPAY_HOST && process.env.BTCPAY_API_KEY && process.env.BTCPAY_STORE_ID);
        const skip = (process.env.SKIP_BTCPAY || '').toLowerCase() === 'true';
        const btcpayEnabled = explicit === 'true' ? true : explicit === 'false' ? false : (hasCreds && !skip);
        const curr = currency || 'USDT';
        let resolvedWalletAddress = walletAddress || null;
        let storePermissionMissing = null;
        if (curr === 'USDT' && !resolvedWalletAddress) {
            if (!btcpayEnabled && process.env.TRON_DEFAULT_RECEIVER) {
                resolvedWalletAddress = process.env.TRON_DEFAULT_RECEIVER;
                console.log(`[Deposits] minimal mode: using TRON_DEFAULT_RECEIVER ${resolvedWalletAddress}`);
            }
            else if (btcpayEnabled) {
                try {
                    const status = await this.btcpayService.getStoreWalletAddressStatus(curr);
                    if (status) {
                        if (status.address) {
                            resolvedWalletAddress = status.address;
                            console.log(`[Deposits] using store-configured wallet address ${status.address}`);
                        }
                        else if (status.missingPermission) {
                            storePermissionMissing = status.missingPermission;
                            console.warn(`[Deposits] BTCPay API missing permission: ${storePermissionMissing} - ${status.error || ''}`);
                        }
                        else if (status.error) {
                            console.warn('[Deposits] getStoreWalletAddressStatus returned error', status.error);
                        }
                    }
                }
                catch (e) {
                    console.warn('[Deposits] failed to derive store wallet address', e?.message || e);
                }
            }
        }
        const metadata = {
            userId: user,
            email: email,
            buyerEmail: email,
            customerWallet: resolvedWalletAddress || null,
            orderId: depositId
        };
        let invoice = null;
        let invoiceId = null;
        let checkout = null;
        if (btcpayEnabled) {
            try {
                invoice = await this.btcpayService.createInvoice(amount ? Number(amount) : undefined, currency || 'USDT', metadata);
                console.log(`[Deposits] BTCPay invoice creation result:`, JSON.stringify(invoice, null, 2));
                invoiceId = invoice?.data?.id || invoice?.id || null;
                checkout = invoice?.data?.checkoutLink || invoice?.checkoutLink || null;
                console.log(`[Deposits] Extracted invoiceId: ${invoiceId}, checkout: ${checkout}`);
                const invoiceStatus = invoice?.data?.status || invoice?.status;
                console.log(`[Deposits] Invoice status: ${invoiceStatus}`);
                if (invoiceId && invoiceStatus === 'Invalid') {
                    console.warn(`[Deposits] BTCPay created invalid invoice ${invoiceId}, will use fallback for on-chain payments`);
                    console.warn(`[Deposits][debug] invalid-invoice-payload: ${JSON.stringify(invoice, null, 2)}`);
                    if (!resolvedWalletAddress) {
                        invoiceId = `local-fallback-${Date.now()}`;
                        checkout = null;
                    }
                    else {
                        console.log(`[Deposits] Keeping invalid invoiceId ${invoiceId} for env/store recipient case, will skip settlement`);
                    }
                }
            }
            catch (e) {
                console.warn('[Deposits] BTCPay createInvoice failed', e?.response?.data || e?.message || e);
                if (resolvedWalletAddress) {
                    throw e;
                }
                invoiceId = `local-fallback-${Date.now()}`;
                checkout = null;
            }
        }
        else {
            invoiceId = `local-fallback-${Date.now()}`;
            checkout = null;
        }
        let invoiceRecipient = null;
        try {
            invoiceRecipient = invoice?.paymentDestination || invoice?.data?.paymentDestination || invoice?.data?.address || invoice?.data?.addresses?.[0]?.address || null;
        }
        catch (e) {
            invoiceRecipient = null;
        }
        let walletToPersist = invoiceRecipient || null;
        if (!walletToPersist && btcpayEnabled) {
            try {
                const status = await this.btcpayService.getStoreWalletAddressStatus(currency || 'USDT');
                if (status && status.address) {
                    walletToPersist = status.address;
                    console.log(`[Deposits] derived store wallet address ${walletToPersist} for currency=${currency}`);
                }
                else if (status && status.missingPermission) {
                    console.warn('[Deposits] cannot read store payment-methods, missing permission:', status.missingPermission);
                }
            }
            catch (e) {
                console.warn('[Deposits] failed to derive store wallet address', e?.message || e);
            }
        }
        if (!walletToPersist) {
            if (process.env.TRON_DEFAULT_RECEIVER) {
                walletToPersist = process.env.TRON_DEFAULT_RECEIVER;
                console.log(`[Deposits] using TRON_DEFAULT_RECEIVER fallback ${walletToPersist}`);
            }
            else if (storePermissionMissing && process.env.TRON_DEFAULT_RECEIVER) {
                walletToPersist = process.env.TRON_DEFAULT_RECEIVER;
                console.log(`[Deposits] using TRON_DEFAULT_RECEIVER fallback due to missing permission ${storePermissionMissing}`);
            }
        }
        console.log(`[Deposits] create -> user=${user} amount=${amount} currency=${currency} invoiceId=${invoiceId} walletRequested=${walletAddress} walletResolved=${resolvedWalletAddress} storePermissionMissing=${storePermissionMissing}`);
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
    async getDeposit(id) {
        const dep = await this.prisma.deposit.findUnique({ where: { id } });
        if (!dep)
            return { error: 'not found' };
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
    async direct(body, req) {
        const { txHash, contract, toAddress, amount, userId } = body;
        const authUserId = req?.user?.sub;
        const user = userId || authUserId || 'seed-user';
        if (!txHash)
            return { error: 'txHash required' };
        console.log(`[Deposits] direct -> tx=${txHash} user=${user} contract=${contract} to=${toAddress} amount=${amount}`);
        const existingByTx = await this.prisma.deposit.findFirst({ where: { txHash } });
        if (existingByTx) {
            console.log(`[Deposits] direct -> already processed tx=${txHash} depositId=${existingByTx.id}`);
            return { ok: true, depositId: existingByTx.id, status: existingByTx.status };
        }
        if (!this.tronService)
            return { error: 'TronService not available' };
        const verified = await this.tronService.verifyTx(txHash);
        if (!verified || !verified.ok)
            return { error: 'tx not found or invalid', detail: verified?.raw };
        const txTo = verified.to || verified.raw?.to || null;
        const txContract = verified.contract || verified.raw?.token_address || null;
        const txAmount = verified.amount || (verified.raw?.amount ? Number(verified.raw.amount) : null);
        if (contract && txContract && contract.toLowerCase() !== txContract.toLowerCase()) {
            return { error: 'contract mismatch', txContract };
        }
        if (toAddress && txTo && toAddress !== txTo) {
            return { error: 'recipient mismatch', txTo };
        }
        try {
            const existingInv = await this.prisma.deposit.findFirst({ where: { txHash } });
            if (!existingInv) {
                const possible = await this.prisma.deposit.findFirst({ where: { walletAddress: txTo } });
                if (possible && possible.walletAddress && txTo && possible.walletAddress !== txTo) {
                    return { error: 'reported tx recipient does not match deposit walletAddress', expected: possible.walletAddress, actual: txTo };
                }
            }
            else if (existingInv && existingInv.walletAddress && txTo && existingInv.walletAddress !== txTo) {
                return { error: 'reported tx recipient does not match existing deposit walletAddress', expected: existingInv.walletAddress, actual: txTo };
            }
        }
        catch (e) {
            console.warn('[Deposits] guard check failed', e?.message || e);
        }
        let dep = null;
        try {
            let whereClause = { walletAddress: txTo, status: 'PENDING' };
            const matchAmount = amount ? Number(amount) : (txAmount ? Number(txAmount) : null);
            if (matchAmount && matchAmount > 0) {
                whereClause.amount = matchAmount;
            }
            console.log(`[Deposits] direct -> looking for pending deposit with wallet=${txTo}, amount=${matchAmount}, where=${JSON.stringify(whereClause)}`);
            const match = await this.prisma.deposit.findFirst({ where: whereClause, orderBy: { createdAt: 'desc' } });
            if (match) {
                console.log(`[Deposits] direct -> matched deposit id=${match.id}, invoiceId=${match.invoiceId}, createdAt=${match.createdAt}, amount=${match.amount}`);
                dep = await this.prisma.deposit.update({ where: { id: match.id }, data: { txHash, status: 'CONFIRMED', btcpayStatus: 'ONCHAIN', confirmedAt: new Date(), amount: amount ? Number(amount) : (txAmount ? Number(txAmount) : match.amount) } });
                console.log(`[Deposits] direct -> reconciled pending deposit id=${dep.id} tx=${txHash} amount=${dep.amount}`);
                console.log(`[Deposits] debug -> deposit.invoiceId=${dep.invoiceId}`);
                if (dep.invoiceId && !String(dep.invoiceId).startsWith('tx-') && !String(dep.invoiceId).startsWith('local-fallback-')) {
                    console.log(`[Deposits] verifying BTCPay invoice ${dep.invoiceId} before settlement`);
                    let invoiceObj = null;
                    try {
                        invoiceObj = await this.btcpayService.getInvoice(dep.invoiceId);
                    }
                    catch (e) {
                        console.warn('[Deposits] getInvoice error', e?.message || e);
                    }
                    if (!invoiceObj) {
                        console.log(`[Deposits] invoice ${dep.invoiceId} not found on BTCPay. Searching local webhook events for exact invoice id match`);
                        const recent = await this.prisma.webhookEvent.findMany({ where: { processed: true }, orderBy: { id: 'desc' }, take: 50 });
                        let foundId = null;
                        for (const ev of recent) {
                            const payload = ev.payload;
                            if (!payload)
                                continue;
                            const cand1 = payload?.id || payload?.invoiceId || (payload?.data && payload.data.id);
                            console.log(`[Deposits][debug] webhook-candidate id=${cand1} eventId=${ev.eventId} processed=${ev.processed}`);
                            if (cand1 && String(cand1) === String(dep.invoiceId)) {
                                foundId = String(cand1);
                                console.log(`[Deposits][debug] exact webhook payload invoice id matched candidate=${cand1}`);
                                break;
                            }
                        }
                        if (foundId) {
                            console.log(`[Deposits] found invoice id in webhook payload: ${foundId} — using it for settlement attempt`);
                            invoiceObj = await this.btcpayService.getInvoice(foundId).catch(() => null);
                            if (invoiceObj)
                                dep.invoiceId = foundId;
                        }
                    }
                    if (!invoiceObj) {
                        console.log(`[Deposits] no BTCPay invoice object found for deposit ${dep.id} (invoiceId=${dep.invoiceId}). Skipping settlement.`);
                    }
                    else {
                        if (invoiceObj.status === 'Invalid') {
                            console.log(`[Deposits] BTCPay invoice ${dep.invoiceId} is invalid, skipping settlement`);
                        }
                        else {
                            console.log(`[Deposits] settling BTCPay invoice ${dep.invoiceId} for verified on-chain tx ${txHash}`);
                            const settleResult = await this.btcpayService.settleInvoice(dep.invoiceId, 'Settled', true);
                            if (settleResult.error) {
                                if (settleResult.error.includes('Invalid invoice')) {
                                    console.log(`[Deposits] BTCPay invoice ${dep.invoiceId} is invalid (creation failed), but on-chain tx is verified - proceeding`);
                                }
                                else {
                                    console.warn(`[Deposits] failed to settle BTCPay invoice ${dep.invoiceId}:`, settleResult.error);
                                }
                            }
                            else {
                                console.log(`[Deposits] BTCPay invoice ${dep.invoiceId} settled successfully for on-chain payment`);
                            }
                        }
                    }
                }
                else if (dep.invoiceId?.startsWith('local-fallback-')) {
                    try {
                        const syntheticId = `tx-${txHash}`;
                        await this.prisma.deposit.update({ where: { id: dep.id }, data: { invoiceId: syntheticId } });
                        console.log(`[Deposits] deposit ${dep.id} used minimal mode (local-fallback). Replaced invoiceId with synthetic ${syntheticId} and skipped BTCPay settlement (expected in TRON-only mode).`);
                    }
                    catch (e) {
                        console.warn('[Deposits] failed to set synthetic tx-based invoiceId for local-fallback', e?.message || e);
                    }
                }
            }
        }
        catch (e) {
            console.warn('[Deposits] matching deposit lookup failed', e?.message || e);
        }
        if (!dep) {
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
            dep = await this.prisma.deposit.create({ data: depData });
            console.log(`[Deposits] direct persisted -> depositId=${dep.id} tx=${txHash} amount=${dep.amount}`);
        }
        if (this.ledgerService) {
            const decimals = Number(process.env.TRON_USDT_DECIMALS || 6);
            const minor = Math.round((dep.amount || 0) * Math.pow(10, decimals));
            await this.ledgerService.post(null, `Assets:Custody:${dep.currency}`, BigInt(minor), dep.currency, 'deposit', dep.id);
            await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-minor), dep.currency, 'deposit', dep.id);
            try {
                const confirmedDeposits = await this.prisma.deposit.count({
                    where: {
                        userId: dep.userId,
                        status: 'CONFIRMED'
                    }
                });
                if (confirmedDeposits === 1) {
                    const bonusAmount = Math.round(minor * 0.1);
                    console.log(`[Deposits] Applying 10% welcome bonus for user ${dep.userId}: ${bonusAmount} minor units`);
                    await this.ledgerService.post(dep.userId, `Liabilities:User:${dep.userId}:${dep.currency}`, BigInt(-bonusAmount), dep.currency, 'welcome_bonus', dep.id);
                    await this.ledgerService.post(null, `Expenses:Bonuses:Welcome`, BigInt(bonusAmount), dep.currency, 'welcome_bonus', dep.id);
                }
            }
            catch (bonusError) {
                console.error('[Deposits] Failed to apply welcome bonus:', bonusError?.message || bonusError);
            }
        }
        const network = process.env.TRON_NETWORK || (process.env.TRON_PROVIDER_URL && process.env.TRON_PROVIDER_URL.includes('shasta') ? 'shasta' : 'mainnet');
        const explorerBase = network === 'mainnet' ? 'https://tronscan.org/#/transaction/' : 'https://shasta.tronscan.org/#/transaction/';
        const explorerUrl = txHash ? `${explorerBase}${txHash}` : null;
        return { ok: true, depositId: dep.id, status: dep.status, txHash, explorerUrl };
    }
    async publicList() {
        const rows = await this.prisma.deposit.findMany({ take: 100, orderBy: { createdAt: 'desc' }, select: { id: true, invoiceId: true, amount: true, currency: true, status: true, createdAt: true, txHash: true } });
        return rows.map(r => ({ depositId: r.id, invoiceId: r.invoiceId, amount: r.amount, currency: r.currency, status: r.status, createdAt: r.createdAt, txHash: r.txHash }));
    }
    async myDeposits(req) {
        const authUserId = req?.user?.sub;
        const user = authUserId || 'seed-user';
        const rows = await this.prisma.deposit.findMany({ where: { userId: user }, orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, currency: true, status: true, createdAt: true, txHash: true, invoiceId: true, walletAddress: true } });
        return rows.map(r => ({ depositId: r.id, amount: r.amount, currency: r.currency, status: r.status, createdAt: r.createdAt, txHash: r.txHash, invoiceId: r.invoiceId, walletAddress: r.walletAddress }));
    }
    async myBalance(req) {
        const authUserId = req?.user?.sub;
        const user = authUserId || 'seed-user';
        if (!this.ledgerService)
            return { error: 'LedgerService not available' };
        const balances = await this.ledgerService.balanceByUser(user);
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
    async getCurrentStoreTronAddress() {
        try {
            const status = await this.btcpayService.getStoreWalletAddressStatus('USDT');
            if (status) {
                if (status.address)
                    return { ok: true, address: status.address, network: status.address.startsWith('T') ? 'tron' : 'unknown', source: status.source || 'store' };
                if (status.missingPermission) {
                    if (process.env.TRON_DEFAULT_RECEIVER)
                        return { ok: true, address: process.env.TRON_DEFAULT_RECEIVER, network: process.env.TRON_DEFAULT_RECEIVER.startsWith('T') ? 'tron' : 'unknown', source: 'env', missingPermission: status.missingPermission };
                    return { ok: false, missingPermission: status.missingPermission, error: status.error || 'missing permission' };
                }
            }
            if (process.env.TRON_DEFAULT_RECEIVER)
                return { ok: true, address: process.env.TRON_DEFAULT_RECEIVER, network: process.env.TRON_DEFAULT_RECEIVER.startsWith('T') ? 'tron' : 'unknown', source: 'env' };
            return { ok: false, message: 'No Tron/TRC20 address configured for current store' };
        }
        catch (e) {
            console.error('[Deposits] getCurrentStoreTronAddress failed', e?.message || e);
            return { ok: false, message: 'Failed to fetch store address' };
        }
    }
    async getStoreTronAddress(storeId) {
        if (storeId === 'current')
            return this.getCurrentStoreTronAddress();
        try {
            const status = await this.btcpayService.getStoreWalletAddressStatus('USDT', storeId);
            if (status) {
                if (status.address)
                    return { ok: true, address: status.address, source: status.source || 'store', network: status.address.startsWith('T') ? 'tron' : 'unknown' };
                if (status.missingPermission)
                    return { ok: false, missingPermission: status.missingPermission, error: status.error || 'missing permission' };
            }
            if (process.env.TRON_DEFAULT_RECEIVER)
                return { ok: true, address: process.env.TRON_DEFAULT_RECEIVER, source: 'env', network: process.env.TRON_DEFAULT_RECEIVER.startsWith('T') ? 'tron' : 'unknown' };
            return { ok: false, message: 'No Tron/TRC20 address configured for this store' };
        }
        catch (e) {
            console.error('[Deposits] getStoreTronAddress failed', e?.message || e);
            return { ok: false, message: 'Failed to fetch store address' };
        }
    }
    async reconcileLocalFallbacks() {
        try {
            const rows = await this.prisma.deposit.findMany({ where: { invoiceId: { startsWith: 'local-fallback-' } }, take: 200 });
            const results = [];
            for (const d of rows) {
                try {
                    console.log(`[Deposits][reconcile] processing deposit ${d.id} invoice=${d.invoiceId} wallet=${d.walletAddress} amount=${d.amount}`);
                    const recent = await this.prisma.webhookEvent.findMany({ where: { processed: true }, orderBy: { id: 'desc' }, take: 500 });
                    let foundId = null;
                    for (const ev of recent) {
                        const payload = ev.payload;
                        if (!payload)
                            continue;
                        const cand1 = payload?.id || payload?.invoiceId || (payload?.data && payload.data.id);
                        if (cand1 && String(cand1) === String(d.invoiceId)) {
                            foundId = String(cand1);
                            break;
                        }
                        const amt = payload?.data?.amount?.value || payload?.data?.amount;
                        const meta = payload?.data?.metadata || payload?.metadata || {};
                        const custWallet = meta?.customerWallet || meta?.customer_wallet || meta?.wallet || null;
                        if (amt && d.amount && Number(amt) === Number(d.amount) && custWallet && d.walletAddress && String(custWallet) === String(d.walletAddress)) {
                            foundId = payload?.data?.id || payload?.id || payload?.invoiceId || null;
                            if (foundId)
                                break;
                        }
                    }
                    if (!foundId) {
                        if (d.txHash) {
                            const synthetic = `tx-${d.txHash}`;
                            try {
                                await this.prisma.deposit.update({ where: { id: d.id }, data: { invoiceId: synthetic } });
                                results.push({ depositId: d.id, resolved: true, syntheticInvoiceId: synthetic, note: 'no matching BTCPay invoice; set synthetic tx-based id' });
                            }
                            catch (e) {
                                results.push({ depositId: d.id, resolved: false, error: e?.message || String(e) });
                            }
                        }
                        else {
                            results.push({ depositId: d.id, resolved: false });
                        }
                        continue;
                    }
                    console.log(`[Deposits][reconcile] found invoice id ${foundId} for deposit ${d.id}`);
                    const invoiceObj = await this.btcpayService.getInvoice(foundId).catch(() => null);
                    if (!invoiceObj) {
                        results.push({ depositId: d.id, resolved: false, foundId, note: 'btcpay getInvoice missing' });
                        continue;
                    }
                    await this.prisma.deposit.update({ where: { id: d.id }, data: { invoiceId: foundId } });
                    const settleResult = await this.btcpayService.settleInvoice(foundId, 'Settled', true);
                    results.push({ depositId: d.id, resolved: true, foundId, settled: !settleResult.error, settleResult });
                }
                catch (e) {
                    console.warn('[Deposits][reconcile] failed', e?.message || e);
                    results.push({ depositId: d.id, error: e?.message || String(e) });
                }
            }
            return { ok: true, count: rows.length, results };
        }
        catch (e) {
            console.error('[Deposits][reconcile] failed', e?.message || e);
            return { ok: false, error: e?.message || e };
        }
    }
};
exports.DepositsController = DepositsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getDeposit", null);
__decorate([
    (0, common_1.Post)('direct'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "direct", null);
__decorate([
    (0, common_1.Get)('public'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "publicList", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "myDeposits", null);
__decorate([
    (0, common_1.Get)('balance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "myBalance", null);
__decorate([
    (0, common_1.Get)('store/current/tron-address'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getCurrentStoreTronAddress", null);
__decorate([
    (0, common_1.Get)('store/:storeId/tron-address'),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "getStoreTronAddress", null);
__decorate([
    (0, common_1.Get)('reconcile/local-fallbacks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DepositsController.prototype, "reconcileLocalFallbacks", null);
exports.DepositsController = DepositsController = __decorate([
    (0, common_1.Controller)('deposits'),
    __param(0, (0, common_1.Inject)('PRISMA')),
    __metadata("design:paramtypes", [client_1.PrismaClient,
        btcpay_service_1.BtcpayService,
        tron_service_1.TronService,
        ledger_service_1.LedgerService])
], DepositsController);
//# sourceMappingURL=deposits.controller.js.map