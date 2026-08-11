import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { notify } from "../../../ui/notifications/notify";
import Box from "../../Common/Box";

type Props = {
  symbol?: string;
  compact?: boolean;
};

type SpotOrder = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "LIMIT" | "MARKET";
  status: "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
  price: number;
  quantity: number;
  remainingQuantity: number;
  createdAt: string;
};

const OpenOrders: React.FC<Props> = ({ symbol, compact = false }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState<SpotOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/spot/orders/${user.id}`, {
        params: symbol ? { symbol } : undefined,
      });
      const rows = Array.isArray(res.data) ? res.data : [];
      setOrders(rows.filter((row: SpotOrder) => ["OPEN", "PARTIALLY_FILLED"].includes(row.status)));
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        notify.error("Failed to load open orders");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadOrders();
    };

    run();
    const timer = window.setInterval(run, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [user?.id, symbol]);

  const cancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await api.post(`/spot/orders/${orderId}/cancel`);
      notify.success("Order cancelled");
      await loadOrders();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to cancel order";
      notify.error(String(msg));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div className="flex flex-center flex-space-between">
          <p>{compact ? "Open orders" : "Your open orders"}</p>
          {symbol && <span className="gray">{symbol.replace("_", "/")}</span>}
        </div>
      </div>
      <div className="box-content box-content-height-nobutton">
        {!user?.id ? (
          <div className="box-horizontal-padding box-vertical-padding">
            <p>Sign in to manage open spot orders.</p>
            <Link to={`/members/signin?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}>
              Sign in
            </Link>
          </div>
        ) : loading ? (
          <div className="box-horizontal-padding box-vertical-padding">
            <p>Loading open orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="box-horizontal-padding box-vertical-padding">
            <p>No open orders.</p>
          </div>
        ) : (
          <div className="orders-row">
            <table>
              <thead>
                <tr>
                  <th className="left no-select">Pair</th>
                  <th className="center no-select">Side</th>
                  <th className="center no-select">Type</th>
                  <th className="center no-select">Remaining</th>
                  <th className="right no-select">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="left">{order.symbol.replace("_", "/")}</td>
                    <td className={`center ${order.side === "BUY" ? "green" : "red"}`}>{order.side}</td>
                    <td className="center">{order.type}</td>
                    <td className="center">{Number(order.remainingQuantity || 0).toFixed(8)}</td>
                    <td className="right">
                      <button
                        type="button"
                        className="button button-outline button-small"
                        onClick={() => cancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? "Cancelling..." : "Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Box>
  );
};

export default OpenOrders;