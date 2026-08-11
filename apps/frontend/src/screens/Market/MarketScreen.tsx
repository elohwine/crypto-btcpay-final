import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Badge,
  Box as MantineBox,
  Button,
  Card,
  Drawer,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import api from "../../lib/api";
import MainLayout from "../../layouts/MainLayout";
import Header from "../../components/Header/Header";
import Market from "../../components/Widgets/Market/Market";
import BuySell from "../../components/Widgets/BuySell/BuySell";
import BuyOrders from "../../components/Widgets/BuyOrders/BuyOrders";
import SellOrders from "../../components/Widgets/SellOrders/SellOrders";
import TradeHistory from "../../components/Widgets/TradeHistory/TradeHistory";
import OpenOrders from "../../components/Widgets/OpenOrders/OpenOrders";
import CoinVertical from "../../components/Widgets/Coin/CoinVertical";
import CandleStick from "../../components/Widgets/CandleStick/CandleStick";
import BankProcess from "../../components/Widgets/BankProcess/BankProcess";

interface ICrypto {
  id: number;
  name: string;
  icon: string;
  symbol: string;
  weight: string;
  amount: string;
  change: string;
  currency: string;
  exchange: string;
  description: string;
  financialRate: string;
  high24h?: string;
  low24h?: string;
  volume24h?: string;
  turnover24h?: string;
}

const tokenIcon = (symbol: string, color: string) => {
  const label = symbol.slice(0, 3).toUpperCase();
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
    </defs>
    <circle cx="48" cy="48" r="46" fill="url(#g)" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Poppins, Arial" font-size="28" font-weight="700" fill="#ffffff">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const symbolColor: Record<string, string> = {
  BTC: "#f7931a",
  ETH: "#627eea",
  TRX: "#ef0027",
  SOL: "#14f195",
  XRP: "#23292f",
  ADA: "#2a6df4",
  DOGE: "#c2a633",
  BNB: "#f0b90b",
  LTC: "#345c9c",
  AVAX: "#e84142",
};

const coinData: ICrypto = {
  id: 1,
  name: "Bitcoin",
  symbol: "BTC",
  change: "--",
  currency: "USDT",
  exchange: "BTC/USDT",
  weight: "-- / --",
  financialRate: "Waiting for market data",
  icon: tokenIcon("BTC", symbolColor.BTC),
  amount: "--",
  description: "Live spot terminal for BTC/USDT with order book, recent trades, and direct account funding.",
  high24h: "--",
  low24h: "--",
  volume24h: "--",
  turnover24h: "--",
};

const MarketScreen: React.FC = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSymbol = String(params.symbol || searchParams.get("symbol") || "BTC_USDT")
    .toUpperCase()
    .replace("/", "_");
  const [activeSymbol, setActiveSymbol] = useState<string>(requestedSymbol);
  const [coinInfo, setCoinInfo] = useState<ICrypto | null>(null);
  const [fundingOpen, setFundingOpen] = useState(false);

  useEffect(() => {
    setActiveSymbol(requestedSymbol);
  }, [requestedSymbol]);

  useEffect(() => {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.set("symbol", activeSymbol);
        return next;
      },
      { replace: true }
    );
  }, [activeSymbol, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    const marketDescriptions: Record<string, string> = {
      BTC_USDT: "Bitcoin leads the flagship USDT market with the deepest liquidity on this stack.",
      ETH_USDT: "Ether trades on the same live matching engine with the same balance, orderbook, and recent trade feeds.",
      TRX_USDT: "TRX keeps the platform aligned with the Tron-oriented deposit and wallet flow already present in the app.",
    };

    const load = async () => {
      try {
        const res = await api.get("/spot/markets", {
          params: { includeOrderBookTop: "true" },
        });
        if (!mounted) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        const market = rows.find((row: any) => row.symbol === activeSymbol);
        if (!market) {
          setCoinInfo(coinData);
          return;
        }

        const lastPrice = Number(market.lastPrice || 0);
        const bestBid = Number(market.bestBid || 0);
        const bestAsk = Number(market.bestAsk || 0);
        const spread = bestBid && bestAsk ? bestAsk - bestBid : Number(market.spread || 0);
        const high24h = Number(market.high24h || 0);
        const low24h = Number(market.low24h || 0);
        const volume24h = Number(market.volume24h || 0);
        const turnover24h = volume24h > 0 && lastPrice > 0 ? volume24h * lastPrice : 0;
        const [base = "BTC", quote = "USDT"] = activeSymbol.split("_");

        setCoinInfo({
          id: 1,
          name: base === "BTC" ? "Bitcoin" : base,
          symbol: base,
          currency: quote,
          exchange: `${base}/${quote}`,
          amount: lastPrice > 0 ? lastPrice.toFixed(4) : "--",
          change: spread ? `${spread >= 0 ? "+" : ""}${spread.toFixed(4)}` : "--",
          weight:
            bestBid && bestAsk
              ? `${bestBid.toFixed(2)} / ${bestAsk.toFixed(2)}`
              : "-- / --",
          financialRate: market.lastTradeAt
            ? `Last trade ${new Date(market.lastTradeAt).toLocaleTimeString()}`
            : "No trades yet",
          description:
            marketDescriptions[activeSymbol] ||
            `${base}/${quote} uses the same live spot stack, funding flow, and open-order management as the flagship pair.`,
          icon: tokenIcon(base, symbolColor[base] || "#2563eb"),
          high24h: high24h > 0 ? high24h.toFixed(4) : "--",
          low24h: low24h > 0 ? low24h.toFixed(4) : "--",
          volume24h: volume24h > 0 ? volume24h.toFixed(4) : "--",
          turnover24h: turnover24h > 0 ? turnover24h.toFixed(2) : "--",
        });
      } catch {
        if (!mounted) return;
        setCoinInfo(coinData);
      }
    };

    load();
    const timer = window.setInterval(load, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [activeSymbol]);

  return (
    <MainLayout>
      <div className="content spot-screen-shell">
        <Header title="Spot" />

        {coinInfo && (
          <Card className="spot-hero-card" radius="xl" p="xl" mb="lg">
            <Group justify="space-between" align="flex-start" gap="lg">
              <div>
                <Badge color="blue" variant="light" mb="sm">
                  Spot terminal
                </Badge>
                <Title order={2} className="spot-hero-title">
                  {coinInfo.exchange}
                </Title>
                <Text className="spot-hero-price">
                  {coinInfo.amount} {coinInfo.currency}
                </Text>
                <Text className="spot-hero-copy">{coinInfo.description}</Text>
              </div>
              <Group gap="sm">
                <Button radius="xl" onClick={() => setFundingOpen(true)}>
                  Fund account
                </Button>
                <Button radius="xl" variant="light" onClick={() => setActiveSymbol("BTC_USDT")}>
                  BTC/USDT
                </Button>
              </Group>
            </Group>

            <SimpleGrid cols={{ base: 2, md: 6 }} mt="xl" spacing="sm">
              <Card className="spot-stat-card" radius="lg" p="md">
                <Text size="xs" c="dimmed">Spread</Text>
                <Text fw={700}>{coinInfo.change}</Text>
              </Card>
              <Card className="spot-stat-card" radius="lg" p="md">
                <Text size="xs" c="dimmed">Bid / Ask</Text>
                <Text fw={700}>{coinInfo.weight}</Text>
              </Card>
              <Card className="spot-stat-card" radius="lg" p="md">
                <Text size="xs" c="dimmed">24h High</Text>
                <Text fw={700}>{coinInfo.high24h}</Text>
              </Card>
              <Card className="spot-stat-card" radius="lg" p="md">
                <Text size="xs" c="dimmed">24h Low</Text>
                <Text fw={700}>{coinInfo.low24h}</Text>
              </Card>
              <Card className="spot-stat-card" radius="lg" p="md">
                <Text size="xs" c="dimmed">24h Vol</Text>
                <Text fw={700}>{coinInfo.volume24h}</Text>
              </Card>
              <Card className="spot-stat-card" radius="lg" p="md">
                <Text size="xs" c="dimmed">24h Turnover</Text>
                <Text fw={700}>{coinInfo.turnover24h}</Text>
              </Card>
            </SimpleGrid>
          </Card>
        )}

        <Grid gutter="lg" align="stretch">
          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="lg">
              <Market activeSymbol={activeSymbol} onSelectSymbol={setActiveSymbol} />
              {coinInfo && <CoinVertical item={coinInfo} />}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Stack gap="lg">
              <Card className="spot-panel-card" radius="xl" p="sm">
                <CandleStick symbol={activeSymbol} />
              </Card>

              <Card className="spot-panel-card" radius="xl" p="sm">
                <Tabs defaultValue="orderbook" color="blue">
                  <Tabs.List>
                    <Tabs.Tab value="orderbook">Orderbook</Tabs.Tab>
                    <Tabs.Tab value="trades">Recent trades</Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value="orderbook" pt="md">
                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <SellOrders symbol={activeSymbol} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <BuyOrders symbol={activeSymbol} />
                      </Grid.Col>
                    </Grid>
                  </Tabs.Panel>
                  <Tabs.Panel value="trades" pt="md">
                    <TradeHistory symbol={activeSymbol} />
                  </Tabs.Panel>
                </Tabs>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Stack gap="lg">
              <BuySell symbol={activeSymbol} />
              <OpenOrders symbol={activeSymbol} compact />
              <Card className="spot-funding-card" radius="xl" p="lg">
                <Text fw={700} size="lg">Funding</Text>
                <Text size="sm" c="dimmed" mt="xs">
                  Create a deposit invoice, connect TronLink for auto-send, or use a manual QR payment without leaving the trading view.
                </Text>
                <Button fullWidth mt="md" radius="xl" onClick={() => setFundingOpen(true)}>
                  Open funding panel
                </Button>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        <Drawer
          opened={fundingOpen}
          onClose={() => setFundingOpen(false)}
          position="right"
          size="xl"
          title="Fund your spot account"
        >
          <MantineBox pb="xl">
            <BankProcess />
          </MantineBox>
        </Drawer>
      </div>
    </MainLayout>
  );
};

export default MarketScreen;
