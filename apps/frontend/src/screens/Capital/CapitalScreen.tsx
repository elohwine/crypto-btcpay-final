import { useState, useEffect } from "react";
import axios from "axios";
import { Loader, Center, Text } from "@mantine/core";

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
  const [data, setData] = useState<ICrypto[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
  }, []);

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
