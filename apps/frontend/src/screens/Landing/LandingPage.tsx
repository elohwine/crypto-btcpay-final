import React from "react";
import {
  AppShell,
  Container,
  Group,
  Button,
  Text,
  Title,
  Card,
  Badge,
  Grid,
  Stack,
  Box,
  Flex,
  ThemeIcon,
  Avatar,
  SimpleGrid,
  useMantineTheme,
  Image,
  List,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconTrendingUp,
  IconShield,
  IconBolt,
  IconUsers,
  IconChartBar,
  IconWallet,
  IconClock,
  IconCheck,
} from "@tabler/icons-react";
import PlanCard from "../../components/PlanCard/PlanCard";
import { INVESTMENT_PLANS } from "../../types/investment";

const LandingPage: React.FC = () => {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const primaryLight = theme.colors[theme.primaryColor][1];

  return (
    <AppShell padding={0}>
      {/* Hero */}
      <Box
        py={100}
        style={{
          background:
            (theme as any).colorScheme === "dark"
              ? `linear-gradient(135deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[8]} 100%)`
              : `linear-gradient(135deg, ${theme.colors.gray[0]} 0%, ${theme.colors[theme.primaryColor][0]} 100%)`,
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xl">
            <Badge size="xl" variant="light" color={theme.primaryColor}>
              CAPITAL ONE TRADING INVESTMENT
            </Badge>
            <Title order={1} ta="center" size={52} style={{ maxWidth: 1000 }}>
              Real Binary Options Trading <br />
              <span style={{ color: primary }}>With Guaranteed Returns</span>
            </Title>
            <Text
              size="xl"
              c="dimmed"
              ta="center"
              style={{ maxWidth: 800, lineHeight: 1.6 }}
            >
              Unlike traditional programs, we don't circulate funds. We generate
              real profits from real markets and distribute them according to
              committed profit percentages every weekend.
            </Text>
            <Group gap="md" mt="md">
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/members/signup"
                color={theme.primaryColor}
                leftSection={<IconTrendingUp size={20} />}
              >
                Start Investing Today
              </Button>
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/about"
                variant="default"
                leftSection={<IconChartBar size={20} />}
              >
                Learn More
              </Button>
            </Group>

            {/* Key stats */}
            <SimpleGrid
              cols={{ base: 1, sm: 3 }}
              spacing="xl"
              mt={40}
              style={{ width: "100%" }}
            >
              <Card shadow="sm" padding="lg" radius="md">
                <Stack align="center" gap="xs">
                  <ThemeIcon size={50} radius="xl" color={theme.primaryColor}>
                    <IconWallet size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700}>
                    4 Trading Pools
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Each funded with $50,000 USD for specialized trading
                  </Text>
                </Stack>
              </Card>
              <Card shadow="sm" padding="lg" radius="md">
                <Stack align="center" gap="xs">
                  <ThemeIcon size={50} radius="xl" color="green">
                    <IconTrendingUp size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700}>
                    Up to 5.5% Daily
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Consistent returns from professional binary options trading
                  </Text>
                </Stack>
              </Card>
              <Card shadow="sm" padding="lg" radius="md">
                <Stack align="center" gap="xs">
                  <ThemeIcon size={50} radius="xl" color="cyan">
                    <IconClock size={24} />
                  </ThemeIcon>
                  <Text size="xl" fw={700}>
                    3x Weekly Payouts
                  </Text>
                  <Text size="sm" c="dimmed" ta="center">
                    Withdraw profits every Monday, Wednesday, and Friday
                  </Text>
                </Stack>
              </Card>
            </SimpleGrid>

          </Stack>
        </Container>
      </Box>

      {/* Investment Plans Section */}
      <Box
        py={100}
        style={{
          background:
            (theme as any).colorScheme === "dark"
              ? theme.colors.dark[8]
              : "#ffffff",
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xl" mb={60}>
            <Badge size="lg" variant="light" color={theme.primaryColor}>
              INVESTMENT PLANS
            </Badge>
            <Title order={2} ta="center" size={42}>
              Choose Your <span style={{ color: primary }}>Investment Plan</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" style={{ maxWidth: 700 }}>
              We accept a limited number of investors daily. Select your plan and
              book your spot early to secure your place in our trading pools.
            </Text>
          </Stack>

          <Grid gutter="xl">
            {INVESTMENT_PLANS.map((plan) => (
              <Grid.Col key={plan.id} span={{ base: 12, sm: 6, lg: 3 }}>
                <PlanCard plan={plan} />
              </Grid.Col>
            ))}
          </Grid>

          {/* Additional info */}
          <Card
            shadow="md"
            padding="xl"
            radius="lg"
            mt={60}
            style={{
              background:
                (theme as any).colorScheme === "dark"
                  ? theme.colors.dark[6]
                  : theme.colors.gray[0],
            }}
          >
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Group>
                    <ThemeIcon size={40} radius="xl" color="green">
                      <IconCheck size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">
                        10% Referral Bonus
                      </Text>
                      <Text size="sm" c="dimmed">
                        Paid immediately after your referral invests
                      </Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={40} radius="xl" color="blue">
                      <IconClock size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">
                        Flexible Withdrawals
                      </Text>
                      <Text size="sm" c="dimmed">
                        Monday, Wednesday, Friday (minimum $5)
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="md">
                  <Group>
                    <ThemeIcon size={40} radius="xl" color="cyan">
                      <IconWallet size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">
                        USDT Only
                      </Text>
                      <Text size="sm" c="dimmed">
                        We accept USDT for easier and secure transactions
                      </Text>
                    </div>
                  </Group>
                  <Group>
                    <ThemeIcon size={40} radius="xl" color="orange">
                      <IconShield size={20} />
                    </ThemeIcon>
                    <div>
                      <Text fw={600} size="lg">
                        Principal Protected
                      </Text>
                      <Text size="sm" c="dimmed">
                        Withdraw principal after plan duration completes
                      </Text>
                    </div>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Card>
        </Container>
      </Box>

      {/* How It Works */}
      <Box
        py={100}
        style={{
          background:
            (theme as any).colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[0],
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xl" mb={60}>
            <Badge size="lg" variant="light" color={theme.primaryColor}>
              HOW IT WORKS
            </Badge>
            <Title order={2} ta="center" size={42}>
              Professional Trading, <br />
              <span style={{ color: primary }}>Proven Results</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" style={{ maxWidth: 800 }}>
              Our experienced traders manage 4 specialized investment pools, each
              funded with $50,000 USD. Every plan has its own dedicated pool for
              focused attention and optimized returns.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
            <Card shadow="md" padding="xl" radius="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={80} radius="xl" color={theme.primaryColor}>
                  <IconWallet size={40} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  1. Deposit USDT
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  Choose your investment plan and deposit USDT. Your investment
                  moves directly to our trading account managed by experienced
                  professionals.
                </Text>
              </Stack>
            </Card>

            <Card shadow="md" padding="xl" radius="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={80} radius="xl" color="green">
                  <IconChartBar size={40} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  2. We Trade & Profit
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  Our finance department allocates your investment to the
                  appropriate trading pool. Professional traders execute binary
                  options strategies to generate real profits.
                </Text>
              </Stack>
            </Card>

            <Card shadow="md" padding="xl" radius="lg">
              <Stack align="center" gap="md">
                <ThemeIcon size={80} radius="xl" color="cyan">
                  <IconTrendingUp size={40} />
                </ThemeIcon>
                <Title order={3} size="h4" ta="center">
                  3. Earn & Withdraw
                </Title>
                <Text size="sm" c="dimmed" ta="center">
                  Profits are distributed every weekend according to your plan's
                  committed percentage. Withdraw profits Mon/Wed/Fri with a $5
                  minimum.
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          {/* Trust indicators */}
          <Stack align="center" gap="lg" mt={60}>
            <Title order={3} size="h4" ta="center">
              Why Choose Capital One Trading?
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" style={{ maxWidth: 800 }}>
              <Group>
                <IconCheck size={20} color={primary} />
                <Text size="sm">Real binary options trading, not fund circulation</Text>
              </Group>
              <Group>
                <IconCheck size={20} color={primary} />
                <Text size="sm">4 dedicated trading pools with $200K total capital</Text>
              </Group>
              <Group>
                <IconCheck size={20} color={primary} />
                <Text size="sm">Experienced traders with proven track records</Text>
              </Group>
              <Group>
                <IconCheck size={20} color={primary} />
                <Text size="sm">Complete transaction transparency</Text>
              </Group>
              <Group>
                <IconCheck size={20} color={primary} />
                <Text size="sm">Regular profit distributions every weekend</Text>
              </Group>
              <Group>
                <IconCheck size={20} color={primary} />
                <Text size="sm">Limited daily investor intake for quality service</Text>
              </Group>
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box
        py={80}
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${theme.colors[theme.primaryColor][8]} 100%)`,
          color: "white",
        }}
      >
        <Container size="md">
          <Stack align="center" gap="xl">
            <Title order={2} ta="center" style={{ color: "white" }}>
              Ready to Start Earning?
            </Title>
            <Text size="lg" ta="center" c="white" style={{ maxWidth: 600 }}>
              Don't miss this opportunity! We accept a limited number of
              investors each day. Book your spot now and start generating
              consistent returns from professional binary options trading.
            </Text>
            <Group gap="md">
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/members/signup"
                variant="white"
                color="dark"
                leftSection={<IconTrendingUp size={20} />}
              >
                Start Investing Now
              </Button>
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/about"
                variant="outline"
                style={{ borderColor: "white", color: "white" }}
              >
                Learn More
              </Button>
            </Group>
            <Text size="sm" ta="center" c="white" style={{ opacity: 0.9 }}>
              Minimum investment starts at just $10 • USDT only • 10% referral
              bonus
            </Text>
          </Stack>
        </Container>
      </Box>
    </AppShell>
  );
};

export default LandingPage;
