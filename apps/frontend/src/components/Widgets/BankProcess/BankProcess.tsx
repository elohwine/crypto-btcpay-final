import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Select,
  TextInput,
  Button,
  Alert,
  Tooltip,
  Modal,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconCoin,
  IconCopy,
  IconExternalLink,
  IconWallet,
  IconInfoCircle,
  IconCheck,
  IconAlertCircle,
  IconCurrencyBitcoin,
  IconLoader,
  IconGift,
} from "@tabler/icons-react";
import { renderToStaticMarkup } from "react-dom/server";
import api from "../../../lib/api";
import { notify } from "../../../ui/notifications/notify";
import QRWithLogo from "../../QRWithLogo";
import LottiePlayer from "../../LottiePlayer/LottiePlayer";
import SuccessAnim from "../../../assets/lottie/Success.json";
import FailedAnim from "../../../assets/lottie/Failed.json";
import styles from "./BankProcess.module.css";
import { useAppTheme, hexToRgba } from "../../../lib/themeUtils";

const TOKEN_CONTRACT = "TQwXRK7EqDitMDhHNnTKPGpT9ZohJUxe3q";

const BankProcess: React.FC = () => {
  const { primary, contrast } = useAppTheme();
  const [tab, setTab] = useState<number>(0);
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [txStatus, setTxStatus] = useState<string | null>(null);
  const [depositResult, setDepositResult] = useState<any>(null);
  const [output, setOutput] = useState<string>("Ready to create deposit...");
  const [currencySelected, setCurrencySelected] = useState<string>("USDT");
  const [lastReportAttempt, setLastReportAttempt] = useState<any>(null);
  const [publicList, setPublicList] = useState<any[]>([]);
  const [, setHistoryList] = useState<any[]>([]);
  const [recentPage, setRecentPage] = useState<number>(1);
  const PAGE_SIZE = 5;

  const [selectedNetwork, setSelectedNetwork] = useState<string>("TRC20");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState<boolean>(false);
  const [storeTronAddress, setStoreTronAddress] = useState<string | null>(null);
  const [manualTxHash, setManualTxHash] = useState<string>("");
  const [lastRequestedAmount, setLastRequestedAmount] = useState<number | null>(null);
  const [lottieModalOpen, setLottieModalOpen] = useState<boolean>(false);
  const [lottieType, setLottieType] = useState<"success" | "failed" | null>(
    null
  );
  const [selectedPlanInfo, setSelectedPlanInfo] = useState<any>(null);
  const [prefillAmount, setPrefillAmount] = useState<number | null>(null);
  const location = useLocation();
  const NETWORKS: { key: string; label: string }[] = [
    { key: "BTC", label: "BTC" },
    { key: "TRC20", label: "TRC20 (TRON)" },
  ];

  // Withdrawal State
  const [withdrawMode, setWithdrawMode] = useState<"standard" | "instant">("standard");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawAddress, setWithdrawAddress] = useState<string>("");

  // convert decimals to base units
  const toBaseUnits = (amount: number | string, decimals: number) => {
    const s = String(amount);
    if (!s.includes(".")) return BigInt(s + "0".repeat(decimals)).toString();
    const [whole, frac] = s.split(".");
    const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
    const combined = (whole + fracPadded).replace(/^0+/, "") || "0";
    return BigInt(combined).toString();
  };

  // poll deposit until confirmed or timeout
  const pollDepositStatus = async (
    depositId: string | number,
    attempts = 180,
    intervalMs = 5000
  ) => {
    try {
      setTxStatus("polling-deposit");
      await new Promise((r) => setTimeout(r, 10000));
      for (let i = 0; i < attempts; i++) {
        try {
          const res = await api.get(`/deposits/${depositId}`);
          if (res && res.data && res.data.status === "CONFIRMED") {
            setDepositResult(res.data);
            setTxStatus("confirmed");
            try {
              notify.success("Deposit confirmed and settled");
            } catch (e) {
              /* ignore */
            }
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
    amountDecimal: number | string,
    depositId?: string | number
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
          network: selectedNetwork,
          depositId // Include depositId if available
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
    amountDecimal: number | string,
    currency?: string
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
      if (res && res.data) {
        // Ensure data is an array to prevent .map() crashes
        if (Array.isArray(res.data)) {
          setPublicList(res.data);
        } else {
          console.warn("Public deposits list is not an array:", res.data);
          setPublicList([]);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
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

  useEffect(() => {
    if (location.state) {
      const { selectedPlan, prefillAmount: amount } = location.state as any;
      if (selectedPlan) {
        setSelectedPlanInfo(selectedPlan);
      }
      if (amount) {
        setPrefillAmount(amount);
      }
    }
  }, [location.state]);

  // fetch store default TRON address to use as QR fallback when invoice/paymentUrl is missing
  useEffect(() => {
    let mounted = true;
    const fetchAddr = async () => {
      try {
        const res = await api.get("/deposits/store/current/tron-address");
        if (!mounted) return;
        if (res?.data && res.data.ok && res.data.address)
          setStoreTronAddress(res.data.address);
      } catch (e) {
        // ignore
      }
    };
    fetchAddr();
    return () => {
      mounted = false;
    };
  }, []);

  // show a centered Lottie modal on success/failure after the deposit status changes
  useEffect(() => {
    if (!depositResult || !depositResult.status) return;
    if (depositResult.status === "CONFIRMED") {
      setLottieType("success");
      setLottieModalOpen(true);
      const t = setTimeout(() => setLottieModalOpen(false), 3500);
      return () => clearTimeout(t);
    }
    if (depositResult.status === "FAILED" || depositResult.status === "ERROR") {
      setLottieType("failed");
      setLottieModalOpen(true);
      const t = setTimeout(() => setLottieModalOpen(false), 3500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [depositResult?.status]);

  // derive QR payload: prefer BTCPay paymentUrl/checkout; otherwise construct a simple on-chain URI
  const qrValue = (() => {
    const pv =
      depositResult?.paymentUrl ||
      depositResult?.checkout ||
      depositResult?.checkoutLink;
    if (pv) return pv;
    // try deposit result wallet addr first, then the store default address
    const addr =
      depositResult?.walletAddress ||
      depositResult?.address ||
      storeTronAddress ||
      null;
    const amt = depositResult?.amount || depositResult?.value || null;
    if (addr) {
      // TRON URI: tron:<address>?amount=<decimal>
      return `tron:${addr}${amt ? `?amount=${amt}` : ""}`;
    }
    return "";
  })();

  // Build a data URL from either a small inline SVG (USDT) or by rendering a Tabler icon to SVG
  const getLogoDataUrl = (currency: string | undefined | null) => {
    try {
      const cur = (currency || "USDT").toString();
      if (!cur) return null;
      // pull a few runtime colors from :root so generated images match the active theme
      const rootStyles =
        typeof window !== "undefined"
          ? getComputedStyle(document.documentElement)
          : null;
      const surfaceCol =
        rootStyles?.getPropertyValue("--surface")?.trim() || "#f0f0f0";
      const textCol = rootStyles?.getPropertyValue("--text")?.trim() || "#222";
      const contrastCol =
        rootStyles?.getPropertyValue("--primary-contrast")?.trim() || "#ffffff";
      const usdtCol =
        rootStyles?.getPropertyValue("--usdt")?.trim() || "#00b638";
      const btcCol = rootStyles?.getPropertyValue("--btc")?.trim() || "#f7931a";

      // USDT inline svg (brand green circle with themed white mark)
      if (cur.toLowerCase().startsWith("usdt")) {
        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="11" fill="${usdtCol}" />\n  <path d="M8 12.5c0-1.5 3-1.75 4.5-1.75 1.5 0 4.5.25 4.5 1.75s-3 1.75-4.5 1.75C11 14.25 8 14 8 12.5z" fill="${contrastCol}" opacity="0.95" />\n  <path d="M12 7.5v9" stroke="${contrastCol}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />\n</svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      }

      // BTC (and other currencies we map to Tabler icons) — render the Tabler icon and place it on a colored circle background
      if (cur.toLowerCase().includes("btc")) {
        const iconSvg = renderToStaticMarkup(
          <IconCurrencyBitcoin
            size={20}
            strokeWidth={1.5}
            stroke={contrastCol}
          />
        );
        const inner = iconSvg
          .replace(/^<svg[^>]*>/, "")
          .replace(/<\/svg>$/, "");
        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="12" fill="${btcCol}"/>\n  ${inner}\n</svg>`;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
      }

      // generic fallback with text label — use themed surface/text
      const fallback = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">\n  <rect width="64" height="64" rx="12" fill="${surfaceCol}"/>\n  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size=18 fill="${textCol}">${cur}</text>\n</svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(fallback)}`;
    } catch (e) {
      return null;
    }
  };

  // submit handler
  const handleCreateDeposit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get("amount") as string);
    const currency = String(formData.get("currency") || "USDT");

    // basic validation: amount must be a finite positive number
    if (!Number.isFinite(amount) || amount <= 0) {
      const msg = "Enter a valid deposit amount greater than 0";
      notify.error(msg);
      setOutput(`❌ ${msg}`);
      return;
    }

    const depositData: any = {
      currency,
      amount,
      walletAddress: walletConnected ? walletAddress : undefined,
      network: selectedNetwork,
    };
    setLastRequestedAmount(amount);

    if (!walletConnected)
      setOutput(
        "⚠️ Wallet not connected — proceeding with manual flow (QR) after invoice creation"
      );
    else setOutput("🔄 Creating deposit (auto flow)...");

    try {
      const response = await api.post("/deposits", depositData);
      const result = response.data;
      setDepositResult(result);
      setOutput(
        `✅ Deposit created successfully!\n\n${JSON.stringify(result, null, 2)}`
      );
      notify.success("Deposit created successfully");

      const paymentUrl =
        result.paymentUrl || result.checkout || result.checkoutLink || null;
      let recipient = result.walletAddress || null;

      if (!recipient && paymentUrl) {
        try {
          const u = new URL(paymentUrl);
          recipient =
            u.searchParams.get("address") ||
            u.searchParams.get("recipient") ||
            u.searchParams.get("to");
        } catch (e) {
          // ignore
        }
      }

      // If wallet connected, prompt user to send immediately
      if (walletConnected && recipient && amount > 0) {
        setOutput(
          `🚀 Prompting wallet to send ${amount} ${currency} to ${recipient}...`
        );
        try {
          await promptAndSendToken(recipient, amount, currency);
          setOutput("✅ Wallet transaction sent! Reporting to server...");
        } catch (err: any) {
          const em = err?.message || String(err);
          if (em.includes("User rejected") || em.includes("declined")) {
            setOutput("⚠️ Transaction declined by user.");
          } else {
            setOutput(`❌ Wallet Error: ${em}`);
          }
          // do not return, we still have the deposit record created
        }
      }

      // Start polling for status
      if (result.depositId || result.id) {
        reportTxAndStartPoll(
          result.txHash || "",
          recipient || "",
          amount,
          result.depositId || result.id
        );
      } else {
        // fallback if no ID returned
        setDepositResult(result);
        saveToHistory({ ...result, amount });
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Deposit failed";
      notify.error(msg);
      setOutput(`❌ Error: ${msg}`);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) {
      notify.error("Please enter amount and address");
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 10) {
      notify.error("Minimum withdrawal amount is $10");
      return;
    }

    try {
      // In a real app, this would call the backend
      // await api.post('/withdrawals', { amount, address: withdrawAddress, mode: withdrawMode });

      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      notify.success(`Withdrawal request for $${amount} (${withdrawMode}) submitted!`);

      // Reset form
      setWithdrawAmount("");
      setWithdrawAddress("");

      // Add to log (optimistic update)
      const newLog = {
        depositId: `W-${Date.now().toString().slice(-6)}`,
        status: withdrawMode === 'instant' ? 'PROCESSING' : 'PENDING',
        currency: 'USDT',
        amount: amount.toString(),
        createdAt: new Date().toISOString(),
        txHash: '',
        invoiceId: ''
      };

      setPublicList(prev => [newLog, ...prev]);

    } catch (error: any) {
      notify.error("Withdrawal failed. Please try again.");
    }
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", color: "var(--text)" }}>
      <Modal
        opened={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Invoice preview"
        size="lg"
      >
        {(() => {
          const url =
            depositResult?.paymentUrl ||
            depositResult?.checkout ||
            depositResult?.checkoutLink;
          if (url) {
            return (
              <div style={{ height: 520 }}>
                <iframe
                  src={url}
                  title="invoice-preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 8,
                  }}
                />
              </div>
            );
          }
          return <div style={{ padding: 24 }}>No invoice available yet</div>;
        })()}
      </Modal>
      {/* Centered Lottie modal for success / failure feedback */}
      <Modal
        opened={lottieModalOpen}
        onClose={() => setLottieModalOpen(false)}
        title={
          lottieType === "success" ? "Deposit confirmed" : "Deposit status"
        }
        size="sm"
        centered
        zIndex={99999999}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          }}
        >
          {lottieType === "success" && (
            <div
              aria-hidden
              style={{
                borderRadius: 12,
                padding: 8,
                pointerEvents: "none",
              }}
            >
              <LottiePlayer
                animationData={SuccessAnim}
                loop={false}
                autoplay
                style={{ width: 240, height: 240 }}
              />
            </div>
          )}
          {lottieType === "failed" && (
            <div
              aria-hidden
              style={{
                borderRadius: 12,
                padding: 8,
                pointerEvents: "none",
              }}
            >
              <LottiePlayer
                animationData={FailedAnim}
                loop={false}
                autoplay
                style={{ width: 240, height: 240 }}
              />
            </div>
          )}
          <div
            style={{ marginTop: 8, fontWeight: 700, color: "var(--primary)" }}
          >
            {lottieType === "success" ? "Deposit confirmed" : "Deposit failed"}
          </div>
        </div>
      </Modal>
      {/* Tabs */}
      <div className={styles.card} style={{ marginBottom: 16, padding: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant={tab === 0 ? "filled" : "subtle"}
            color={tab === 0 ? "blue" : "gray"}
            onClick={() => setTab(0)}
            fullWidth
          >
            Deposit
          </Button>
          <Button
            variant={tab === 1 ? "filled" : "subtle"}
            color={tab === 1 ? "blue" : "gray"}
            onClick={() => setTab(1)}
            fullWidth
          >
            Withdraw
          </Button>
        </div>
      </div>

      {tab === 0 && (
        <>
          {/* Wallet / network card */}
          <div className={styles.card} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: primary,
                  color: contrast,
                }}
                aria-hidden
              >
                <IconWallet size={18} color={contrast} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  Select Network & Connect Wallet
                </div>
                <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                  Connect TronLink to enable auto deposits or create manual invoice
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {NETWORKS.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setSelectedNetwork(n.key)}
                  className={styles.ghostBtn}
                  aria-pressed={selectedNetwork === n.key}
                  aria-label={`Select ${n.label}`}
                >
                  {n.label}
                </button>
              ))}

              {!walletConnected ? (
                <Button
                  className={styles.connectBtn}
                  style={{ marginLeft: "auto" }}
                  onClick={async () => {
                    try {
                      const w = (window as any).tronWeb;
                      if (!w) throw new Error("TronLink not present");
                      if (w.request) {
                        try {
                          await w.request({ method: "tron_requestAccounts" });
                        } catch (e) {
                          /* ignore */
                        }
                      }
                      const addr = w.defaultAddress?.base58 || "";
                      if (!addr) throw new Error("Unlock TronLink");
                      setWalletConnected(true);
                      setWalletAddress(addr);
                      setOutput(`✅ Connected\n${addr}`);
                    } catch (e: any) {
                      setOutput(`❌ ${e?.message || e}`);
                    }
                  }}
                >
                  Connect
                </Button>
              ) : (
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div className={styles.connectedDot} />
                    <div className={styles.connectedText}>Connected</div>
                  </div>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={() => {
                      navigator.clipboard?.writeText(walletAddress || "");
                      notify.success("Copied address");
                    }}
                  >
                    <IconCopy size={14} />
                    <span style={{ marginLeft: 8 }}>Copy</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Unified header */}
          <div className={styles.unifiedHeader} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div
                  style={{
                    padding: "10px 18px",
                    borderRadius: "999px",
                    fontSize: 24,
                    fontWeight: 600,
                    color: "var(--text)",
                    border: `1px solid ${hexToRgba(primary, 0.06)}`,
                  }}
                >
                  Deposit
                </div>
              </div>
              <div className={styles.headerAccent} aria-hidden />
            </div>
          </div>

          {/* Columns */}
          <div className={styles.columns}>
            {/* Left column */}
            <div className={styles.leftCol}>
              <div className={`${styles.card} ${styles.cardInnerFill}`}>
                {/* Currency badge uses vertical space above the form */}
                <div className={styles.currencyBadgeContainer}>
                  <div className={styles.currencyBadge} aria-hidden>
                    {currencySelected === "USDT" ? (
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="11"
                          fill="var(--usdt, #00b638)"
                        />
                        <path
                          d="M8 12.5c0-1.5 3-1.75 4.5-1.75 1.5 0 4.5.25 4.5 1.75s-3 1.75-4.5 1.75C11 14.25 8 14 8 12.5z"
                          fill="var(--primary-contrast)"
                          opacity="0.95"
                        />
                        <path
                          d="M12 7.5v9"
                          stroke="var(--primary-contrast)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <img
                        src={getLogoDataUrl(currencySelected) || ""}
                        alt={currencySelected}
                        width={64}
                        height={64}
                        style={{ borderRadius: "50%" }}
                      />
                    )}
                  </div>
                </div>

                <form onSubmit={handleCreateDeposit} className={styles.formStack}>
                  <Select
                    label="Currency"
                    name="currency"
                    data={["USDT", "BTC", "ETH", "LTC", "DOGE", "XRP", "TRX"]}
                    value={currencySelected}
                    onChange={(v) => setCurrencySelected(v || "USDT")}
                    size="md"
                    searchable
                    nothingFoundMessage="No options"
                    leftSection={
                      <IconCoin size={16} style={{ opacity: 0.6 }} />
                    }
                  />

                  <TextInput
                    label="Deposit Amount"
                    name="amount"
                    placeholder="e.g. 1000"
                    defaultValue={prefillAmount || ""}
                    size="md"
                    type="number"
                    step="any"
                    required
                    leftSection={
                      <IconCurrencyDollar size={16} style={{ opacity: 0.6 }} />
                    }
                  />

                  {selectedPlanInfo && (
                    <Alert
                      icon={<IconInfoCircle size={16} />}
                      color="blue"
                      variant="light"
                      style={{ marginTop: 12 }}
                      onClose={() => setSelectedPlanInfo(null)}
                      withCloseButton
                    >
                      <div style={{ fontSize: 14 }}>
                        <strong>Selected Plan: {selectedPlanInfo.name}</strong>
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
                        {selectedPlanInfo.ror}% daily returns for {selectedPlanInfo.duration} days
                        • Investment range: ${selectedPlanInfo.minInvest?.toLocaleString()} - ${selectedPlanInfo.maxInvest?.toLocaleString()}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span style={{
                          backgroundColor: '#e6fcf5',
                          color: '#087f5b',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          <IconGift size={12} />
                          10% WELCOME BONUS APPLIED
                        </span>
                      </div>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    fullWidth
                    size="lg"
                    className={styles.submitBtn}
                  >
                    Create Deposit
                  </Button>
                </form>
              </div>

              {/* Output log */}
              <div className={styles.card} style={{ marginTop: 16 }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Activity Log</div>
                  {txStatus && (
                    <div
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: hexToRgba(primary, 0.1),
                        color: primary,
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {txStatus}
                    </div>
                  )}
                </div>
                <div className={styles.logBox}>
                  <pre>{output}</pre>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className={styles.rightCol}>
              {depositResult ? (
                <div className={`${styles.card} ${styles.cardInnerFill}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>Deposit Details</div>
                    <Tooltip label="Open Invoice">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => setInvoiceModalOpen(true)}
                      >
                        <IconExternalLink size={16} />
                      </Button>
                    </Tooltip>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    {qrValue ? (
                      <QRWithLogo
                        data={qrValue}
                        logoSrc={getLogoDataUrl(currencySelected) || undefined}
                        size={200}
                      />
                    ) : (
                      <div style={{
                        width: 200,
                        height: 200,
                        background: 'rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        border: '1px dashed var(--muted)'
                      }}>
                        <div style={{ textAlign: 'center', padding: 16 }}>
                          <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            Address not available.<br />Please contact support.
                          </div>
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: 12,
                        fontSize: 12,
                        color: "var(--muted)",
                        textAlign: "center",
                        maxWidth: 240,
                      }}
                    >
                      Scan with your wallet app or send manually below
                    </div>
                  </div>

                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Status</div>
                    <div className={styles.detailValue}>
                      {depositResult.status || "PENDING"}
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Amount</div>
                    <div className={styles.detailValue}>
                      {depositResult.amount || depositResult.value} {depositResult.currency}
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Address</div>
                    <div className={styles.detailValue} style={{ fontSize: 12 }}>
                      {depositResult.walletAddress ||
                        depositResult.address ||
                        storeTronAddress ||
                        "---"}
                    </div>
                  </div>
                  {depositResult.paymentUrl && (
                    <div style={{ marginTop: 16 }}>
                      <Button
                        component="a"
                        href={depositResult.paymentUrl}
                        target="_blank"
                        fullWidth
                        variant="outline"
                        size="sm"
                        leftSection={<IconExternalLink size={14} />}
                      >
                        Open Payment Page
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className={styles.card}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 200,
                    color: "var(--muted)",
                    fontSize: 14,
                  }}
                >
                  Create a deposit to see details here
                </div>
              )}

              {/* Recent deposits */}
              <div className={styles.card} style={{ marginTop: 16 }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitle}>Recent Public Deposits</div>
                </div>
                <div className={styles.listContainer}>
                  {publicList.length === 0 ? (
                    <div className={styles.emptyState}>No recent activity</div>
                  ) : (
                    publicList.map((item: any, idx: number) => (
                      <div key={idx} className={styles.listItem}>
                        <div className={styles.listItemIcon}>
                          <IconCheck size={14} color="#fff" />
                        </div>
                        <div className={styles.listItemContent}>
                          <div className={styles.listItemTitle}>
                            {item.currency || "USDT"} Deposit
                          </div>
                          <div className={styles.listItemSubtitle}>
                            {item.status || "CONFIRMED"} •{" "}
                            {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className={styles.listItemAmount}>
                          +{item.amount}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 1 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Request Withdrawal</div>
          </div>

          <div style={{ padding: 16 }}>
            <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light" mb="lg">
              Withdrawals are processed within 24 hours. Minimum withdrawal amount is $10.
            </Alert>

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Withdrawal Mode</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div
                  onClick={() => setWithdrawMode('standard')}
                  style={{
                    flex: 1,
                    padding: 16,
                    border: `2px solid ${withdrawMode === 'standard' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    backgroundColor: withdrawMode === 'standard' ? 'var(--primary-light)' : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Standard</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Processed within 24h</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>No extra fees</div>
                </div>

                <div
                  onClick={() => setWithdrawMode('instant')}
                  style={{
                    flex: 1,
                    padding: 16,
                    border: `2px solid ${withdrawMode === 'instant' ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    backgroundColor: withdrawMode === 'instant' ? 'var(--primary-light)' : 'transparent'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Instant</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Processed immediately</div>
                  <div style={{ fontSize: 12, color: 'orange' }}>2% fee applies</div>
                </div>
              </div>
            </div>

            <TextInput
              label="Withdrawal Amount (USDT)"
              placeholder="e.g. 500"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.currentTarget.value)}
              type="number"
              mb="md"
              leftSection={<IconCurrencyDollar size={16} />}
            />

            <TextInput
              label="Wallet Address (TRC20)"
              placeholder="T..."
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.currentTarget.value)}
              mb="xl"
              leftSection={<IconWallet size={16} />}
            />

            <Button
              fullWidth
              size="lg"
              color={withdrawMode === 'instant' ? 'orange' : 'blue'}
              onClick={handleWithdraw}
            >
              {withdrawMode === 'instant' ? 'Instant Withdraw' : 'Request Withdrawal'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankProcess;
