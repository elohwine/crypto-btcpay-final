import React, { useEffect, useState } from "react";
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
  const [lottieModalOpen, setLottieModalOpen] = useState<boolean>(false);
  const [lottieType, setLottieType] = useState<"success" | "failed" | null>(
    null
  );
  const NETWORKS: { key: string; label: string }[] = [
    { key: "BTC", label: "BTC" },
    { key: "TRC20", label: "TRC20 (TRON)" },
  ];

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
            setOutput(
              `✅ Deposit ${
                res.data.depositId || res.data.id
              } confirmed on-chain and settled.`
            );
            try {
              notify.success("Deposit confirmed and settled");
            } catch (e) {
              /* ignore */
            }
            return res.data;
          } else {
            if (res && res.data) setDepositResult(res.data);
            // keep user informed
            setOutput(
              `ℹ️ Deposit ${depositId} status: ${
                res?.data?.status || "unknown"
              }`
            );
          }
        } catch (e) {
          // ignore
        }
        const backoffMs = Math.min(
          intervalMs * Math.pow(1.1, Math.floor(i / 10)),
          30000
        );
        await new Promise((r) => setTimeout(r, backoffMs));
      }
      setTxStatus("poll-timeout");
      setOutput("⚠️ Polling timed out — deposit not confirmed yet.");
      return null;
    } catch (e) {
      setTxStatus(null);
      setOutput("❌ Polling failed");
      return null;
    }
  };

  // report tx and start polling
  const reportTxAndStartPoll = async (
    txHash: string,
    to: string,
    amountDecimal: number | string
  ) => {
    // remember last attempt so UI can offer retry
    try {
      setLastReportAttempt({ txHash, to, amount: amountDecimal });
    } catch (e) {
      /* ignore */
    }
    const maxAttempts = 6;
    let attempt = 0;
    let reported = false;
    let lastResp: any = null;
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
        });
        lastResp = { ok: true, body: r.data };
        if (r.status >= 200 && r.status < 300 && r.data && !r.data.error) {
          reported = true;
          setTxStatus("reported");
          const serverDepositId = r.data?.depositId || r.data?.id || null;
          if (serverDepositId) {
            await pollDepositStatus(serverDepositId, 180, 5000);
          }
          return r.data;
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
    // surface the last response to the UI so user knows why reporting failed
    try {
      const body = lastResp?.body || lastResp || "unknown error";
      setOutput(
        `❌ Failed to report tx to server: ${
          typeof body === "string" ? body : JSON.stringify(body)
        }`
      );
    } catch (e) {
      setOutput("❌ Failed to report tx to server: unknown error");
    }
    return lastResp;
  };

  // prompt tronlink to send tokens
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

  // save to local history
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
      // ignore local history persistence failures in production
    }
  };

  const fetchPublicList = async () => {
    try {
      const res = await api.get("/deposits/public");
      if (res && res.data) {
        setPublicList(res.data || []);
        setRecentPage(1);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem("local_deposits") || "[]";
      setHistoryList(JSON.parse(raw));
    } catch (e) {
      setHistoryList([]);
    }
    fetchPublicList();
  }, []);

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
            u.searchParams.get("to") ||
            null;
        } catch (err) {
          /* ignore */
        }
      }
      if (!recipient) {
        try {
          const sr = await api.get("/deposits/store/current/tron-address");
          if (sr.data && sr.data.ok && sr.data.address)
            recipient = sr.data.address;
        } catch (err) {
          /* ignore */
        }
      }

      if (walletConnected && recipient) {
        setOutput(`⏳ Prompting TronLink to send tokens to ${recipient}...`);
        try {
          const txHash = await promptAndSendToken(recipient, amount);
          if (!txHash) {
            setOutput(
              "⚠️ Transaction was not submitted (user rejected or provider failed). No polling will start."
            );
            return;
          }
          setOutput(
            `Transaction sent to ${recipient} (${txHash}), reporting to server and waiting for settlement...`
          );

          // Report the on-chain tx to the server and let the server-side logic (or the direct endpoint)
          // reconcile the tx with a Deposit record. reportTxAndStartPoll will attempt to POST
          // /deposits/direct and then poll the returned deposit id until settlement. Await it so
          // the UI updates as the server reports status changes.
          try {
            const reportResp = await reportTxAndStartPoll(
              txHash,
              recipient,
              amount
            );
            // reportTxAndStartPoll returns r.data when successful. Update local UI state with it.
            if (reportResp && typeof reportResp === "object") {
              // prefer deposit-shaped payloads
              const serverDeposit =
                reportResp.depositId || reportResp.id
                  ? reportResp
                  : reportResp.body || reportResp;
              setDepositResult(serverDeposit || reportResp);
              saveToHistory({
                txHash,
                to: recipient,
                amount,
                depositId:
                  serverDeposit?.depositId || serverDeposit?.id || null,
                createdAt: new Date().toISOString(),
              });
            }
          } catch (e) {
            // If reporting fails, still try to poll using the original created deposit id (if any)
            const startedDepositId = result.depositId || result.id || null;
            if (startedDepositId) {
              await pollDepositStatus(startedDepositId, 300, 10000);
            }
          }
        } catch (err: any) {
          setOutput(`❌ Token transfer failed: ${err?.message || err}`);
        }
      } else if (!recipient) {
        setOutput(
          "⚠️ No on-chain recipient found — showing QR/checkout link for manual payment"
        );
      }

      const depositId = result.depositId || result.id || null;
      if (depositId && !walletConnected && paymentUrl) {
        setOutput(`🔎 Polling deposit status for ${depositId}...`);
        pollDepositStatus(depositId, 300, 10000);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Deposit creation failed";
      notify.error(msg);
      setOutput(`❌ Deposit creation failed: ${msg}`);
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
                background: hexToRgba(primary, 0.06),
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
                background: hexToRgba(primary, 0.06),
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
                ) : currencySelected === "BTC" ? (
                  <div className={styles.btcBadge} aria-hidden>
                    <IconCurrencyBitcoin size={56} color={contrast} />
                  </div>
                ) : (
                  <div className={styles.currencyText}>{currencySelected}</div>
                )}
              </div>
            </div>

            {/* Replace only the <form> ... </form> part in your BankProcess.tsx with this block.
   It preserves your existing handler `handleCreateDeposit`, uses the same form field names
   (`currency`, `amount`) and keeps submit behaviour identical.
   It expects the same component-level state: `selectedNetwork`, `NETWORKS`, `depositResult`,
   and the CSS module classes (styles.input, styles.select, styles.chip, styles.chipActive,
   styles.primaryBtn, styles.ghostBtn, styles.statusBox) already present in your project. */}

            <form
              onSubmit={handleCreateDeposit}
              className={styles.depositForm}
              style={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Row 1: Currency (with icon) + Amount inline */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* Currency control (inline - label removed, use placeholder) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 220,
                    flex: "0 0 45%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                    }}
                  >
                    {/* visual icon left */}
                    {/* visual icon left */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--surface)",
                        border: `1px solid ${hexToRgba(primary, 0.06)}`,
                      }}
                    >
                      <IconCurrencyDollar size={18} />
                    </div>
                    {/* Mantine Select with uniform sizing */}
                    <Select
                      id="currency"
                      name="currency"
                      defaultValue="USDT"
                      data={[
                        { value: "USDT", label: "USDT • Tether" },
                        { value: "BTC", label: "BTC • Bitcoin" },
                      ]}
                      placeholder="USDT • Tether (default)"
                      aria-label="Select payment currency"
                      size="md"
                      radius="md"
                      className={styles.mantineField}
                      styles={{
                        input: { height: 44, fontSize: 14, paddingLeft: 12 },
                      }}
                      onChange={(v) => setCurrencySelected(String(v || "USDT"))}
                    />
                  </div>
                </div>

                {/* Amount control (inline - label removed, placeholder used) */}
                <div style={{ flex: "1", minWidth: 180 }}>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    {/* small icon left for amount */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--surface)",
                        border: `1px solid ${hexToRgba(primary, 0.06)}`,
                      }}
                    >
                      <IconCoin size={14} />
                    </div>
                    <TextInput
                      id="amount"
                      name="amount"
                      defaultValue={String(10)}
                      required
                      type="number"
                      inputMode="decimal"
                      placeholder="Amount (USDT) — e.g. 10.00"
                      aria-label="Deposit amount"
                      size="md"
                      radius="md"
                      className={styles.mantineField}
                      styles={{
                        input: { height: 44, fontSize: 14, paddingLeft: 12 },
                      }}
                    />
                    {/* small unit label (reflect selected currency) */}
                    <div
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        background: "var(--surface)",
                        border: `1px solid ${hexToRgba(primary, 0.06)}`,
                        fontSize: 13,
                        color: "var(--text)",
                      }}
                    >
                      {currencySelected}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Network chip + small contextual help (compact) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                {/* preview button removed; preview is available in the actions row */}
              </div>

              {/* Row 3: Actions (primary + secondary) */}
              <div className={styles.formActions}>
                <Button
                  type="submit"
                  radius="md"
                  size="md"
                  style={{
                    width: "100%",
                    maxWidth: 420,
                    minWidth: 180,
                    margin: "0 auto",
                    display: "block",
                  }}
                >
                  {walletConnected
                    ? "Create Deposit"
                    : "Create Deposit (Manual)"}
                </Button>

                {/* Removed inline preview button — preview moved to QR area modal */}
              </div>
            </form>

            {/* Tiles row placed directly under the form (Invoice / Deposit ID / Status) */}
            <div className={styles.tilesRow}>
              <div
                className={`${styles.infoTile} ${
                  depositResult?.invoiceId ? styles.hasData : ""
                }`}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Invoice
                </div>
                <div className={styles.tileValueRow}>
                  <Tooltip
                    label={depositResult?.invoiceId || "-"}
                    withArrow
                    disabled={
                      !depositResult?.invoiceId ||
                      (depositResult.invoiceId || "").length <= 28
                    }
                  >
                    <div
                      className={styles.tileValue}
                      style={{ cursor: "text" }}
                    >
                      {depositResult?.invoiceId || "-"}
                    </div>
                  </Tooltip>
                  {depositResult?.invoiceId && (
                    <button
                      type="button"
                      className={styles.tileCopyBtn}
                      onClick={() => {
                        try {
                          navigator.clipboard?.writeText(
                            String(depositResult.invoiceId)
                          );
                          notify.success("Invoice copied");
                        } catch (e) {
                          notify.error("Copy failed");
                        }
                      }}
                      aria-label="Copy invoice id"
                    >
                      <IconCopy size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div
                className={`${styles.infoTile} ${
                  depositResult?.depositId ? styles.hasData : ""
                }`}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Deposit ID
                </div>
                <div className={styles.tileValueRow}>
                  <Tooltip
                    label={depositResult?.depositId || depositResult?.id || "-"}
                    withArrow
                    disabled={!depositResult?.depositId && !depositResult?.id}
                  >
                    <div
                      className={styles.tileValue}
                      style={{ cursor: "text" }}
                    >
                      {depositResult?.depositId || depositResult?.id || "-"}
                    </div>
                  </Tooltip>
                  {(depositResult?.depositId || depositResult?.id) && (
                    <button
                      type="button"
                      className={styles.tileCopyBtn}
                      onClick={() => {
                        const v =
                          depositResult?.depositId || depositResult?.id || "";
                        try {
                          navigator.clipboard?.writeText(String(v));
                          notify.success("Deposit ID copied");
                        } catch (e) {
                          notify.error("Copy failed");
                        }
                      }}
                      aria-label="Copy deposit id"
                    >
                      <IconCopy size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div
                className={`${styles.infoTilePrimary} ${
                  depositResult?.status ? styles.hasData : ""
                }`}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                  }}
                >
                  Status
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {/* spinner / status icon */}
                  <div aria-hidden>
                    {(() => {
                      const st = depositResult?.status || null;
                      if (st === "CONFIRMED")
                        return <IconCheck size={16} color="var(--primary)" />;
                      if (st === "PENDING" || st === "NEW" || st === "ONCHAIN")
                        return <IconLoader size={16} className={styles.spin} />;
                      if (
                        st === "FAILED" ||
                        st === "ERROR" ||
                        st === "report-failed"
                      )
                        return (
                          <IconAlertCircle size={16} color="var(--primary)" />
                        );
                      return <IconInfoCircle size={16} />;
                    })()}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      className={styles.tileValue}
                      style={{ fontWeight: 700 }}
                    >
                      {depositResult?.status || "-"}
                    </div>
                    {txStatus &&
                      (txStatus.includes("poll") ||
                        txStatus.includes("waiting") ||
                        txStatus.includes("retry")) && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <IconLoader size={16} className={styles.spin} />
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>
                            waiting...
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Alert below the tiles */}
            <div style={{ marginTop: 10 }}>
              {(() => {
                const st = depositResult?.status || null;
                let icon = <IconInfoCircle size={16} color="var(--primary)" />;
                let color: any = "blue";
                let variant: any = "light";
                if (st === "CONFIRMED") {
                  icon = <IconCheck size={16} color="var(--primary)" />;
                  color = "blue";
                } else if (
                  st === "PENDING" ||
                  st === "NEW" ||
                  st === "ONCHAIN"
                ) {
                  icon = (
                    <IconLoader
                      size={16}
                      color="var(--primary)"
                      className={styles.spin}
                    />
                  );
                  color = "blue";
                  variant = "outline";
                } else if (
                  st === "FAILED" ||
                  st === "ERROR" ||
                  st === "report-failed"
                ) {
                  icon = <IconAlertCircle size={16} color="var(--primary)" />;
                  color = "blue";
                }

                return (
                  <Alert
                    icon={icon}
                    color={color}
                    variant={variant}
                    aria-live="polite"
                    className={`${styles.statusAlert} ${
                      st === "CONFIRMED"
                        ? styles.statusSuccess
                        : st === "PENDING" || st === "NEW" || st === "ONCHAIN"
                        ? styles.statusPending
                        : styles.statusFailed
                    }`}
                    style={{
                      border:
                        st === "PENDING" || st === "NEW" || st === "ONCHAIN"
                          ? `1px solid ${hexToRgba(primary, 0.12)}`
                          : undefined,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ flex: 1, color: "var(--text)" }}>
                        {output}
                      </div>
                      {(depositResult?.explorerUrl ||
                        depositResult?.txHash ||
                        lastReportAttempt) && (
                        <div
                          style={{
                            marginLeft: 12,
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          {(depositResult?.explorerUrl ||
                            depositResult?.txHash) && (
                            <button
                              onClick={() => {
                                const url =
                                  depositResult?.explorerUrl ||
                                  (depositResult?.txHash
                                    ? (window as any)._NETWORK === "mainnet"
                                      ? `https://tronscan.org/#/transaction/${depositResult.txHash}`
                                      : `https://shasta.tronscan.org/#/transaction/${depositResult.txHash}`
                                    : null);
                                if (url) window.open(url, "_blank");
                              }}
                              className={styles.ghostBtn}
                              aria-label="View on explorer"
                            >
                              <IconExternalLink size={14} />
                            </button>
                          )}
                          {lastReportAttempt && (
                            <button
                              onClick={async () => {
                                try {
                                  setOutput("🔁 Retrying report to server...");
                                  await reportTxAndStartPoll(
                                    lastReportAttempt.txHash,
                                    lastReportAttempt.to,
                                    lastReportAttempt.amount
                                  );
                                } catch (e: any) {
                                  setOutput(
                                    `❌ Retry failed: ${
                                      e?.message || String(e)
                                    }`
                                  );
                                }
                              }}
                              className={styles.ghostBtn}
                              aria-label="Retry reporting transaction"
                            >
                              Retry report
                            </button>
                          )}
                        </div>
                      )}
                      {/* show a small failed animation inside the alert when reporting failed */}
                      {txStatus === "report-failed" && (
                        <div style={{ marginLeft: 12, pointerEvents: "none" }}>
                          <LottiePlayer
                            animationData={FailedAnim}
                            loop={false}
                            autoplay
                            style={{ width: 68, height: 68 }}
                          />
                        </div>
                      )}
                    </div>
                  </Alert>
                );
              })()}
            </div>

            {/* duplicate status box removed (status displayed inside the form already) */}
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          <div className={`${styles.card} ${styles.cardInnerFill}`}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className={styles.netBadge} aria-hidden>
                {selectedNetwork}
              </div>
            </div>

            <div className={styles.qrWrap} style={{ marginTop: 8 }}>
              <div className={styles.qrCard}>
                <div className={styles.qrContainer}>
                  {qrValue ? (
                    (() => {
                      const qrData = qrValue || "";
                      const currencyKey =
                        depositResult?.currency || currencySelected || "USDT";
                      const logoSrc = getLogoDataUrl(currencyKey) || null;
                      return (
                        <QRWithLogo
                          data={qrData}
                          logoSrc={logoSrc || undefined}
                          size={220}
                          imageSize={0.18}
                          type="svg"
                        />
                      );
                    })()
                  ) : (
                    <div
                      style={{
                        width: 220,
                        height: 220,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Alert
                        icon={<IconInfoCircle size={16} />}
                        color="blue"
                        variant="light"
                      >
                        No invoice yet — create a deposit to generate a QR code
                        or preview an invoice.
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* tiles moved to the left column (under the form) */}

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <Button
                variant="filled"
                onClick={() => {
                  const url =
                    depositResult?.paymentUrl ||
                    depositResult?.checkout ||
                    depositResult?.checkoutLink;
                  if (url) setInvoiceModalOpen(true);
                  else notify.error("No invoice available yet");
                }}
                style={{
                  background: primary,
                  color: contrast,
                  borderColor: primary,
                }}
              >
                <IconExternalLink size={14} />
                <span style={{ marginLeft: 8 }}>Open Invoice</span>
              </Button>
              {depositResult?.txLink && (
                <Button
                  variant="subtle"
                  onClick={() => window.open(depositResult.txLink, "_blank")}
                  style={{ color: primary }}
                >
                  <IconExternalLink size={14} />
                  <span style={{ marginLeft: 8 }}>View Transaction</span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    depositResult?.walletAddress || ""
                  );
                  notify.success("Address copied");
                }}
                style={{ borderColor: primary, color: primary }}
              >
                <IconCopy size={14} />
                <span style={{ marginLeft: 8 }}>Copy Address</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent deposits */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 700 }}>Recent Deposits</div>
          <div>
            <button className={styles.ghostBtn} onClick={fetchPublicList}>
              Refresh
            </button>
          </div>
        </div>

        <div style={{ maxHeight: 420, overflow: "auto" }}>
          {publicList.length > 0 ? (
            (() => {
              const total = publicList.length;
              const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
              const page = Math.min(Math.max(1, recentPage), totalPages);
              const start = (page - 1) * PAGE_SIZE;
              const pageItems = publicList.slice(start, start + PAGE_SIZE);
              return (
                <div>
                  {pageItems.map((item: any, idx: number) => (
                    <div key={idx} className={styles.publicItem}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <strong style={{ color: "var(--primary)" }}>
                          {item.depositId}
                        </strong>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 8,
                            fontSize: 12,
                            background: "var(--primary)",
                            color: "var(--primary-contrast)",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>
                        {item.currency} {item.amount} •{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {item.txHash && (
                          <a
                            href={
                              (window as any)._NETWORK === "mainnet"
                                ? `https://tronscan.org/#/transaction/${item.txHash}`
                                : `https://shasta.tronscan.org/#/transaction/${item.txHash}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "var(--primary)",
                              textDecoration: "none",
                              display: "inline-flex",
                              gap: 6,
                              alignItems: "center",
                            }}
                            aria-label="View transaction"
                          >
                            {" "}
                            <IconExternalLink size={14} />{" "}
                            <span style={{ marginLeft: 4 }}>TX</span>
                          </a>
                        )}
                        {item.invoiceId && (
                          <span
                            style={{
                              fontFamily: "monospace",
                              color: "var(--text)",
                            }}
                          >
                            {item.invoiceId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 8,
                    }}
                  >
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>
                      Showing {start + 1}-{Math.min(start + PAGE_SIZE, total)}{" "}
                      of {total}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className={styles.ghostBtn}
                        onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        Prev
                      </button>
                      <button
                        className={styles.ghostBtn}
                        onClick={() =>
                          setRecentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--muted)",
                padding: 24,
              }}
            >
              Loading recent deposits...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankProcess;
