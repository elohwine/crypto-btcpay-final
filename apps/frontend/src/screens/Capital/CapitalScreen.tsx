import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../lib/api";
import { Loader, Center, Text, Card, Group, Stack, Title as MantineTitle, ThemeIcon, Grid } from "@mantine/core";
import { IconWallet, IconTrendingUp } from "@tabler/icons-react";
import { useAuth } from "../../lib/auth";
import { useAppTheme } from "../../lib/themeUtils";

// components
import TopLayout from "../../layouts/TopLayout";
import TopBar from "../../components/Tables/TopBar/TopBar";
import CapitalRow from "../../components/Tables/Capital/CapitalRow";

// interfaces
interface ICrypto {
  id: number;
  name: string;
  icon: string;
  symbol: string;
  weight: string;
  amount: string;
  change: string;
  status: number;
  currency: string;
  lineChartData: number[];
}

const CapitalScreen: React.FC = () => {
  const { user } = useAuth();
  const { primary } = useAppTheme();
  const [data, setData] = useState<ICrypto[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userBalance, setUserBalance] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch User Balance if logged in
        if (user) {
          try {
            const balanceRes = await api.get('/deposits/balance');
            if (balanceRes.data && balanceRes.data.balances) {
              const usdt = balanceRes.data.balances.find((b: any) => b.currency === 'USDT');
              setUserBalance(usdt ? usdt.amount : 0);
            }
          } catch (e) {
            console.error("Failed to fetch user balance", e);
          }
        }

        // Fetch Market Data
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              ids: "bitcoin,ethereum,tether,ripple,polkadot,dogecoin,cardano,solana,binancecoin,tron",
              order: "market_cap_desc",
              per_page: 20,
              page: 1,
              sparkline: true,
            },
          }
        );

        const mappedData: ICrypto[] = response.data.map((coin: any, index: number) => ({
          id: index + 1,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          icon: coin.image,
          amount: coin.current_price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          currency: "USD",
          change: `${coin.price_change_percentage_24h > 0 ? "+" : ""}${coin.price_change_percentage_24h.toFixed(2)}%`,
          weight: `$${(coin.market_cap / 1000000000).toFixed(2)}B`,
          lineChartData: coin.sparkline_in_7d?.price?.slice(-20) || [],
          status: coin.price_change_percentage_24h >= 0 ? 1 : 2,
        }));

        setData(mappedData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch crypto data", err);
        setError("Failed to load market data. Please try again later.");
        // Fallback to empty or cached data if needed, but for now show error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  /**
   * Handles the search input value change.
   */
  const handleSearchValue = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    setKeyword(value);
  };

  /**
   * Handles the search form submission.
   */
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
  };

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(keyword.toLowerCase()) ||
    item.symbol.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <TopLayout>
      <TopBar
        searchValue={keyword}
        searchSubmit={handleSearchSubmit}
        searchOnChange={handleSearchValue}
      />

      {/* User Portfolio Section */}
      {user && (
        <Grid mb={40} mt={20}>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <ThemeIcon size="xl" radius="md" color={primary} variant="light">
                  <IconWallet size={28} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">Total Capital</Text>
                  <MantineTitle order={2}>${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</MantineTitle>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group>
                <ThemeIcon size="xl" radius="md" color="green" variant="light">
                  <IconTrendingUp size={28} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">Active Assets</Text>
                  <Text fw={500}>USDT, BTC, ETH</Text>
                </Stack>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {loading ? (
        <Center style={{ height: 400 }}>
          <Loader size="xl" />
        </Center>
      ) : error ? (
        <Center style={{ height: 400 }}>
          <Text c="red">{error}</Text>
        </Center>
      ) : (
        filteredData && filteredData.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th className="left">#</th>
                <th className="left">Coin</th>
                <th className="center">Latest price</th>
                <th className="center">Change (24h)</th>
                <th className="center responsive-hide2">Market Cap</th>
                <th className="left responsive-hide">Graphic</th>
                <th aria-label="empty" className="right">
                  &nbsp;
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item: ICrypto, index: number) => (
                <CapitalRow
                  key={item.id.toString()}
                  item={item}
                  index={index + 1}
                />
              ))}
            </tbody>
          </table>
        )
      )}
    </TopLayout>
  );
};

export default CapitalScreen;
