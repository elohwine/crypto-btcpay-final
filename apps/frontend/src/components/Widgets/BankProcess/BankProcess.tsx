import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import STORAGE_KEYS from '../../../lib/storageKeys';
import QRCode from 'react-qr-code';
import styles from './BankProcess.module.css';

// token contract will be loaded from the server (GET /api/config/token)

const BankProcess: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [output, setOutput] = useState<string>('Ready to create deposit...');
  const [publicList, setPublicList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [tokenContract, setTokenContract] = useState<string | null>(null);

  // Helper: convert decimal amount to integer base units as BigInt string
  const toBaseUnits = (amount: number | string, decimals: number) => {
    const s = String(amount);
    if (!s.includes('.')) return BigInt(s + '0'.repeat(decimals)).toString();
    const [whole, frac] = s.split('.');
    const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
    const combined = (whole + fracPadded).replace(/^0+/, '') || '0';
    return BigInt(combined).toString();
  };

  // Poll deposit status until CONFIRMED or timeout
  const pollDepositStatus = async (depositId: string | number, attempts = 180, intervalMs = 5000) => {
    try {
      setTxStatus('polling-deposit');
      // initial short wait to allow chain confirmation
      await new Promise((r) => setTimeout(r, 10000));
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await api.get(`/deposits/${depositId}`);
          if (res && res.data && res.data.status === 'CONFIRMED') {
            setDepositResult(res.data);
            setTxStatus('confirmed');
            return res.data;
          } else {
            // update local depositResult status if available
            if (res && res.data) setDepositResult(res.data);
          }
        } catch (e) {
          // ignore transient errors
        }
        const backoffMs = Math.min(intervalMs * Math.pow(1.1, Math.floor(i / 10)), 30000);
        await new Promise((r) => setTimeout(r, backoffMs));
      }
      setTxStatus('poll-timeout');
      return null;
    } catch (e) {
      setTxStatus(null);
      return null;
    }
  };

  // Report tx to server with backoff and start polling on success
  const reportTxAndStartPoll = async (txHash: string, to: string, amountDecimal: number | string) => {
    const maxAttempts = 6;
    let attempt = 0;
    let reported = false;
    let lastResp: any = null;

    // initial delay to allow TRON transaction to be mined
    setTxStatus('waiting-for-mine');
    await new Promise((r) => setTimeout(r, 5000));

    while (attempt < maxAttempts && !reported) {
      attempt++;
      try {
        const r = await api.post('/deposits/direct', { txHash, contract: tokenContract, toAddress: to, amount: amountDecimal });
        lastResp = { ok: true, body: r.data };
        if (r.status >= 200 && r.status < 300 && r.data && !r.data.error) {
          reported = true;
          setTxStatus('reported');
          const serverDepositId = r.data?.depositId || r.data?.id || null;
          if (serverDepositId) {
            // start polling the deposit status
            await pollDepositStatus(serverDepositId, 180, 5000);
          }
          return r.data;
        } else if (r.data && r.data.error && /not found|invalid/i.test(String(r.data.error))) {
          // retry - tx not found or invalid temporarily
        } else {
          // other non-fatal statuses, retry
        }
      } catch (e: any) {
        lastResp = { ok: false, body: (e?.response?.data || e?.message || String(e)) };
      }
      const backoff = Math.min(3000 * Math.pow(2, attempt - 1), 15000) + Math.floor(Math.random() * 500);
      setTxStatus(`retry-report-${attempt}`);
      await new Promise((r) => setTimeout(r, backoff));
    }
    setTxStatus('report-failed');
    // return last response for debugging
    return lastResp;
  };

  // helper: prompt TronLink to send TRC20 and return txHash
  const promptAndSendToken = async (to: string, amountDecimal: number | string) => {
    const w = (window as any).tronWeb;
    if (!w || !w.ready) throw new Error('TronLink not available or unlocked');
  const contract = await w.contract().at(tokenContract as string);
    const decimalsRaw = await contract.decimals().call();
    const decimals = Number(decimalsRaw?.toString?.() || decimalsRaw) || 6;
    const units = toBaseUnits(amountDecimal, decimals);
    const sendResult = await contract.transfer(to, units).send();
    if (!sendResult) return null;
    if (typeof sendResult === 'string') return sendResult;
    const txHash = sendResult.txID || sendResult.txid || (sendResult.transaction && sendResult.transaction.txID) || null;
    return txHash;
  };

  // history helpers
  const saveToHistory = async (entry: any) => {
    try {
      // Try to fetch the authoritative record from server first
      const id = entry.depositId || entry.id;
      if (id) {
        try {
          const res = await api.get(`/deposits/${id}`);
          if (res && res.data) {
            const item = res.data;
            const newList = [item, ...historyList].slice(0, 50);
            try { localStorage.setItem(STORAGE_KEYS.LOCAL_DEPOSITS, JSON.stringify(newList)); } catch(e){}
            setHistoryList(newList);
            return;
          }
        } catch (e) {
          // server not available or record missing, fall back to local storage
        }
      }
      // fallback: local-only save
      const key = STORAGE_KEYS.LOCAL_DEPOSITS;
      const raw = localStorage.getItem(key) || '[]';
      const arr = JSON.parse(raw);
      arr.unshift(entry);
      const sliced = arr.slice(0, 50);
      localStorage.setItem(key, JSON.stringify(sliced));
      setHistoryList(sliced);
    } catch (e) { console.error('saveToHistory', e); }
  };

  const fetchPublicList = async () => {
    try {
      const res = await api.get('/deposits/public');
      if (res && res.data) setPublicList(res.data || []);
    } catch (e) { /* ignore */ }
  };

  useEffect(() => {
    // fetch token contract config
    (async () => {
      try {
        const r = await api.get('/config/token');
        if (r && r.data && r.data.tokenContract) setTokenContract(r.data.tokenContract);
      } catch (e) { /* ignore */ }
    })();

    // attempt to fetch user deposits (authoritative history), fallback to local cache
    (async () => {
      try {
        const r = await api.get('/deposits');
        if (r && r.data) {
          setHistoryList(Array.isArray(r.data) ? r.data : []);
          try { localStorage.setItem(STORAGE_KEYS.LOCAL_DEPOSITS, JSON.stringify(Array.isArray(r.data) ? r.data : [])); } catch (e) {}
        } else {
          const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_DEPOSITS) || '[]';
          setHistoryList(JSON.parse(raw));
        }
      } catch (e) {
        try {
          const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_DEPOSITS) || '[]';
          setHistoryList(JSON.parse(raw));
        } catch (e) { setHistoryList([]); }
      }
    })();

    // fetch public deposits
    fetchPublicList();
  }, []);
  return (
    <div style={{ background: 'transparent', color: '#333333', fontFamily: 'Poppins, sans-serif', padding: 0 }}>
      <div style={{ maxWidth: '100%', margin: 0 }}>

        {/* TronLink Wallet Connection */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.avatar} style={{ background: '#413fbc' }}>🦊</div>
            <h2 className={styles.title}>Connect Wallet</h2>
          </div>

          {!walletConnected ? (
            <div>
              <p className={styles.subText}>Connect your TronLink wallet to enable automatic USDT deposits</p>
              <button
                className={styles.connectBtn}
                onClick={async () => {
                  try {
                    const w = (window as any).tronWeb;
                    if (!w) throw new Error('TronLink not detected in this browser');
                    if (w.request) { try { await w.request({ method: 'tron_requestAccounts' }); } catch(e) { /* ignore */ } }
                    const addr = w.defaultAddress?.base58 || '';
                    if (!addr) throw new Error('No account available. Unlock TronLink and try again.');
                    setWalletConnected(true);
                    setWalletAddress(addr);
                    setOutput(`✅ Connected to TronLink\nAddress: ${addr}`);
                  } catch (e: any) {
                    setOutput(`❌ Wallet connection failed: ${e?.message || e}`);
                  }
                }}
              >
                Connect TronLink
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className={styles.smallGreenDot}></div>
                <span style={{ color: '#00b638', fontWeight: '500' }}>Wallet Connected</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 14, wordBreak: 'break-all', marginBottom: 16 }}>
                {walletAddress}
              </div>
              <button
                className={styles.ghostBtn}
                onClick={() => {
                  setWalletConnected(false);
                  setWalletAddress('');
                  setOutput('🔌 Wallet disconnected');
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Deposit Form */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.avatar} style={{ background: '#00b638' }}>💰</div>
            <h2 className={styles.title}>Create USDT Deposit</h2>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const amount = parseFloat(formData.get('amount') as string);
            const depositData = { currency: 'USDT', amount, walletAddress: walletConnected ? walletAddress : undefined };
            if (!walletConnected) setOutput('⚠️ Wallet not connected — proceeding with manual flow (QR) after invoice creation');
            else setOutput('🔄 Creating deposit (auto flow)...');
            try {
              const response = await api.post('/deposits', depositData);
              const result = response.data;
              setDepositResult(result);
              setOutput(`✅ Deposit created successfully!\n\n${JSON.stringify(result, null, 2)}`);
              const paymentUrl = result.paymentUrl || result.checkout || result.checkoutLink || null;
              let recipient = result.walletAddress || null;
              if (!recipient && paymentUrl) {
                try { const u = new URL(paymentUrl); recipient = u.searchParams.get('address') || u.searchParams.get('recipient') || u.searchParams.get('to') || null; } catch(e) { /* ignore */ }
              }
              if (!recipient) {
                try { const sr = await api.get('/deposits/store/current/tron-address'); if (sr.data && sr.data.ok && sr.data.address) recipient = sr.data.address; } catch(e) { /* ignore */ }
              }
              if (walletConnected && recipient) {
                setOutput(`⏳ Prompting TronLink to send tokens to ${recipient}...`);
                try { const txHash = await promptAndSendToken(recipient, amount); if (!txHash) { setOutput('⚠️ Transaction was not submitted (user rejected or provider failed). No polling will start.'); return; } setOutput(`ℹ️ Reporting tx to server: ${txHash}`); await reportTxAndStartPoll(txHash, recipient, amount); } catch (err: any) { setOutput(`❌ Token transfer failed: ${err?.message || err}`); }
              } else if (!recipient) {
                setOutput('⚠️ No on-chain recipient found — showing QR/checkout link for manual payment');
              }
              const depositId = result.depositId || result.id || null;
              if (depositId && !walletConnected && paymentUrl) { setOutput(`🔎 Polling deposit status for ${depositId}...`); pollDepositStatus(depositId, 300, 10000); }
            } catch (error: any) { setOutput(`❌ Deposit creation failed: ${error?.response?.data?.message || error.message}`); }
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#666666' }}>Currency</label>
                <input name="currency" value="USDT" readOnly style={{ width: '100%', padding: 12, border: '1px solid #dadada', borderRadius: 8, background: '#f9f9f9', color: '#333333', fontSize: 16 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#666666' }}>Amount (USDT)</label>
                <input name="amount" type="number" step="0.000001" min="0.000001" required defaultValue={10} style={{ width: '100%', padding: 12, border: '1px solid #dadada', borderRadius: 8, background: '#ffffff', color: '#333333', fontSize: 16 }} />
              </div>
            </div>
            <button type="submit" disabled={!walletConnected} className={`${styles.primaryBtn} ${!walletConnected ? styles.disabled : ''}`}>{walletConnected ? 'Create USDT Deposit' : 'Connect Wallet First'}</button>
          </form>
        </div>

        {/* Output */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.avatar} style={{ background: '#413fbc' }}>📊</div>
            <h3 className={styles.title} style={{ fontSize: 20, margin: 0 }}>Status</h3>
          </div>
          <div className={styles.statusBox}>{output}</div>
        </div>

        {/* Deposit panel */}
        {depositResult && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar} style={{ background: '#413fbc' }}>📋</div>
              <h4 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#333333' }}>Deposit Details</h4>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.leftCol}>
                <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666666' }}>Invoice ID:</span>
                    <span className={styles.mono}>{depositResult.invoiceId || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666666' }}>Deposit ID:</span>
                    <span className={styles.mono}>{depositResult.depositId || depositResult.id || '-'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666666' }}>Transaction:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={styles.mono}>{depositResult.tx || '-'}</span>
                      {depositResult.txLink && (
                        <a href={depositResult.txLink} target="_blank" rel="noreferrer" className={styles.openIcon}>🔗</a>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className={styles.secondaryPurple} onClick={() => { const url = depositResult.paymentUrl || depositResult.checkout || depositResult.checkoutLink; if (url) window.open(url, '_blank'); }}>Open Invoice</button>
                  {depositResult.txLink && (<button className={styles.ghostBtn} onClick={() => window.open(depositResult.txLink, '_blank')}>View Transaction</button>)}
                  <button className={styles.ghostBtn} onClick={() => { saveToHistory({ depositId: depositResult.depositId || depositResult.id, invoiceId: depositResult.invoiceId, tx: depositResult.tx, txLink: depositResult.txLink, createdAt: new Date().toISOString() }); setOutput('💾 Saved deposit to local history'); }}>Save to History</button>
                </div>
              </div>

              <div className={styles.rightCol}>
                {(depositResult.paymentUrl || depositResult.checkout || depositResult.checkoutLink) && (
                  <div className={styles.qrBox}>
                    <QRCode value={depositResult.paymentUrl || depositResult.checkout || depositResult.checkoutLink} size={200} style={{ borderRadius: 8 }} />
                  </div>
                )}

                <div className={styles.importantBox}>
                  <strong>Important</strong>
                  <div style={{ marginTop: 8, color: '#7a5836', fontSize: 13 }}>
                    Use the QR code or the "Open Invoice" button above to complete the payment. The invoice (payment URL) is provided by BTCPay — always use this link/QR to pay. Do not send funds to addresses shown elsewhere. Wait for BTCPay confirmation (webhook) before considering the deposit settled.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History panel */}
        {historyList.length > 0 && (
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#f59e0b',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>📚</div>
              <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333333' }}>Deposit History</h4>
            </div>

            <div style={{ marginBottom: '16px' }}>
              {historyList.map((item, idx) => (
                <div key={idx} className={styles.historyItem}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#f59e0b' }}>{item.depositId || '-'}</strong>
                    {item.txLink && (
                      <a
                        href={item.txLink}
                        target="_blank"
                        style={{ color: '#413fbc', textDecoration: 'none', fontSize: '12px' }}
                      >
                        🔗 TX
                      </a>
                    )}
                  </div>
                  <div style={{ color: '#666666', fontSize: '12px' }}>
                    Invoice: {item.invoiceId || '-'} • TX: {item.tx || '-'}
                  </div>
                </div>
              ))}
            </div>

            <button
              style={{
                width: '100%',
                background: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#fef2f2'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fee2e2'}
              onClick={() => {
                localStorage.removeItem(STORAGE_KEYS.LOCAL_DEPOSITS);
                setHistoryList([]);
                setOutput('🧹 Cleared local history');
              }}
            >
              Clear History
            </button>
          </div>
        )}

        {/* Public panel */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #ebebeb',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#ec4899',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>🌐</div>
              <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333333' }}>Recent Deposits</h4>
            </div>
            <button
              style={{
                background: '#f9f9f9',
                border: '1px solid #dadada',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#333333',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f9f9f9'}
              onClick={fetchPublicList}
            >
              Refresh
            </button>
          </div>

          <div>
            {publicList.length > 0 ? publicList.map((item, idx) => (
              <div key={idx} style={{
                background: '#f9f9f9',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
                fontSize: '14px',
                border: '1px solid #dadada'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#00b638' }}>{item.depositId}</strong>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    background: item.status === 'CONFIRMED' ? '#00b638' : '#f59e0b',
                    color: 'white'
                  }}>
                    {item.status}
                  </span>
                </div>
                <div style={{ color: '#666666', fontSize: '12px', marginBottom: '4px' }}>
                  {item.currency} {item.amount} • {new Date(item.createdAt).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  {item.txHash && (
                    <a
                      href={((window as any)._NETWORK === 'mainnet') ? `https://tronscan.org/#/transaction/${item.txHash}` : `https://shasta.tronscan.org/#/transaction/${item.txHash}`}
                      target="_blank"
                      style={{ color: '#413fbc', textDecoration: 'none' }}
                    >
                      🔗 TX
                    </a>
                  )}
                  {item.invoiceId && (
                    <span style={{ color: '#666666', fontFamily: 'monospace' }}>
                      {item.invoiceId}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: '#666666', padding: '40px' }}>
                Loading recent deposits...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankProcess;
