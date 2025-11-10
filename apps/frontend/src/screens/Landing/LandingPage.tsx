import React, { useState } from "react";
import {
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
  ThemeIcon,
  SimpleGrid,
  useMantineTheme,
  Accordion,
  Avatar,
  Progress,
  Divider,
  Paper,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconTrendingUp,
  IconShield,
  IconChartBar,
  IconWallet,
  IconClock,
  IconCheck,
  IconUsers,
  IconBolt,
  IconChevronDown,
  IconBrandBinance,
  IconCurrencyBitcoin,
  IconBrandTether,
} from "@tabler/icons-react";
import PlanCard from "../../components/PlanCard/PlanCard";
import { INVESTMENT_PLANS } from "../../types/investment";
import RiskDisclaimer, {
  useRiskDisclaimer,
} from "../../components/RiskDisclaimer/RiskDisclaimer";
import TopLayout from "../../layouts/TopLayout";

const LandingPage: React.FC = () => {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const disclaimer = useRiskDisclaimer();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const isDark = (theme as any).colorScheme === "dark";

  const faqData = [
    {
      q: "So, What Is The Best Way To Get Started?",
      a: "Getting started is easy! Create an account, verify your identity, and you can start investing in USDT on the Tron Network within minutes. Our platform guides you through each step.",
    },
    {
      q: "Where Do I See How To Buy More Crypto?",
      a: "Navigate to the 'Buy Crypto' section in your dashboard. You'll find multiple payment options and can purchase USDT using credit cards, bank transfers, or other cryptocurrencies.",
    },
    {
      q: "Do I Get To Utilize Arbitrage With Crypto?",
      a: "Yes, our platform supports arbitrage opportunities. Monitor price differences across exchanges and execute trades quickly to maximize your USDT investments.",
    },
    {
      q: "How Do I Lock Up My Trading Account?",
      a: "Enable two-factor authentication, set up withdrawal whitelists, and use our advanced security features to protect your account and USDT holdings.",
    },
    {
      q: "What Kind Of Data Should I Input When Invited?",
      a: "You'll need to provide basic identification information, proof of address, and set up your preferred payment methods for buying and selling USDT.",
    },
  ];

  return (
    <TopLayout>
      <RiskDisclaimer
        opened={disclaimer.opened}
        onClose={disclaimer.close}
        autoShow={true}
      />
      
      {/* Hero Section */}
      <Box
        py={80}
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${theme.colors.dark[7]} 0%, ${theme.colors.dark[8]} 100%)`
            : `linear-gradient(135deg, ${theme.colors.gray[0]} 0%, ${theme.colors[theme.primaryColor][0]} 100%)`,
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="xl">
            <Title order={1} ta="center" size={52} style={{ maxWidth: 900 }}>
              Explore The <span style={{ color: primary }}>Latest Digital</span>
              <br />
              Currency Values.
            </Title>
            <Text size="xl" c="dimmed" ta="center" style={{ maxWidth: 700 }}>
              Invest in USDT on Tron Network with real-time tracking and secure transactions
            </Text>
            <Group gap="md" mt="md">
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/members/signup"
                color={theme.primaryColor}
              >
                Get Started
              </Button>
              <Button
                size="xl"
                radius="md"
                component={Link}
                to="/members/signup"
                variant="default"
              >
                Free Trial
              </Button>
            </Group>

            {/* Stats Card */}
            <Card shadow="lg" padding="xl" radius="xl" mt={40} style={{ width: "100%", maxWidth: 1000 }}>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Group mb="md">
                    <Avatar size={48} radius="xl" color={theme.primaryColor}>
                      <IconUsers size={24} />
                    </Avatar>
                    <div>
                      <Text fw={600}>Magnum Trader</Text>
                      <Text size="sm" c="dimmed">Crypto Investor</Text>
                    </div>
                  </Group>
                  <Text size="sm" c="dimmed" mb={4}>Total Revenue</Text>
                  <Title order={2} mb="md">$345,876.78</Title>
                  <Group gap={4}>
                    {[40, 60, 45, 70, 55, 65, 50, 75, 60].map((height, i) => (
                      <Box
                        key={i}
                        style={{
                          width: 32,
                          height: height,
                          backgroundColor: primary,
                          borderRadius: 4,
                          opacity: 0.8,
                        }}
                      />
                    ))}
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Group justify="space-between" mb="md">
                    <Text fw={600}>Total Revenue</Text>
                    <Text size="sm" c="dimmed">This Year</Text>
                  </Group>
                  <Box style={{ height: 140, position: "relative" }}>
                    <svg viewBox="0 0 200 80" style={{ width: "100%", height: "100%" }}>
                      <path
                        d="M 0,60 Q 25,50 50,55 T 100,45 T 150,35 T 200,25"
                        fill="none"
                        stroke={primary}
                        strokeWidth="3"
                      />
                      <path
                        d="M 0,60 Q 25,50 50,55 T 100,45 T 150,35 T 200,25 L 200,80 L 0,80 Z"
                        fill={primary}
                        opacity="0.1"
                      />
                    </svg>
                  </Box>
                  <Text size="sm" c="dimmed" ta="right" mt="xs">View Details →</Text>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Trust Badges */}
            <Group gap="xl" mt={40} wrap="wrap" justify="center">
              <Group gap={8}>
                <IconShield size={20} color={isDark ? theme.colors.gray[5] : theme.colors.gray[6]} />
                <Text size="sm" c="dimmed">Coinbase</Text>
              </Group>
              <Group gap={8}>
                <IconWallet size={20} color={isDark ? theme.colors.gray[5] : theme.colors.gray[6]} />
                <Text size="sm" c="dimmed">Ledger</Text>
              </Group>
              <Group gap={8}>
                <IconShield size={20} color={isDark ? theme.colors.gray[5] : theme.colors.gray[6]} />
                <Text size="sm" c="dimmed">Tron Network</Text>
              </Group>
              <Group gap={8}>
                <IconBrandTether size={20} color={isDark ? theme.colors.gray[5] : theme.colors.gray[6]} />
                <Text size="sm" c="dimmed">TRC-20 USDT</Text>
              </Group>
              <Group gap={8}>
                <IconBrandBinance size={20} color={isDark ? theme.colors.gray[5] : theme.colors.gray[6]} />
                <Text size="sm" c="dimmed">Binance</Text>
              </Group>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section - WHY US */}
      <Box py={80} style={{ background: isDark ? theme.colors.dark[8] : "#ffffff" }}>
        <Container size="xl">
          <Stack align="center" gap="xl" mb={60}>
            <Text size="sm" fw={600} c="dimmed" tt="uppercase">WHY US</Text>
            <Title order={2} ta="center" size={42}>
              Crypto Is The Leading
              <br />
              Platform For <span style={{ color: primary }}>Crowdfunding!</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center" style={{ maxWidth: 700 }}>
              Invest in USDT with confidence on the Tron Network. Fast transactions, low fees, and complete transparency.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mb="lg">
            <Stack align="center">
              <ThemeIcon size={64} radius="xl" color={theme.primaryColor}>
                <IconShield size={32} />
              </ThemeIcon>
              <Text fw={600} size="lg">Secure Platform</Text>
              <Text size="sm" c="dimmed" ta="center">
                Your USDT investments are protected with bank-level security and blockchain transparency.
              </Text>
            </Stack>

            <Stack align="center">
              <ThemeIcon size={64} radius="xl" color="blue">
                <IconTrendingUp size={32} />
              </ThemeIcon>
              <Text fw={600} size="lg">Real-Time Analytics</Text>
              <Text size="sm" c="dimmed" ta="center">
                Track your USDT portfolio with live market data and comprehensive analytics tools.
              </Text>
            </Stack>

            <Stack align="center">
              <ThemeIcon size={64} radius="xl" color="cyan">
                <IconBolt size={32} />
              </ThemeIcon>
              <Text fw={600} size="lg">Instant Transactions</Text>
              <Text size="sm" c="dimmed" ta="center">
                Experience lightning-fast USDT transfers on Tron Network with minimal fees.
              </Text>
            </Stack>
          </SimpleGrid>

          <Text ta="center" mt="xl">
            <Text component={Link} to="/about" size="sm" fw={600} style={{ color: primary }}>
              Learn More →
            </Text>
          </Text>
        </Container>
      </Box>

      {/* Investment Plans Section */}
      <Box
        py={100}
        style={{
          background: isDark
            ? theme.colors.dark[7]
            : theme.colors.gray[0],
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

      {/* Installation Manual Section */}
      <Box py={80} style={{ background: isDark ? theme.colors.dark[7] : theme.colors.gray[0] }}>
        <Container size="xl">
          <Card
            shadow="lg"
            padding="xl"
            radius="xl"
            style={{
              background: `linear-gradient(135deg, ${theme.colors[theme.primaryColor][8]} 0%, ${theme.colors.blue[8]} 50%, ${theme.colors.cyan[7]} 100%)`,
              color: "white",
            }}
          >
            <Stack align="center" gap="xl" mb={60}>
              <Title order={2} ta="center" c="white">
                Refer To The Easy
                <br />
                Installation Manual
              </Title>
            </Stack>

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
              <Paper
                shadow="sm"
                p="lg"
                radius="lg"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >
                <ThemeIcon size={48} radius="md" color={theme.primaryColor} mb="md">
                  <IconChartBar size={24} />
                </ThemeIcon>
                <Text fw={600} mb="sm">Crypto Marketplace</Text>
                <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Access real-time USDT prices on Tron Network with comprehensive market analysis.
                </Text>
              </Paper>

              <Paper
                shadow="sm"
                p="lg"
                radius="lg"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >
                <ThemeIcon size={48} radius="md" color="blue" mb="md">
                  <IconWallet size={24} />
                </ThemeIcon>
                <Text fw={600} mb="sm">Buy digital currency</Text>
                <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Purchase USDT instantly with multiple payment methods and start investing today.
                </Text>
              </Paper>

              <Paper
                shadow="sm"
                p="lg"
                radius="lg"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              >
                <ThemeIcon size={48} radius="md" color="cyan" mb="md">
                  <IconTrendingUp size={24} />
                </ThemeIcon>
                <Text fw={600} mb="sm">Sell digital currency</Text>
                <Text size="sm" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Convert your USDT to fiat currency quickly with competitive rates and low fees.
                </Text>
              </Paper>
            </SimpleGrid>
          </Card>
        </Container>
      </Box>

      {/* How It Works */}
      <Box py={80} style={{ background: isDark ? theme.colors.dark[8] : "#ffffff" }}>
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
              Why Choose Magnum?
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

      {/* FAQ Section */}
      <Box py={80} style={{ background: isDark ? theme.colors.dark[7] : theme.colors.gray[0] }}>
        <Container size="md">
          <Stack align="center" gap="xl" mb={60}>
            <Title order={2} ta="center" size={42}>
              Frequently Asked <span style={{ color: primary }}>Questions</span>
            </Title>
            <Text size="lg" c="dimmed" ta="center">
              Get quick answers about investing in USDT on the Tron Network through our platform
            </Text>
          </Stack>

          <Stack gap="sm">
            {faqData.map((faq, index) => (
              <Card key={index} shadow="sm" padding="lg" radius="md" style={{ cursor: "pointer" }}>
                <Group justify="space-between" onClick={() => setActiveFaq(activeFaq === index ? null : index)}>
                  <Text fw={600}>{faq.q}</Text>
                  <IconChevronDown
                    size={20}
                    style={{
                      transform: activeFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  />
                </Group>
                {activeFaq === index && (
                  <Text size="sm" c="dimmed" mt="md">
                    {faq.a}
                  </Text>
                )}
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box py={80} style={{ background: isDark ? theme.colors.dark[8] : "#ffffff" }}>
        <Container size="xl">
          <Stack align="center" gap="xl" mb={60}>
            <Text size="sm" fw={600} c="dimmed" tt="uppercase">TESTIMONIALS</Text>
            <Group justify="space-between" style={{ width: "100%", maxWidth: 900 }}>
              <Title order={2} size={42}>
                What Our <span style={{ color: primary }}>Clients Say</span>
              </Title>
              <Text component={Link} to="/about" size="sm" fw={600} style={{ color: primary }}>
                Read All Review →
              </Text>
            </Group>
            <Text size="lg" c="dimmed" ta="center" style={{ maxWidth: 700 }}>
              Hear from our community of USDT investors who trust our platform
            </Text>
          </Stack>

          <Grid gutter="xl" style={{ maxWidth: 1200, margin: "0 auto" }}>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card
                shadow="md"
                padding="xl"
                radius="xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.blue[8]} 0%, ${theme.colors[theme.primaryColor][8]} 100%)`,
                  color: "white",
                  height: "100%",
                }}
              >
                <Group mb="xl">
                  <Avatar size={80} radius="xl" color="gray">HH</Avatar>
                  <div>
                    <Text fw={600} size="lg">Harold Howard</Text>
                    <Text size="sm" style={{ opacity: 0.8 }}>Crypto Enthusiast</Text>
                  </div>
                </Group>
                <Text style={{ lineHeight: 1.7 }}>
                  "I've been using this platform for over 6 months. The experience was seamless from registration to trading. The USDT on Tron Network integration is fantastic - fast transactions and low fees. The real-time analytics help me make informed decisions, and the customer support is always available when I need help. Highly recommend for anyone serious about crypto investing!"
                </Text>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="md" padding="xl" radius="xl" style={{ height: "100%" }}>
                <Group mb="xl">
                  <Avatar size={80} radius="xl" color="cyan">SM</Avatar>
                  <div>
                    <Text fw={600} size="lg">Sarah Mitchell</Text>
                    <Text size="sm" c="dimmed">Day Trader</Text>
                  </div>
                </Group>
                <Text c="dimmed" style={{ lineHeight: 1.7 }}>
                  "As a day trader, I need a platform that's fast and reliable. Magnum delivers on both fronts. The USDT liquidity on Tron is excellent, and I can execute trades instantly. The interface is intuitive, making it easy to track my portfolio. Security features give me peace of mind knowing my investments are protected."
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
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
            <Button
              variant="subtle"
              size="sm"
              onClick={disclaimer.open}
              style={{ color: "white", opacity: 0.8 }}
            >
              View Risk Disclaimer
            </Button>
          </Stack>
        </Container>
      </Box>
  </TopLayout>
  );
};

export default LandingPage;
