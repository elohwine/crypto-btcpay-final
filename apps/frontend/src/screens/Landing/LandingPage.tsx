import React, { useEffect, useMemo, useState } from "react";
import {
  AppShell,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { IconChartLine, IconShield, IconTrendingUp, IconWallet } from "@tabler/icons-react";
import api from "../../lib/api";

type MarketRow = {
  symbol: string;
  lastPrice?: number | string | null;
  lastTradeAt?: string | null;
  bestBid?: number | string | null;
  bestAsk?: number | string | null;
  spread?: number | string | null;
};

type Announcement = {
  title: string;
  date: string;
  body: string;
};

const announcements: Announcement[] = [
  {
    title: "FYC token subscription now open",
    date: "2026-06-30",
    body:
      "Platform token subscriptions, VIP perks, and future ecosystem rewards are highlighted on the home page, mirroring the exchange-style announcement feed.",
  },
  {
    title: "Security upgrades in progress",
    date: "2026-05-16",
    body:
      "The platform emphasizes account safety, login protection, and secure asset storage across the exchange flow.",
  },
  {
    title: "New user rewards and trial funds",
    date: "2026-07-01",
    body:
      "The landing page now directs users to sign up and immediately enter the spot terminal with a cleaner onboarding path.",
  },
];

const featureCards = [
  {
    title: "Spot Trading",
    body: "200+ pairs on the reference site, mirrored here by a live spot terminal, order book, trades, and balances.",
    icon: IconChartLine,
  },
  {
    title: "Buy and Sell",
    body: "The platform flow now centers on live market pricing and order entry rather than deposits-first banking UI.",
    icon: IconWallet,
  },
  {
    title: "Account Security",
    body: "Authentication, protected routes, and user balance handling remain part of the app-wide foundation.",
    icon: IconShield,
  },
  {
    title: "User Center",
    body: "Dashboard and profile views now show balances, recent orders, and a direct route into the market terminal.",
    icon: IconTrendingUp,
  },
];

const marketTabs = [
  { key: "hot", label: "Hot List" },
  { key: "value", label: "Market Value" },
  { key: "gainers", label: "Top Gainers" },
] as const;

const LandingPage: React.FC = () => {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const primaryLight = theme.colors[theme.primaryColor][1];
  const [marketRows, setMarketRows] = useState<MarketRow[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof marketTabs)[number]["key"]>("hot");

  useEffect(() => {
    let mounted = true;

    const loadMarkets = async () => {
      try {
        const response = await api.get("/spot/markets", {
          params: { includeOrderBookTop: "true" },
        });
        if (!mounted) return;
        setMarketRows(Array.isArray(response.data) ? response.data : []);
      } catch {
        if (!mounted) return;
        setMarketRows([
          { symbol: "BTC_USDT", lastPrice: null, lastTradeAt: null },
          { symbol: "ETH_USDT", lastPrice: null, lastTradeAt: null },
          { symbol: "TRX_USDT", lastPrice: null, lastTradeAt: null },
        ]);
      }
    };

    loadMarkets();
    const timer = window.setInterval(loadMarkets, 5000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const selectedMarkets = useMemo(() => {
    const rows = [...marketRows];
    const byPrice = rows.sort((left, right) => Number(right.lastPrice || 0) - Number(left.lastPrice || 0));
    if (activeTab === "value") return byPrice;
    if (activeTab === "gainers") {
      return rows.sort((left, right) => Number(right.spread || 0) - Number(left.spread || 0));
    }
    return rows.sort((left, right) => Number(right.lastTradeAt ? new Date(right.lastTradeAt).getTime() : 0) - Number(left.lastTradeAt ? new Date(left.lastTradeAt).getTime() : 0));
  }, [activeTab, marketRows]);

  const heroMarkets = selectedMarkets.slice(0, 5);
  const marketSummary = heroMarkets.length || 3;

  return (
    <AppShell padding={0}>
      <Box
        py={72}
        style={{
          background:
            "linear-gradient(180deg, rgba(16,24,40,0.96) 0%, rgba(15,23,42,0.88) 100%)",
          color: "white",
        }}
      >
        <Container size="xl">
          <Grid align="center" gutter={36}>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Badge variant="light" color="blue" size="lg" mb="md">
                Spot Trading Platform
              </Badge>
              <Title order={1} size={56} style={{ lineHeight: 1.05, maxWidth: 780 }}>
                The most trustworthy place to trade digital assets.
              </Title>
              <Text size="lg" mt="lg" style={{ maxWidth: 680, color: "rgba(255,255,255,0.82)" }}>
                The home page now behaves like an exchange hub: live market data, announcements, account access, and a direct path into the spot terminal.
              </Text>
              <Group mt="xl" gap="md">
                <Button size="lg" radius="md" component={Link} to="/market">
                  Open Spot Market
                </Button>
                <Button size="lg" radius="md" component={Link} to="/dashboard" variant="white" color="dark">
                  View Dashboard
                </Button>
                <Button size="lg" radius="md" component={Link} to="/members/signup" variant="outline" style={{ color: "white", borderColor: "rgba(255,255,255,0.35)" }}>
                  Sign Up
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt={36}>
                <Card radius="lg" p="md" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}>
                  <Text size="xs" tt="uppercase" style={{ color: "rgba(255,255,255,0.64)" }}>
                    Live pairs
                  </Text>
                  <Title order={3} c="white">
                    {marketSummary}+
                  </Title>
                </Card>
                <Card radius="lg" p="md" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}>
                  <Text size="xs" tt="uppercase" style={{ color: "rgba(255,255,255,0.64)" }}>
                    Spot focus
                  </Text>
                  <Title order={3} c="white">
                    BTC / USDT
                  </Title>
                </Card>
                <Card radius="lg" p="md" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}>
                  <Text size="xs" tt="uppercase" style={{ color: "rgba(255,255,255,0.64)" }}>
                    Platform status
                  </Text>
                  <Title order={3} c="white">
                    Trading ready
                  </Title>
                </Card>
              </SimpleGrid>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card radius="xl" p="lg" style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}>
                <Group justify="space-between" mb="md">
                  <div>
                    <Text size="sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                      Hot List
                    </Text>
                    <Title order={3} c="white">
                      Market value
                    </Title>
                  </div>
                  <Button component={Link} to="/market" variant="white" color="dark" size="sm">
                    View more
                  </Button>
                </Group>
                <Group gap="xs" mb="md" wrap="wrap">
                  {marketTabs.map((tab) => (
                    <Button
                      key={tab.key}
                      size="xs"
                      radius="xl"
                      variant={activeTab === tab.key ? "filled" : "default"}
                      color={activeTab === tab.key ? "blue" : "gray"}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </Group>
                <Stack gap="sm">
                  {heroMarkets.map((row) => {
                    const [base = "BTC", quote = "USDT"] = row.symbol.split("_");
                    const price = row.lastPrice ? Number(row.lastPrice).toFixed(4) : "--";
                    const change = row.spread ? Number(row.spread).toFixed(4) : "0.0000";

                    return (
                      <Card key={row.symbol} radius="lg" p="md" style={{ background: "rgba(15,23,42,0.55)", borderColor: "rgba(255,255,255,0.12)" }}>
                        <Group justify="space-between" align="center">
                          <div>
                            <Text fw={700} c="white">
                              {base}
                            </Text>
                            <Text size="xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                              /{quote}
                            </Text>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <Text fw={700} c="white">
                              {price}
                            </Text>
                            <Text size="xs" c={Number(change) >= 0 ? "green.3" : "red.3"}>
                              {Number(change) >= 0 ? "+" : ""}{change}
                            </Text>
                          </div>
                        </Group>
                      </Card>
                    );
                  })}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box py={72} style={{ background: theme.white }}>
        <Container size="xl">
          <Stack align="center" gap="xs" mb={36}>
            <Badge variant="light" color="blue" size="lg">
              Product description
            </Badge>
            <Title order={2} ta="center">
              Start your cryptocurrency journey with the repurposed spot stack
            </Title>
            <Text size="md" c="dimmed" ta="center" style={{ maxWidth: 760 }}>
              The reference site groups spot, futures, buying, security, and user-center entry points. This landing page now does the same for the current platform.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} radius="lg" p="lg" shadow="sm">
                  <Stack gap="md">
                    <Box>
                      <Icon size={30} color={primary} />
                    </Box>
                    <Title order={4}>{feature.title}</Title>
                    <Text size="sm" c="dimmed">
                      {feature.body}
                    </Text>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      <Box py={72} style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
        <Container size="xl">
          <Grid gutter={32}>
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="md" mb={20}>
                <Badge variant="light" color="orange" size="lg" w="fit-content">
                  Announcements
                </Badge>
                <Title order={2}>Platform updates</Title>
              </Stack>

              <Stack gap="md">
                {announcements.map((item) => (
                  <Card key={item.title} radius="lg" p="lg" shadow="sm">
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <Title order={4}>{item.title}</Title>
                      <Text size="sm" c="dimmed">
                        {item.date}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {item.body}
                    </Text>
                  </Card>
                ))}
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card radius="xl" p="lg" shadow="sm" style={{ position: "sticky", top: 24 }}>
                <Stack gap="md">
                  <Badge variant="light" color="cyan" size="lg" w="fit-content">
                    Why this matches the site
                  </Badge>
                  <Title order={3}>The site is a market hub with onboarding and info pages.</Title>
                  <Text size="sm" c="dimmed">
                    FYNOR’s entry flow is centered around spot trading, market lists, announcements, and user/account pathways. Our platform now mirrors that structure around the live spot terminal.
                  </Text>
                  <Stack gap={8}>
                    <Text size="sm">Spot trading terminal and order book</Text>
                    <Text size="sm">Dashboard balances and recent orders</Text>
                    <Text size="sm">Announcements, onboarding, and sign-up CTAs</Text>
                    <Text size="sm">Account/security and user-center surfaces</Text>
                  </Stack>
                  <Group gap="sm" mt="md">
                    <Button component={Link} to="/market" size="md">
                      Open market
                    </Button>
                    <Button component={Link} to="/members/signup" size="md" variant="default">
                      Create account
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      <Box py={68} style={{ background: `linear-gradient(135deg, ${primary}, ${primaryLight})`, color: "white" }}>
        <Container size="xl">
          <Grid align="center">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Title order={3} c="white">
                Trade spot markets with a cleaner exchange home
              </Title>
              <Text c="white" mt="sm">
                The platform now starts where the user expects: market insight, account entry, and a direct path into the trading terminal.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Group justify="flex-end">
                <Button component={Link} to="/market" size="lg" radius="md" color="dark">
                  Go to spot market
                </Button>
                <Button component={Link} to="/members/signin" size="lg" radius="md" variant="white" color="dark">
                  Sign in
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>
    </AppShell>
  );
};

export default LandingPage;