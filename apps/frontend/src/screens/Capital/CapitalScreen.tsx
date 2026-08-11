import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, Group, SimpleGrid, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import SiteLayout from "../../layouts/SiteLayout";
import Header from "../../components/Header/Header";

interface MarketRow {
  symbol: string;
  lastPrice: number | null;
  changePercent: number | null;
  high24h: number | null;
  low24h: number | null;
  volume24h: number | null;
  bestBid: number | null;
  bestAsk: number | null;
}

const CapitalScreen: React.FC = () => {
  const [data, setData] = useState<MarketRow[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await api.get("/spot/markets", {
          params: { includeOrderBookTop: "true" },
        });
        if (!mounted) return;
        setData(Array.isArray(res.data) ? res.data : []);
      } catch {
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
  }, []);

  const filteredData = useMemo(() => {
    const query = keyword.trim().toUpperCase();
    return data.filter((item) => !query || item.symbol.toUpperCase().includes(query));
  }, [data, keyword]);

  const sortedByVolume = [...filteredData].sort(
    (left, right) => Number(right.volume24h || 0) - Number(left.volume24h || 0)
  );

  return (
    <SiteLayout>
      <Header icon="sort" title="Market" />
      <div className="spot-directory-shell">
        <Card className="spot-directory-hero" radius="xl" p="xl" mb="lg">
          <Group justify="space-between" align="flex-end" gap="lg">
            <div>
              <Badge color="blue" variant="light" mb="sm">
                Market directory
              </Badge>
              <Title order={2}>Live spot pairs, ranked like an exchange board.</Title>
              <Text mt="sm" c="dimmed">
                Browse enabled USDT pairs, inspect the 24h range and liquidity, and jump directly into the spot terminal.
              </Text>
            </div>
            <TextInput
              value={keyword}
              onChange={(event) => setKeyword(event.currentTarget.value)}
              placeholder="Search BTC_USDT"
              size="md"
              radius="xl"
            />
          </Group>
        </Card>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" mb="lg">
          <Card radius="xl" p="lg">
            <Text size="xs" c="dimmed">Active pairs</Text>
            <Title order={3}>{filteredData.length}</Title>
          </Card>
          <Card radius="xl" p="lg">
            <Text size="xs" c="dimmed">Highest 24h volume</Text>
            <Title order={3}>{sortedByVolume[0]?.symbol?.replace("_", "/") || "--"}</Title>
          </Card>
          <Card radius="xl" p="lg">
            <Text size="xs" c="dimmed">Primary quote asset</Text>
            <Title order={3}>USDT</Title>
          </Card>
        </SimpleGrid>

        <Card radius="xl" p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Pair</Table.Th>
                <Table.Th ta="right">Last price</Table.Th>
                <Table.Th ta="right">24h change</Table.Th>
                <Table.Th ta="right">High</Table.Th>
                <Table.Th ta="right">Low</Table.Th>
                <Table.Th ta="right">24h volume</Table.Th>
                <Table.Th ta="right">Bid / Ask</Table.Th>
                <Table.Th ta="right">Trade</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredData.map((item) => (
                <Table.Tr key={item.symbol}>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text fw={700}>{item.symbol.replace("_", "/")}</Text>
                      <Text size="xs" c="dimmed">Spot</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td ta="right">{item.lastPrice ? Number(item.lastPrice).toFixed(4) : "--"}</Table.Td>
                  <Table.Td ta="right" c={(item.changePercent || 0) >= 0 ? "green" : "red"}>
                    {item.changePercent != null
                      ? `${item.changePercent >= 0 ? "+" : ""}${Number(item.changePercent).toFixed(2)}%`
                      : "--"}
                  </Table.Td>
                  <Table.Td ta="right">{item.high24h ? Number(item.high24h).toFixed(4) : "--"}</Table.Td>
                  <Table.Td ta="right">{item.low24h ? Number(item.low24h).toFixed(4) : "--"}</Table.Td>
                  <Table.Td ta="right">{item.volume24h ? Number(item.volume24h).toFixed(4) : "--"}</Table.Td>
                  <Table.Td ta="right">
                    {item.bestBid && item.bestAsk
                      ? `${Number(item.bestBid).toFixed(2)} / ${Number(item.bestAsk).toFixed(2)}`
                      : "-- / --"}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Button component={Link} to={`/trade/${item.symbol}`} radius="xl" size="xs">
                      Trade
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </div>
    </SiteLayout>
  );
};

export default CapitalScreen;
