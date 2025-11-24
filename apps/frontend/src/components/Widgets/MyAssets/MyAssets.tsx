import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

// hooks
import useClickOutside from "../../../hooks/useClickOutside";

// components
import Box from "../../Common/Box";
import MyAssetsRow from "./MyAssetsRow";
import { Button, Loader, Center, Text } from "@mantine/core";
import { useAppTheme } from "../../../lib/themeUtils";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth";

const ThemeBuy: React.FC = () => {
  const { primary, contrast } = useAppTheme();
  return (
    <Button
      component={Link}
      to="/deposit"
      size="xs"
      style={{ background: primary, color: contrast, borderColor: primary }}
    >
      Deposit
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

const MyAssets: React.FC = () => {
  const ref = useRef<any>(null);
  const { user } = useAuth();

  const [data, setData] = useState<ICrypto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  useClickOutside(ref, () => setMenuOpened(false));

  useEffect(() => {
    const fetchBalances = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const res = await api.get('/deposits/balance');

        if (res.data && res.data.balances) {
          const balances = res.data.balances;

          // Map API balances to ICrypto format
          // Default assets structure
          const assets: ICrypto[] = [
            {
              id: 1,
              name: "Bitcoin",
              symbol: "BTC",
              icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png",
              amount: "0.0000",
              currency: "BTC",
              change: "0%",
              changePeriod: "24h",
              barChartData: [0, 0, 0, 0, 0],
              lineChartData: [0, 0, 0, 0, 0],
              status: 1,
            },
            {
              id: 2,
              name: "Ether",
              symbol: "ETH",
              icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png",
              amount: "0.0000",
              currency: "ETH",
              change: "0%",
              changePeriod: "24h",
              barChartData: [0, 0, 0, 0, 0],
              lineChartData: [0, 0, 0, 0, 0],
              status: 1,
            },
            {
              id: 3,
              name: "Tether",
              symbol: "USDT",
              icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png",
              amount: "0.00",
              currency: "USDT",
              change: "0%",
              changePeriod: "24h",
              barChartData: [0, 0, 0, 0, 0],
              lineChartData: [0, 0, 0, 0, 0],
              status: 1,
            }
          ];

          // Update amounts from API
          balances.forEach((b: any) => {
            const asset = assets.find(a => a.symbol === b.currency);
            if (asset) {
              asset.amount = Math.abs(parseFloat(b.amount)).toString();
            }
          });

          setData(assets);
        }
      } catch (error) {
        console.error("Failed to fetch assets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [user]);

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
                      Settings
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="box-content">
        {loading ? (
          <Center p="xl">
            <Loader size="sm" />
          </Center>
        ) : data.length > 0 ? (
          data.map((item) => (
            <MyAssetsRow key={item.id.toString()} item={item} />
          ))
        ) : (
          <Center p="xl">
            <Text c="dimmed" size="sm">No assets found</Text>
          </Center>
        )}
      </div>
    </Box>
  );
};

export default MyAssets;
