import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppTheme } from "../../../lib/themeUtils";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth";

// components
import Box from "../../Common/Box";
import RecentActivityRow from "./RecentActivityRow";

// interfaces
interface IActivity {
  id: number;
  type: number;
  time: string;
  amount: string;
  status: number;
  currency: string;
  pair?: string;
}

// variables
const RecentActivity: React.FC = () => {
  const [data, setData] = useState<IActivity[]>([]);
  const { primary } = useAppTheme();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!user?.id) {
        if (mounted) setData([]);
        return;
      }

      try {
        const res = await api.get(`/spot/orders/${user.id}`);
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        if (!rows.length) {
          setData([]);
          return;
        }

        setData(
          rows.slice(0, 8).map((row: any, index: number) => ({
            id: index + 1,
            type: row.side === "BUY" ? 1 : 2,
            time: new Date(row.createdAt).toLocaleTimeString(),
            amount: Number(row.quantity || 0).toFixed(8),
            currency: String(row.symbol || "BTC_USDT").split("_")[0] || "BTC",
            pair: String(row.symbol || "BTC_USDT").replace("_", "/"),
            status:
              row.status === "FILLED"
                ? 1
                : row.status === "CANCELLED"
                ? 2
                : 3,
          }))
        );
      } catch (e) {
        if (!mounted) return;
        setData([]);
      }
    };

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [user?.id]);

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div className="flex flex-center flex-space-between">
          <div>
            <p>Recent orders</p>
          </div>
          <ul>
            <li>
              <button type="button">Yesterday</button>
            </li>
            <li>
              <button
                type="button"
                className="active"
                style={{ color: primary }}
              >
                Today
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="box-content">
        {!user?.id ? (
          <div className="box-horizontal-padding box-vertical-padding">
            <p>Sign in to review your recent spot orders.</p>
            <Link to="/members/signin" style={{ color: primary, fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        ) : data && data.length > 0 ? (
          data.map((item: IActivity) => (
            <RecentActivityRow key={item.id.toString()} item={item} />
          ))
        ) : (
          <div className="box-horizontal-padding box-vertical-padding">
            <p>No spot order activity yet.</p>
          </div>
        )}
      </div>
    </Box>
  );
};

export default RecentActivity;
