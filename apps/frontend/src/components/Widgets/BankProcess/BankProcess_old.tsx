/* eslint-disable no-unused-vars, no-console */
import { useState, useEffect } from "react";
import api from "../../../lib/api";
import QRCode from "react-qr-code";

// components
import Box from "../../Common/Box";

// interfaces
interface IBankDetails {
  id: number;
  name: string;
  iban: string;
  logo: string;
  branch: string;
}

// constants
const TOKEN_CONTRACT = "TQwXRK7EqDitMDhHNnTKPGpT9ZohJUxe3q";

// variables
const dataArray: IBankDetails[] = [
  {
    id: 1,
    name: "Ziraat Bank",
    branch: "Ataşehir Branch",
    iban: "TR01 0000 0000 0000 0000 0000 01",
    logo: "https://mekaskablo.com/wp-content/uploads/2019/11/ziraat-bankas%C4%B1-logo.jpg",
  },
  {
    id: 2,
    name: "Garanti BBVA Bank",
    branch: "Etiler Branch",
    iban: "TR02 0000 0000 0000 0000 0000 02",
    logo: "https://upload.wikimedia.org/wikipedia/tr/7/75/Garanti_BBVA.png",
  },
  {
    id: 3,
    name: "Yapı ve Kredi Bank",
    branch: "Şişli Branch",
    iban: "TR03 0000 0000 0000 0000 0000 03",
    logo: "data:image/png;base64,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",
  },
];

const BankProcess: React.FC = () => {
  const [tab, setTab] = useState<number>(0);
  const [bankDetails, setBankDetails] = useState<IBankDetails[]>([]);
  const [selectedBank, setSelectedBank] = useState<IBankDetails | null>(null);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [output, setOutput] = useState<string>("Ready to create deposit...");
  const [publicList, setPublicList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);

  // Helper: convert decimal amount to integer base units as BigInt string
  const toBaseUnits = (amount: number | string, decimals: number) => {
    const s = String(amount);
    if (!s.includes(".")) return BigInt(s + "0".repeat(decimals)).toString();
    const [whole, frac] = s.split(".");
    const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
    const combined = (whole + fracPadded).replace(/^0+/, "") || "0";
    return BigInt(combined).toString();
  };

  // Poll deposit status until CONFIRMED or timeout
  const pollDepositStatus = async (
    depositId: string | number,
    attempts = 180,
    intervalMs = 5000
  ) => {
    try {
      setTxStatus("polling-deposit");
      // initial short wait to allow chain confirmation
      await new Promise((r) => setTimeout(r, 10000));
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await api.get(`/deposits/${depositId}`);
          if (res && res.data && res.data.status === "CONFIRMED") {
            setDepositResult(res.data);
            setTxStatus("confirmed");
            return res.data;
          } else {
            // update local depositResult status if available
            if (res && res.data) setDepositResult(res.data);
          }
        } catch (e) {
          // ignore transient errors
        }
        const backoffMs = Math.min(
          intervalMs * Math.pow(1.1, Math.floor(i / 10)),
          30000
        );
        await new Promise((r) => setTimeout(r, backoffMs));
      }
      setTxStatus("poll-timeout");
      return null;
    } catch (e) {
      setTxStatus(null);
      return null;
    }
  };

  // Report tx to server with backoff and start polling on success
  const reportTxAndStartPoll = async (
    txHash: string,
    to: string,
    amountDecimal: number | string
  ) => {
    const maxAttempts = 6;
    let attempt = 0;
    let reported = false;
    let lastResp: any = null;

    // initial delay to allow TRON transaction to be mined
    setTxStatus("waiting-for-mine");
    await new Promise((r) => setTimeout(r, 5000));

    while (attempt < maxAttempts && !reported) {
      attempt++;
      try {
        const r = await api.post("/deposits/direct", {
          txHash,
          contract: TOKEN_CONTRACT,
          toAddress: to,
          amount: amountDecimal,
        });
        lastResp = { ok: true, body: r.data };
        if (r.status >= 200 && r.status < 300 && r.data && !r.data.error) {
          reported = true;
          setTxStatus("reported");
          const serverDepositId = r.data?.depositId || r.data?.id || null;
          if (serverDepositId) {
            // start polling the deposit status
            await pollDepositStatus(serverDepositId, 180, 5000);
          }
          return r.data;
        } else if (
          r.data &&
          r.data.error &&
          /not found|invalid/i.test(String(r.data.error))
        ) {
          // retry - tx not found or invalid temporarily
        } else {
          // other non-fatal statuses, retry
        }
      } catch (e: any) {
        lastResp = {
          ok: false,
          body: e?.response?.data || e?.message || String(e),
        };
      }
      const backoff =
        Math.min(3000 * Math.pow(2, attempt - 1), 15000) +
        Math.floor(Math.random() * 500);
      setTxStatus(`retry-report-${attempt}`);
      await new Promise((r) => setTimeout(r, backoff));
    }
    setTxStatus("report-failed");
    // return last response for debugging
    return lastResp;
  };

  // helper: prompt TronLink to send TRC20 and return txHash
  const promptAndSendToken = async (
    to: string,
    amountDecimal: number | string
  ) => {
    const w = (window as any).tronWeb;
    if (!w || !w.ready) throw new Error("TronLink not available or unlocked");
    const contract = await w.contract().at(TOKEN_CONTRACT);
    const decimalsRaw = await contract.decimals().call();
    const decimals = Number(decimalsRaw?.toString?.() || decimalsRaw) || 6;
    const units = toBaseUnits(amountDecimal, decimals);
    const sendResult = await contract.transfer(to, units).send();
    if (!sendResult) return null;
    if (typeof sendResult === "string") return sendResult;
    const txHash =
      sendResult.txID ||
      sendResult.txid ||
      (sendResult.transaction && sendResult.transaction.txID) ||
      null;
    return txHash;
  };

  // history helpers
  const saveToHistory = (entry: any) => {
    try {
      const key = "local_deposits";
      const raw = localStorage.getItem(key) || "[]";
      const arr = JSON.parse(raw);
      arr.unshift(entry);
      const sliced = arr.slice(0, 50);
      localStorage.setItem(key, JSON.stringify(sliced));
      setHistoryList(sliced);
    } catch (e) {
      console.error("saveToHistory", e);
    }
  };

  const fetchPublicList = async () => {
    try {
      const res = await api.get("/deposits/public");
      if (res && res.data) setPublicList(res.data || []);
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    setBankDetails(dataArray);

    setSelectedBank(dataArray[0]);
    // load local history
    try {
      const raw = localStorage.getItem("local_deposits") || "[]";
      setHistoryList(JSON.parse(raw));
    } catch (e) {
      setHistoryList([]);
    }
    // fetch public deposits
    fetchPublicList();
  }, []);

  /**
   * Handles the change event for the bank selection dropdown.
   * Prevents the default event behavior, extracts the value from the target element,
   * finds the corresponding bank details based on the value, and updates the selected bank state.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e - The change event object.
   */
  const handleViewOnChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    e.preventDefault();

    const { value } = e.target;

    const findBank = bankDetails.find(
      (item: IBankDetails) => item.id === +value
    );

    if (findBank) {
      setSelectedBank(findBank);
    }
  };

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div className="flex flex-center flex-space-between">
          <div>
            <p>Deposit / Withdraw</p>
          </div>
          <ul>
            <li>
              <button
                type="button"
                onClick={() => setTab(0)}
                className={tab === 0 ? "active" : "passive"}
              >
                Deposit
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setTab(1)}
                className={tab === 1 ? "active" : "passive"}
              >
                Withdraw
              </button>
            </li>
          </ul>
        </div>
      </div>
      {tab === 0 && (
        <div className="box-content box-horizontal-padding box-vertical-padding box-content-height-nobutton">
          <form noValidate className="form">
            <div className="form-elements">
              <div className="form-line">
                <div className="full-width">
                  <label htmlFor="view">View bank details</label>
                  <select name="view" id="view" onChange={handleViewOnChange}>
                    {bankDetails &&
                      bankDetails.map((item: IBankDetails) => (
                        <option key={item.id.toString()} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </form>

          <div className="box-text flex flex-center flex-space-between">
            {selectedBank && (
              <>
                <div className="bank-info box-horizontal-padding">
                  <img
                    height="35"
                    src={selectedBank.logo}
                    alt="Bank logo"
                    draggable="false"
                  />
                  <p>
                    <strong>
                      {selectedBank.name} - {selectedBank.branch}
                    </strong>
                    <br />
                    {selectedBank.iban}
                  </p>
                </div>
                <button type="button" className="pointer red no-select">
                  <i className="material-icons">content_copy</i>
                </button>
              </>
            )}
          </div>
          <div className="box-vertical-padding">
            <label htmlFor="amount">Amount (USD)</label>
            <input
              id="amount"
              type="number"
              min="1"
              placeholder="100"
              value={""}
            />
            <label htmlFor="wallet">Wallet address (optional)</label>
            <input id="wallet" type="text" placeholder="T..." />
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                className="button button-small"
                onClick={async () => {
                  // Connect TronLink (if available)
                  try {
                    const w = (window as any).tronWeb;
                    if (!w)
                      throw new Error("TronLink not detected in this browser");
                    // request accounts if supported
                    if (w.request) {
                      try {
                        await w.request({ method: "tron_requestAccounts" });
                      } catch (e) {
                        /* ignore */
                      }
                    }
                    const addr = w.defaultAddress?.base58 || "";
                    if (!addr)
                      throw new Error(
                        "No account available. Unlock TronLink and try again."
                      );
                    setWalletConnected(true);
                    setWalletAddress(addr);
                    setOutput("Connected TronLink: " + addr);
                  } catch (e: any) {
                    setOutput("Connect failed: " + (e?.message || e));
                  }
                }}
              >
                Connect TronLink
              </button>
              <button
                type="button"
                className="button button-medium button-purple"
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  // Create deposit then attempt auto-send via TronLink using robust helpers
                  try {
                    const amountEl = document.getElementById(
                      "amount"
                    ) as HTMLInputElement;
                    const walletEl = document.getElementById(
                      "wallet"
                    ) as HTMLInputElement;
                    const amount = Number(amountEl?.value || 100);
                    const walletAddr = walletEl?.value || undefined;

                    const payload: any = {
                      amount: amount.toString(),
                      currency: "USDT-TRON",
                    };
                    if (walletAddr) payload.walletAddress = walletAddr;

                    setTxStatus("creating-deposit");
                    setOutput("Creating deposit...");
                    const res = await api.post("/deposits", payload);
                    const result = res.data;
                    setDepositResult(result || null);
                    setTxStatus("deposit-created");
                    setOutput("Deposit created. Preparing recipient...");

                    // derive recipient: prefer server walletAddress, then try to parse paymentUrl or call store/current/tron-address
                    let recipient: string | null =
                      result?.walletAddress || null;
                    const paymentUrl =
                      result?.paymentUrl ||
                      result?.checkout ||
                      result?.checkoutLink ||
                      null;
                    if (!recipient && paymentUrl) {
                      try {
                        const u = new URL(paymentUrl);
                        recipient =
                          u.searchParams.get("address") ||
                          u.searchParams.get("recipient") ||
                          u.searchParams.get("to") ||
                          null;
                      } catch (e) {
                        /* ignore */
                      }
                    }
                    if (!recipient) {
                      // fallback to server-derived store address
                      try {
                        const sr = await api.get(
                          "/deposits/store/current/tron-address"
                        );
                        if (sr.data && sr.data.ok && sr.data.address)
                          recipient = sr.data.address;
                      } catch (e) {
                        /* ignore */
                      }
                    }

                    if (!recipient) {
                      setTxStatus(null);
                      setOutput(
                        "No on-chain recipient available. Please use manual checkout/QR."
                      );
                      return;
                    }

                    setOutput(
                      `Prompting TronLink to send tokens to ${recipient}...`
                    );
                    setTxStatus("prompting-wallet");

                    // prompt and send
                    const txHash = await promptAndSendToken(recipient, amount);
                    if (!txHash) {
                      setTxStatus(null);
                      setOutput(
                        "Transaction not submitted or user rejected the request."
                      );
                      return;
                    }

                    setTxStatus("reporting-tx");
                    setOutput(`Reporting tx ${txHash} to server...`);
                    const report = await reportTxAndStartPoll(
                      txHash,
                      recipient,
                      amount
                    );
                    setTxStatus("reported");
                    setOutput(
                      "Transaction reported — server response: " +
                        JSON.stringify(report)
                    );

                    // save to history
                    saveToHistory({
                      depositId: report?.depositId || result?.depositId || null,
                      invoiceId: result?.invoiceId || null,
                      tx: txHash,
                      txLink:
                        (window as any)._NETWORK === "mainnet"
                          ? `https://tronscan.org/#/transaction/${txHash}`
                          : `https://shasta.tronscan.org/#/transaction/${txHash}`,
                      createdAt: new Date().toISOString(),
                    });
                  } catch (err: any) {
                    setTxStatus(null);
                    setOutput(
                      "Auto-send failed: " +
                        (err?.response?.data?.message ||
                          err?.message ||
                          String(err))
                    );
                  }
                }}
              >
                Send from Wallet (auto)
              </button>
            </div>
            <div className="box-vertical-padding">
              <button
                type="button"
                className="button button-purple button-medium"
                onClick={async () => {
                  try {
                    const amountEl = document.getElementById(
                      "amount"
                    ) as HTMLInputElement;
                    const walletEl = document.getElementById(
                      "wallet"
                    ) as HTMLInputElement;
                    const amount = Number(amountEl?.value || 100);
                    const walletAddr = walletEl?.value || undefined;

                    const payload: any = {
                      amount: amount.toString(),
                      currency: "USDT-TRON",
                    };
                    if (walletAddr) payload.walletAddress = walletAddr;

                    const res = await api.post("/deposits", payload);
                    // store response for rendering payment link / invoice / deposit id
                    setDepositResult(res.data || null);
                    setOutput("Deposit created — see payment panel below");
                    setTxStatus("deposit-created-manual");
                    // if manual/checkout flow: start long polling for deposit if depositId exists
                    const depositId =
                      res.data?.depositId || res.data?.id || null;
                    const paymentUrl =
                      res.data?.paymentUrl ||
                      res.data?.checkout ||
                      res.data?.checkoutLink ||
                      null;
                    if (depositId && !walletConnected && paymentUrl) {
                      // longer polling window for manual payments
                      setOutput(
                        `Created manual deposit ${depositId}. Polling for confirmation...`
                      );
                      pollDepositStatus(depositId, 300, 10000);
                    }
                  } catch (err: any) {
                    setOutput(
                      "Deposit failed: " +
                        (err?.response?.data?.message || err.message)
                    );
                  }
                }}
              >
                Create Deposit
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <strong>Status:</strong> {output}
              {txStatus && (
                <div>
                  <strong>TX Status:</strong> {txStatus}
                </div>
              )}
            </div>
            {depositResult && (
              <div
                style={{
                  marginTop: 12,
                  background: "var(--surface)",
                  padding: 12,
                  borderRadius: 6,
                }}
              >
                <div>
                  <strong>Invoice:</strong>{" "}
                  {depositResult.invoiceId || depositResult.invoice || "-"}
                </div>
                <div>
                  <strong>Deposit ID:</strong>{" "}
                  {depositResult.depositId || depositResult.id || "-"}
                </div>
                <div>
                  <strong>Payment URL:</strong>{" "}
                  {depositResult.paymentUrl ||
                  depositResult.checkout ||
                  depositResult.checkoutLink ? (
                    <a
                      href={
                        depositResult.paymentUrl ||
                        depositResult.checkout ||
                        depositResult.checkoutLink
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open payment link
                    </a>
                  ) : (
                    <span className="address">
                      {depositResult.walletAddress || "No payment URL provided"}
                    </span>
                  )}
                </div>
                {(depositResult.paymentUrl ||
                  depositResult.checkout ||
                  depositResult.checkoutLink) && (
                  <div style={{ marginTop: 8 }}>
                    <QRCode
                      value={
                        depositResult.paymentUrl ||
                        depositResult.checkout ||
                        depositResult.checkoutLink
                      }
                      size={128}
                    />
                  </div>
                )}
                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    className="button button-small"
                    onClick={() => {
                      const url =
                        depositResult.paymentUrl ||
                        depositResult.checkout ||
                        depositResult.checkoutLink;
                      if (url) window.open(url, "_blank");
                    }}
                  >
                    Open Invoice
                  </button>
                  {depositResult.tx && depositResult.txLink && (
                    <button
                      type="button"
                      className="button button-small"
                      style={{ marginLeft: 8 }}
                      onClick={() =>
                        window.open(depositResult.txLink, "_blank")
                      }
                    >
                      Open TX
                    </button>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <h3>Deposit History</h3>
              {historyList.length > 0 ? (
                <ul>
                  {historyList.map((item, idx) => (
                    <li key={idx}>
                      Deposit {item.depositId || item.id} - Invoice:{" "}
                      {item.invoiceId} - TX:{" "}
                      {item.tx ? (
                        <a href={item.txLink} target="_blank" rel="noreferrer">
                          {item.tx.slice(0, 10)}...
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No history</p>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <h3>Public Deposits</h3>
              {publicList.length > 0 ? (
                <ul>
                  {publicList.map((item, idx) => (
                    <li key={idx}>
                      Deposit {item.id} - Status: {item.status} - Amount:{" "}
                      {item.amount}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No public deposits</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="box-content box-horizontal-padding box-vertical-padding box-content-height-nobutton">
          <form noValidate className="form">
            <div className="form-elements">
              <div className="form-line">
                <div className="full-width">
                  <label htmlFor="iban">Add IBAN</label>
                  <input
                    type="text"
                    name="iban"
                    id="iban"
                    placeholder="Enter IBAN number"
                  />
                </div>
              </div>
            </div>
          </form>

          <form noValidate className="form">
            <div className="form-elements">
              <div className="form-line">
                <div className="full-width">
                  <label htmlFor="view">Saved IBANs</label>
                  <select name="view" id="view">
                    <option value="ZB">Ziraat Bank</option>
                  </select>
                </div>
              </div>
            </div>
          </form>

          <div className="box-text box-horizontal-padding center">
            <p>
              <strong>TR00 0000 0000 0000 0000 0000 00</strong>
            </p>
            <p>
              <span>Withdrawal amount : </span>
              <strong>2376.00 TL</strong>
            </p>
          </div>

          <button
            type="button"
            className="button button-purple button-medium button-block"
          >
            Withdraw money
          </button>
        </div>
      )}
    </Box>
  );
};

export default BankProcess;
