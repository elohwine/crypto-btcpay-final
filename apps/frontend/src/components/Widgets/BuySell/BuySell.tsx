import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../../lib/api";
import { notify } from "../../../ui/notifications/notify";
import { useAuth } from "../../../lib/auth";

// components
import Box from "../../Common/Box";

type Props = {
  symbol?: string;
};

type SpotBalance = {
  currency: string;
  available: number;
  locked: number;
};

const DEFAULT_SYMBOL = "BTC_USDT";

const BuySell: React.FC<Props> = ({ symbol = DEFAULT_SYMBOL }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [primaryTab, setPrimaryTab] = useState<number>(0);
  const [orderType, setOrderType] = useState<"LIMIT" | "MARKET">("LIMIT");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [balances, setBalances] = useState<SpotBalance[]>([]);
  const [loadingBalances, setLoadingBalances] = useState<boolean>(false);

  const [baseCurrency, quoteCurrency] = symbol.split("_");

  const quoteBalance = balances.find((item) => item.currency === quoteCurrency);
  const baseBalance = balances.find((item) => item.currency === baseCurrency);

  const loadBalances = async () => {
    if (!user?.id) {
      setBalances([]);
      setLoadingBalances(false);
      return;
    }
    setLoadingBalances(true);
    try {
      const res = await api.get("/spot/balances/me");
      const rows = Array.isArray(res.data) ? res.data : [];
      setBalances(rows);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        notify.error("Failed to load spot balances");
      }
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadBalances();
    };

    run();
    const timer = window.setInterval(run, 5000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [symbol]);

  /**
   * Handles the primary tab change event.
   *
   * @param {number} tabNum - The number of the tab to be selected.
   */
  const handlePrimaryTab = (tabNum: number): void => {
    setPrimaryTab(tabNum);
  };

  const placeOrder = async () => {
    if (!user?.id) {
      notify.info("Sign in to place spot orders");
      return;
    }
    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);
    if (orderType === "LIMIT" && (!Number.isFinite(numericPrice) || numericPrice <= 0)) {
      notify.error("Enter a valid limit price");
      return;
    }
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      notify.error("Enter a valid quantity");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        symbol,
        side: primaryTab === 0 ? "BUY" : "SELL",
        type: orderType,
        ...(orderType === "LIMIT" ? { price: numericPrice } : {}),
        quantity: numericQuantity,
      };
      const res = await api.post("/spot/orders", payload);
      const fills = Array.isArray(res.data?.trades) ? res.data.trades.length : 0;
      notify.success(
        fills > 0
          ? `Order placed and matched with ${fills} fill${fills === 1 ? "" : "s"}`
            : orderType === "MARKET"
            ? "Market order executed"
            : "Limit order placed"
      );
      setPrice("");
      setQuantity("");
      await loadBalances();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to place spot order";
      notify.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div className="flex flex-center flex-space-between">
          <p>Buy-sell</p>
        </div>
      </div>
      <div className="box-horizontal-padding box-content-height-nobutton">
        <div style={{ marginBottom: 12 }}>
          <div className="gray" style={{ fontSize: 12, marginBottom: 6 }}>
            Trading pair
          </div>
          <strong>{baseCurrency}/{quoteCurrency}</strong>
          <div className="gray" style={{ fontSize: 12, marginTop: 8 }}>
            {loadingBalances
              ? "Loading balances..."
              : !user?.id
              ? `Sign in to view ${quoteCurrency} and ${baseCurrency} balances`
              : `Available ${quoteCurrency}: ${Number(
                  quoteBalance?.available || 0
                ).toFixed(4)} | Available ${baseCurrency}: ${Number(
                  baseBalance?.available || 0
                ).toFixed(8)}`}
          </div>
          <div className="gray" style={{ fontSize: 12, marginTop: 4 }}>
            Locked {quoteCurrency}: {Number(quoteBalance?.locked || 0).toFixed(4)} | Locked {baseCurrency}: {Number(baseBalance?.locked || 0).toFixed(8)}
          </div>
        </div>

        <div className="tabs no-select" style={{ marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setOrderType("LIMIT")}
            className={orderType === "LIMIT" ? "active" : "passive"}
          >
            LIMIT
          </button>
          <button
            type="button"
            onClick={() => setOrderType("MARKET")}
            className={orderType === "MARKET" ? "active" : "passive"}
          >
            MARKET
          </button>
        </div>

        <div className="tabs no-select">
          <button
            type="button"
            onClick={() => handlePrimaryTab(0)}
            className={primaryTab === 0 ? "active" : "passive"}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => handlePrimaryTab(1)}
            className={primaryTab === 1 ? "active" : "passive"}
          >
            SELL
          </button>
        </div>

        <div className="gray" style={{ fontSize: 12, marginBottom: 12 }}>
          {orderType === "LIMIT"
            ? "Limit orders rest on the book until they match or are cancelled."
            : "Market orders execute immediately against the best available book liquidity."}
        </div>
        {orderType === "LIMIT" && (
          <div className="buy-sell-line flex flex-center flex-space-between no-select">
            <div>
              <strong>Limit price</strong>
              <i className="material-icons" title="Quoted in the counter currency.">
                info
              </i>
            </div>
            <div className="right">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
              <strong>{quoteCurrency}</strong>
            </div>
          </div>
        )}
        <div className="buy-sell-line flex flex-center flex-space-between no-select">
          <div>
            <strong>Amount</strong>
            <i className="material-icons" title="Quantity in the base asset.">
              info
            </i>
          </div>
          <div className="right">
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
            <strong>{baseCurrency}</strong>
          </div>
        </div>
        <div className="buy-sell-percentage flex flex-center flex-space-between no-select">
          <span>{primaryTab === 0 ? `Spend ${quoteCurrency}` : `Sell ${baseCurrency}`}</span>
          <span>
            {orderType === "LIMIT"
              ? `Est. total: ${Number((Number(price || 0) * Number(quantity || 0)).toFixed(8)).toString()}`
              : `Executes at best available price`}
          </span>
        </div>
        <div className="box-button box-vertical-padding">
          {user?.id ? (
            <button
              type="button"
              onClick={placeOrder}
              disabled={submitting}
              className={`button ${primaryTab === 0 ? "button-green" : "button-red"} button-medium button-block`}
            >
              {submitting
                ? "Submitting..."
                : primaryTab === 0
                ? `Place a ${orderType.toLowerCase()} buy order`
                : `Place a ${orderType.toLowerCase()} sell order`}
            </button>
          ) : (
            <Link
              to={`/members/signin?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
              className="button button-purple button-medium button-block"
            >
              Sign in to trade
            </Link>
          )}
        </div>
      </div>
    </Box>
  );
};

export default BuySell;
