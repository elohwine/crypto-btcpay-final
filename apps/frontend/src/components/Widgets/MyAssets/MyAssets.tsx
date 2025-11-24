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

  const ASSET_METADATA: Record<string, any> = {
    BTC: {
      name: "Bitcoin",
      icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Bitcoin-BTC-icon.png",
    },
    ETH: {
      name: "Ether",
      icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png",
    },
    USDT: {
      name: "Tether",
      icon: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Tether-USDT-icon.png",
    }
  };

  useEffect(() => {
    const fetchBalances = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const res = await api.get('/deposits/balance');

        if (res.data && res.data.balances) {
          const balances = res.data.balances;
          const assets: ICrypto[] = [];

          balances.forEach((b: any, index: number) => {
            const meta = ASSET_METADATA[b.currency] || {
              name: b.currency,
              icon: "https://cdn-icons-png.flaticon.com/512/1213/1213056.png" // generic crypto icon
            };

            // Only add if balance is greater than 0, OR if it's one of the main currencies and we want to show it (optional, but user said NO DUMMY DATA, so maybe strictly > 0 is safer? 
            // Actually, usually wallets show 0 balance for main assets. But let's stick to what API returns. 
            // If API returns it, we show it.

            assets.push({
              id: index + 1,
              name: meta.name,
              symbol: b.currency,
              icon: meta.icon,
              amount: Math.abs(parseFloat(b.amount)).toString(),
              currency: b.currency,
              change: "0%", // We don't have real market data yet
              changePeriod: "24h",
              barChartData: [], // No fake charts
              lineChartData: [], // No fake charts
              status: 1,
            });
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
