import { useRef, useState, useEffect } from "react";
import api from "../../../lib/api";

// hooks
import useClickOutside from "../../../hooks/useClickOutside";

// components
import Box from "../../Common/Box";
import TradeHistoryRow from "./TradeHistoryRow";

// interfaces
interface IHistory {
  id: number;
  type: number;
  time: string;
  weight: number;
  amount: string;
  currency: string;
}

// variables
const dataArray: IHistory[] = [
  {
    id: 1,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "06:22:15",
    type: 1,
  },
  {
    id: 2,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "07:30:30",
    type: 1,
  },
  {
    id: 3,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "09:15:42",
    type: 2,
  },
  {
    id: 4,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "11:12:50",
    type: 2,
  },
  {
    id: 5,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "13:30:01",
    type: 1,
  },
  {
    id: 6,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "14:20:36",
    type: 1,
  },
  {
    id: 7,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "17:45:58",
    type: 1,
  },
  {
    id: 8,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "20:05:54",
    type: 1,
  },
  {
    id: 9,
    amount: "146,70",
    currency: "TRY",
    weight: 10,
    time: "22:30:45",
    type: 2,
  },
];

type Props = {
  symbol?: string;
};

const TradeHistory: React.FC<Props> = ({ symbol = "BTC_USDT" }) => {
  const ref = useRef<any>(null);

  const [data, setData] = useState<IHistory[]>([]);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  useClickOutside(ref, () => setMenuOpened(false));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/spot/trades/${symbol}`, {
          params: { limit: 12 },
        });
        if (!mounted) return;
        const quoteCurrency = symbol.split("_")[1] || "USDT";
        const trades = Array.isArray(res.data?.trades) ? res.data.trades : [];
        if (!trades.length) {
          setData(dataArray);
          return;
        }

        setData(
          trades.map((item: any, index: number) => ({
            id: index + 1,
            amount: Number(item.price).toFixed(4),
            currency: quoteCurrency,
            weight: Number(item.quantity).toFixed(8),
            time: new Date(item.createdAt).toLocaleTimeString(),
            type: item.takerSide === "BUY" ? 1 : 2,
          }))
        );
      } catch (e) {
        if (!mounted) return;
        setData(dataArray);
      }
    };

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [symbol]);

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div ref={ref} className="flex flex-center flex-space-between">
          Market history
          <button
            type="button"
            className="box-icon pointer"
            onClick={() => handleMenuOpen()}
          >
            <i className="material-icons">more_vert</i>
          </button>
          {menuOpened && (
            <div className="box-dropdown">
              <ul>
                <li>
                  <button type="button">
                    <i className="material-icons">settings</i>
                    Button 1
                  </button>
                </li>
                <li>
                  <button type="button">
                    <i className="material-icons">favorite</i>
                    Button 2
                  </button>
                </li>
                <li>
                  <button type="button">
                    <i className="material-icons">info</i>
                    Button 3
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="box-content box-content-height-nobutton">
        <div className="trade-history-row">
          {data && data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th className="left no-select">Price</th>
                  <th className="center no-select">Amount</th>
                  <th className="center no-select">Order</th>
                  <th className="right no-select">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: IHistory) => (
                  <TradeHistoryRow key={item.id.toString()} item={item} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Box>
  );
};

export default TradeHistory;
