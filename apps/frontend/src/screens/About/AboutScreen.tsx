import React from "react";
import {
  Title,
  Text,
  Stack,
  Card,
  Badge,
  Group,
  SimpleGrid,
  ThemeIcon,
  Timeline,
  Divider,
  List,
  useMantineTheme,
  Button,
  Grid,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconUsers,
  IconShield,
  IconClock,
  IconWallet,
  IconChartBar,
  IconCheck,
  IconCalendar,
  IconGift,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import TopLayout from "../../layouts/TopLayout";
import Header from "../../components/Header/Header";
import PlanCard from "../../components/PlanCard/PlanCard";
import { INVESTMENT_PLANS } from "../../types/investment";

const AboutScreen: React.FC = () => {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const isDark = (theme as any).colorScheme === "dark";

  return (
  <TopLayout>
      <div
        style={{
          padding: "12px",
          maxWidth: 1200,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <Header title="About Capital One Trading" icon="info" />

        {/* Introduction */}
        <Card shadow="sm" padding="xl" radius="md" mb="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={60} radius="xl" color={theme.primaryColor}>
                <IconTrendingUp size={32} />
              </ThemeIcon>
              <div>
                <Title order={2}>What is Capital One Trading Investment?</Title>
                <Text size="sm" c="dimmed">
                  Real binary options trading with guaranteed returns
                </Text>
              </div>
            </Group>

            <Text size="md" style={{ lineHeight: 1.7 }}>
              CAPITAL ONE TRADING INVESTMENT is an investment program based on{" "}
              <strong>real binary options trading</strong>. Unlike other programs,
              we don't circulate funds from member to member. Instead, we make real
              profits from real markets and distribute them among members according
              to the committed profit percentage every weekend.
            </Text>

            <Text size="md" style={{ lineHeight: 1.7 }}>
              Once an investor deposits their investment, it is immediately moved to
              our trading account. Our finance department collects the investment
              and transfers it to one of our 4 specialized trading accounts, each
              funded with $50,000 USD and traded by our experienced traders.
            </Text>

            <Badge size="lg" variant="light" color="green">
              ✓ Each investment plan has its own separate trading pool for
              specialized attention
            </Badge>
          </Stack>
        </Card>

        {/* How It Works */}
        <Card shadow="sm" padding="xl" radius="md" mb="xl">
          <Stack gap="xl">
            <Group>
              <ThemeIcon size={60} radius="xl" color="blue">
                <IconChartBar size={32} />
              </ThemeIcon>
              <Title order={2}>How Our Trading System Works</Title>
            </Group>

            <Timeline active={3} bulletSize={40} lineWidth={3}>
              <Timeline.Item
                bullet={<IconWallet size={20} />}
                title="1. Investor Deposits USDT"
              >
                <Text c="dimmed" size="sm" mt={4}>
                  You choose an investment plan and deposit USDT (TRC20). Your
                  investment is recorded by our finance department.
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconUsers size={20} />}
                title="2. Funds Move to Trading Account"
              >
                <Text c="dimmed" size="sm" mt={4}>
                  The finance team transfers your investment to the appropriate
                  trading pool. Each plan has a dedicated $50,000 pool managed by
                  professional traders.
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconChartBar size={20} />}
                title="3. Experienced Traders Execute Strategies"
              >
                <Text c="dimmed" size="sm" mt={4}>
                  Our traders actively trade binary options using proven strategies.
                  All transactions are recorded and transparent.
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconTrendingUp size={20} />}
                title="4. Profits Distributed Weekly"
              >
                <Text c="dimmed" size="sm" mt={4}>
                  Every weekend, profits are calculated and distributed to investors
                  according to their plan's committed percentage. You can withdraw
                  profits Mon/Wed/Fri.
                </Text>
              </Timeline.Item>
            </Timeline>
          </Stack>
        </Card>

        {/* Investment Plans Summary */}
        <Card shadow="sm" padding="xl" radius="md" mb="xl">
          <Stack gap="xl">
            <Group>
              <ThemeIcon size={60} radius="xl" color="cyan">
                <IconInfoCircle size={32} />
              </ThemeIcon>
              <Title order={2}>Our Investment Plans</Title>
            </Group>

            <Grid gutter="md">
              {INVESTMENT_PLANS.map((plan) => (
                <Grid.Col key={plan.id} span={{ base: 12, sm: 6, lg: 3 }}>
                  <PlanCard plan={plan} />
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Card>

        {/* Withdrawal Schedule */}
        <Card shadow="sm" padding="xl" radius="md" mb="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={60} radius="xl" color="green">
                <IconCalendar size={32} />
              </ThemeIcon>
              <div>
                <Title order={2}>Withdrawal Schedule</Title>
                <Text size="sm" c="dimmed">
                  Flexible profit withdrawals throughout the week
                </Text>
              </div>
            </Group>

            <Divider />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card
                padding="lg"
                radius="md"
                style={{
                  background: isDark ? theme.colors.dark[6] : theme.colors.blue[0],
                }}
              >
                <Stack align="center" gap="xs">
                  <ThemeIcon size={50} radius="xl" color="blue">
                    <IconClock size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    Monday
                  </Text>
                  <Badge variant="light" color="blue">
                    Withdrawal Day
                  </Badge>
                </Stack>
              </Card>

              <Card
                padding="lg"
                radius="md"
                style={{
                  background: isDark ? theme.colors.dark[6] : theme.colors.cyan[0],
                }}
              >
                <Stack align="center" gap="xs">
                  <ThemeIcon size={50} radius="xl" color="cyan">
                    <IconClock size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    Wednesday
                  </Text>
                  <Badge variant="light" color="cyan">
                    Withdrawal Day
                  </Badge>
                </Stack>
              </Card>

              <Card
                padding="lg"
                radius="md"
                style={{
                  background: isDark ? theme.colors.dark[6] : theme.colors.green[0],
                }}
              >
                <Stack align="center" gap="xs">
                  <ThemeIcon size={50} radius="xl" color="green">
                    <IconClock size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="lg">
                    Friday
                  </Text>
                  <Badge variant="light" color="green">
                    Withdrawal Day
                  </Badge>
                </Stack>
              </Card>
            </SimpleGrid>

            <Card
              padding="md"
              radius="md"
              style={{
                background: isDark
                  ? theme.colors.dark[5]
                  : theme.colors.yellow[0],
                border: `1px solid ${theme.colors.yellow[6]}`,
              }}
            >
              <Group gap="xs">
                <IconInfoCircle size={20} color={theme.colors.yellow[7]} />
                <Text size="sm" fw={600}>
                  Important Withdrawal Rules:
                </Text>
              </Group>
              <List size="sm" mt="xs" spacing="xs">
                <List.Item>
                  Submit your withdrawal request <strong>one day before</strong> the
                  withdrawal day
                </List.Item>
                <List.Item>
                  Minimum withdrawal amount is <strong>$5</strong>
                </List.Item>
                <List.Item>
                  You can only withdraw <strong>profits</strong> during the
                  investment period
                </List.Item>
                <List.Item>
                  Your <strong>principal amount</strong> is withdrawn after your
                  plan's duration completes
                </List.Item>
              </List>
            </Card>
          </Stack>
        </Card>

        {/* Referral Program */}
        <Card shadow="sm" padding="xl" radius="md" mb="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={60} radius="xl" color="orange">
                <IconGift size={32} />
              </ThemeIcon>
              <div>
                <Title order={2}>10% Referral Bonus Program</Title>
                <Text size="sm" c="dimmed">
                  Earn instant rewards by inviting friends
                </Text>
              </div>
            </Group>

            <Divider />

            <Card
              padding="lg"
              radius="md"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.orange[6]} 0%, ${theme.colors.orange[8]} 100%)`,
                color: "white",
              }}
            >
              <Stack align="center" gap="md">
                <Text size="xl" fw={700} ta="center" c="white">
                  Earn 10% Commission on Every Referral
                </Text>
                <Text size="lg" ta="center" c="white" style={{ opacity: 0.95 }}>
                  When someone you refer makes an investment, you instantly receive
                  10% of their investment amount as a bonus
                </Text>
                <Badge size="xl" variant="white" color="dark">
                  Paid Immediately After Investment
                </Badge>
              </Stack>
            </Card>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Card
                padding="md"
                radius="md"
                style={{
                  background: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                }}
              >
                <Text fw={600} mb="xs">
                  Example 1:
                </Text>
                <Text size="sm" c="dimmed">
                  Your friend invests <strong>$500</strong> in the Professional Plan
                </Text>
                <Text size="lg" fw={700} color={primary} mt="xs">
                  → You earn $50 instantly
                </Text>
              </Card>

              <Card
                padding="md"
                radius="md"
                style={{
                  background: isDark ? theme.colors.dark[6] : theme.colors.gray[0],
                }}
              >
                <Text fw={600} mb="xs">
                  Example 2:
                </Text>
                <Text size="sm" c="dimmed">
                  Your friend invests <strong>$2,000</strong> in the VVIP Plan
                </Text>
                <Text size="lg" fw={700} color={primary} mt="xs">
                  → You earn $200 instantly
                </Text>
              </Card>
            </SimpleGrid>
          </Stack>
        </Card>

        {/* Important Notes */}
        <Card shadow="sm" padding="xl" radius="md" mb="xl">
          <Stack gap="md">
            <Group>
              <ThemeIcon size={60} radius="xl" color="red">
                <IconShield size={32} />
              </ThemeIcon>
              <Title order={2}>Important Information</Title>
            </Group>

            <Divider />

            <List
              spacing="md"
              size="md"
              icon={
                <ThemeIcon color="red" size={24} radius="xl">
                  <IconCheck size={16} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <strong>Limited Daily Intake:</strong> We accept a limited number of
                investors each day to maintain service quality. Book your spot early!
              </List.Item>
              <List.Item>
                <strong>USDT Only:</strong> We only accept USDT (TRC20 on Tron
                Network) for investments to ensure easier and more secure
                transactions.
              </List.Item>
              <List.Item>
                <strong>No Fund Circulation:</strong> Unlike other programs, we don't
                use new investor funds to pay existing investors. All returns come
                from real trading profits.
              </List.Item>
              <List.Item>
                <strong>Transparent Operations:</strong> Our finance department keeps
                detailed records of all transactions and trading activities.
              </List.Item>
              <List.Item>
                <strong>Weekend Distributions:</strong> Profit calculations and
                distributions happen every weekend based on the week's trading
                performance.
              </List.Item>
              <List.Item>
                <strong>Professional Management:</strong> Each of our 4 investment
                pools is managed by experienced binary options traders with proven
                track records.
              </List.Item>
            </List>
          </Stack>
        </Card>

        {/* CTA */}
        <Card
          shadow="lg"
          padding="xl"
          radius="lg"
          mb="xl"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${theme.colors[theme.primaryColor][8]} 100%)`,
            color: "white",
          }}
        >
          <Stack align="center" gap="lg">
            <Title order={2} ta="center" c="white">
              Ready to Start Your Investment Journey?
            </Title>
            <Text size="lg" ta="center" c="white" style={{ maxWidth: 700 }}>
              Join hundreds of investors who are earning consistent returns through
              professional binary options trading. Choose your plan and get started
              today!
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
                Create Account
              </Button>
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/"
                variant="outline"
                style={{ borderColor: "white", color: "white" }}
              >
                View Plans
              </Button>
            </Group>
          </Stack>
        </Card>
      </div>
  </TopLayout>
  );
};

export default AboutScreen;
