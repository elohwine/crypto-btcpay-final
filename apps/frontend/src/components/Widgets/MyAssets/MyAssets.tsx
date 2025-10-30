import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// hooks
import useClickOutside from "../../../hooks/useClickOutside";

// components
import Box from "../../Common/Box";
import MyAssetsRow from "./MyAssetsRow";
import { Button } from "@mantine/core";
import { useAppTheme } from "../../../lib/themeUtils";

const ThemeBuy: React.FC = () => {
  const { primary, contrast } = useAppTheme();
  return (
    <Button
      component={Link}
      to="/"
      size="xs"
      style={{ background: primary, color: contrast, borderColor: primary }}
    >
      Buy crypto
    </Button>
  );
};

// interfaces
interface ICrypto {
  id: number;
  name: string;
  icon: string;
  symbol: string;
  amount: string;
  change: string;
  status: number;
  currency: string;
  changePeriod: string;
  barChartData: number[];
  lineChartData: number[];
}

// variables — keep only supported chains for now (BTC, ETH, USDT)
const dataArray: ICrypto[] = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png",
    amount: "0.0023",
    currency: "BTC",
    change: "%0.5",
    changePeriod: "This week",
    barChartData: [30, 20, 25, 35, 30],
    lineChartData: [5, 10, 5, 20, 8, 15, 22, 8, 12],
    status: 1,
  },
  {
    id: 2,
    name: "Ether",
    symbol: "ETH",
    icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png",
    amount: "0.045",
    currency: "ETH",
    change: "%-1.2",
    changePeriod: "This week",
    barChartData: [30, 20, 25, 35, 10],
    lineChartData: [5, 10, 5, 20, 8, 15, 22, 8, 12],
    status: 2,
  },
  {
    id: 3,
    name: "Tether",
    symbol: "USDT",
    icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png",
    amount: "12.50",
    currency: "USDT",
    change: "%0.0",
    changePeriod: "This week",
    barChartData: [30, 20, 25, 35, 30],
    lineChartData: [5, 10, 5, 20, 8, 15, 22, 8, 12],
    status: 1,
  },
];

const MyAssets: React.FC = () => {
  const ref = useRef<any>(null);

  const [data, setData] = useState<ICrypto[]>([]);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  useClickOutside(ref, () => setMenuOpened(false));

  useEffect(() => {
    setData(dataArray);
  }, []);

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div className="flex flex-center flex-space-between">
          <p style={{ color: "var(--text)", fontWeight: 600 }}>My assets</p>
          <div ref={ref}>
            <ThemeBuy />
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
      </div>
      <div className="box-content">
        {data &&
          data.map((item) => (
            <MyAssetsRow key={item.id.toString()} item={item} />
          ))}
      </div>
    </Box>
  );
};

export default MyAssets;
