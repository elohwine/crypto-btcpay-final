import React from 'react';
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
  Paper,
  Box,
  Flex,
  ThemeIcon,
  Avatar,
  SimpleGrid,
  Center,
  useMantineTheme,
  Image,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconTrendingUp, IconShield, IconZap, IconWallet, IconChartLine, IconChartBar, IconUsers } from '@tabler/icons-react';

const LandingPage: React.FC = () => {
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const primaryLight = theme.colors[theme.primaryColor][1];

  return (
    <AppShell padding={0} header={null}>
      {/* Hero */}
      <Box py={80} sx={{ background: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0] }}>
        <Container size="xl">
          <Stack align="center" spacing="xl">
            <Title order={1} align="center" size={48} sx={{ maxWidth: 900 }}>
              Explore The <span style={{ color: primary }}>Latest Digital</span>
              <br /> Currency Values.
            </Title>
            <Text size="lg" color="dimmed" align="center" sx={{ maxWidth: 700 }}>
              Invest in USDT on Tron Network with real-time tracking and secure transactions
            </Text>
            <Group spacing="md">
              <Button size="lg" radius="md" component={Link} to="/members/signup" color="primary">
                Get Started
              </Button>
              <Button size="lg" radius="md" component={Link} to="/members/signin" variant="default">
                Sign in
              </Button>
            </Group>

            <Card shadow="lg" radius="md" p="xl" sx={{ width: '100%', maxWidth: 1000, marginTop: 24 }}>
              <Grid>
                <Grid.Col span={12} md={6}>
                  <Group mb="md">
                    <Avatar size={60} radius={999} color={theme.primaryColor}>
                      <IconUsers size={28} />
                    </Avatar>
                    <div>
                      <Text weight={600} size="md">MD Isaz Miah</Text>
                      <Text size="sm" color="dimmed">Crypto Investor</Text>
                    </div>
                  </Group>
                  <Stack spacing="xs">
                    <Text size="sm" color="dimmed">Total Revenue</Text>
                    <Title order={2}>$345,876.78</Title>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={12} md={6}>
                  <Box sx={{ height: 160 }}>
                    <Image src="https://via.placeholder.com/800x320?text=Chart+Placeholder" alt="chart" fit="contain" />
                  </Box>
                  <Text align="right" size="sm" color="dimmed" mt="sm">View Details →</Text>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Container>
      </Box>

      {/* Features */}
      <Box py={80} sx={{ background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : '#ffffff' }}>
        <Container size="xl">
          <Stack align="center" spacing="xl" mb={50}>
            <Badge size="lg" variant="light">WHY US</Badge>
            <Title order={2} align="center" size={32}>
              Crypto Is The Leading <br />Platform For <span style={{ color: primary }}>Crowdfunding!</span>
            </Title>
            <Text size="md" color="dimmed" align="center" sx={{ maxWidth: 700 }}>
              Invest in USDT with confidence on the Tron Network. Fast transactions, low fees, and complete transparency.
            </Text>
          </Stack>

          <SimpleGrid cols={3} spacing="xl" breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
            <Stack align="center" spacing="md">
                <ThemeIcon size={70} radius="xl" sx={{ backgroundColor: primary }}>
                <IconShield size={32} />
              </ThemeIcon>
              <Text weight={600} size="lg">Secure Platform</Text>
              <Text size="sm" color="dimmed" align="center">Your USDT investments are protected with bank-level security and blockchain transparency.</Text>
            </Stack>
            <Stack align="center" spacing="md">
                <ThemeIcon size={70} radius="xl" color="blue">
                <IconTrendingUp size={32} />
              </ThemeIcon>
              <Text weight={600} size="lg">Real-Time Analytics</Text>
              <Text size="sm" color="dimmed" align="center">Track your USDT portfolio with live market data and comprehensive analytics tools.</Text>
            </Stack>
            <Stack align="center" spacing="md">
                <ThemeIcon size={70} radius="xl" color="cyan">
                <IconZap size={32} />
              </ThemeIcon>
              <Text weight={600} size="lg">Instant Transactions</Text>
              <Text size="sm" color="dimmed" align="center">Experience lightning-fast USDT transfers on Tron Network with minimal fees.</Text>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Footer-like CTA */}
      <Box py={60} sx={{ background: `linear-gradient(135deg, ${primary}, ${primaryLight})`, color: 'white' }}>
        <Container size="xl">
          <Flex justify="space-between" align="center">
            <div>
              <Title order={3} color="white">Get started with Magnum</Title>
              <Text color="white" size="sm">Create an account and start trading USDT on Tron Network today.</Text>
            </div>
            <Button size="lg" radius="md" component={Link} to="/members/signup" color="dark">
              Sign up
            </Button>
          </Flex>
        </Container>
      </Box>
    </AppShell>
  );
};

export default LandingPage;
