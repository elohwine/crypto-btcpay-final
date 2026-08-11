import { useRef, useState, useEffect } from "react";
import api from "../../../lib/api";

// hooks
import useClickOutside from "../../../hooks/useClickOutside";

// components
import Box from "../../Common/Box";
import BuyOrdersRow from "./BuyOrdersRow";

// interfaces
interface IPriceList {
  id: number;
  type: number;
  price: string;
  total: string;
  amount: string;
  currency: string;
}

// variables
const dataArray: IPriceList[] = [
  {
    id: 1,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 1,
  },
  {
    id: 2,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 1,
  },
  {
    id: 3,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 3,
  },
  {
    id: 4,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 3,
  },
  {
    id: 5,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 2,
  },
  {
    id: 6,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 1,
  },
  {
    id: 7,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 2,
  },
  {
    id: 8,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 3,
  },
  {
    id: 9,
    price: "82,03",
    amount: "0,15",
    total: "237,31",
    currency: "TRY",
    type: 3,
  },
];

type Props = {
  symbol?: string;
};

const BuyOrders: React.FC<Props> = ({ symbol = "BTC_USDT" }) => {
  const ref = useRef<any>(null);

  const [data, setData] = useState<IPriceList[]>([]);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  useClickOutside(ref, () => setMenuOpened(false));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get(`/spot/orderbook/${symbol}`, {
          params: { depth: 12 },
        });
        if (!mounted) return;
        const quoteCurrency = symbol.split("_")[1] || "USDT";
        const bids = Array.isArray(res.data?.bids) ? res.data.bids : [];
        if (!bids.length) {
          setData(dataArray);
          return;
        }

        setData(
          bids.map((item: any, index: number) => ({
            id: index + 1,
            price: Number(item.price).toFixed(4),
            amount: Number(item.quantity).toFixed(8),
            total: Number(Number(item.price) * Number(item.quantity)).toFixed(4),
            currency: quoteCurrency,
            type: 1,
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
          <p>Buy orders</p>
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
        <div className="orders-row">
          {data && data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th className="left no-select">Price</th>
                  <th className="center no-select">Amount</th>
                  <th className="right no-select">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item: IPriceList) => (
                  <BuyOrdersRow key={item.id.toString()} item={item} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Box>
  );
};

export default BuyOrders;
