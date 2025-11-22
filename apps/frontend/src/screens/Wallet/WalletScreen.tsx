import React from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Stack,
    Group,
    Badge,
    Box,
    Button,
    Grid,
    ThemeIcon,
    CopyButton,
    ActionIcon,
    Tooltip,
} from '@mantine/core';
import {
    IconWallet,
    IconCopy,
    IconCheck,
    IconQrcode,
    IconArrowUpRight,
    IconArrowDownLeft,
} from '@tabler/icons-react';
import TopLayout from '../../layouts/TopLayout';
import { useAppTheme } from '../../lib/themeUtils';
import { useAuth } from '../../lib/auth';

const WalletScreen: React.FC = () => {
    const { primary } = useAppTheme();
    const { user } = useAuth();

    // Placeholder wallet address
    const walletAddress = 'TXYZabc123def456ghi789jkl012mno345pqr678';
    const balance = 1250.50;

    return (
        <TopLayout>
            <Container size="lg" py={60}>
                {/* Header */}
                <Box ta="center" mb={40}>
                    <Badge size="lg" variant="light" color="violet" mb="md">
                        MY WALLET
                    </Badge>
                    <Title order={1} mb="md">
                        Your <span style={{ color: primary }}>Wallet</span>
                    </Title>
                    <Text size="lg" c="dimmed">
                        Manage your cryptocurrency wallet and transactions
                    </Text>
                </Box>

                {/* Balance Card */}
                <Card shadow="lg" padding="xl" radius="lg" mb="xl" style={{ background: `linear-gradient(135deg, ${primary} 0%, #6366f1 100%)` }}>
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Text c="white" size="sm" style={{ opacity: 0.9 }}>
                                Total Balance
                            </Text>
                            <ThemeIcon color="white" variant="transparent">
                                <IconWallet size={24} />
                            </ThemeIcon>
                        </Group>
                        <Title order={1} c="white">
                            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Title>
                        <Text c="white" size="sm" style={{ opacity: 0.8 }}>
                            USDT (TRC20)
                        </Text>
                    </Stack>
                </Card>

                {/* Wallet Address */}
                <Card shadow="md" padding="xl" radius="lg" mb="xl">
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Text fw={600} size="lg">
                                Wallet Address
                            </Text>
                            <Button leftSection={<IconQrcode size={18} />} variant="light">
                                Show QR
                            </Button>
                        </Group>
                        <Group gap="xs">
                            <Text
                                size="sm"
                                c="dimmed"
                                style={{
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                    flex: 1,
                                }}
                            >
                                {walletAddress}
                            </Text>
                            <CopyButton value={walletAddress}>
                                {({ copied, copy }) => (
                                    <Tooltip label={copied ? 'Copied' : 'Copy'}>
                                        <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                                            {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                        </Group>
                    </Stack>
                </Card>

                {/* Quick Actions */}
                <Grid mb="xl">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Card shadow="sm" padding="xl" radius="lg" style={{ cursor: 'pointer' }}>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" color="green">
                                    <IconArrowDownLeft size={28} />
                                </ThemeIcon>
                                <Text fw={600} size="lg">
                                    Deposit
                                </Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    Add funds to your wallet
                                </Text>
                            </Stack>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Card shadow="sm" padding="xl" radius="lg" style={{ cursor: 'pointer' }}>
                            <Stack align="center" gap="md">
                                <ThemeIcon size={60} radius="xl" color="red">
                                    <IconArrowUpRight size={28} />
                                </ThemeIcon>
                                <Text fw={600} size="lg">
                                    Withdraw
                                </Text>
                                <Text size="sm" c="dimmed" ta="center">
                                    Send funds from your wallet
                                </Text>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Recent Transactions */}
                <Card shadow="md" padding="xl" radius="lg">
                    <Text fw={600} size="lg" mb="md">
                        Recent Transactions
                    </Text>
                    <Stack gap="md">
                        <Group justify="space-between">
                            <Group>
                                <ThemeIcon color="green" variant="light" size="lg">
                                    <IconArrowDownLeft size={18} />
                                </ThemeIcon>
                                <Box>
                                    <Text fw={500}>Deposit</Text>
                                    <Text size="xs" c="dimmed">
                                        Today, 10:30 AM
                                    </Text>
                                </Box>
                            </Group>
                            <Text fw={600} c="green">
                                +$100.00
                            </Text>
                        </Group>
                        <Group justify="space-between">
                            <Group>
                                <ThemeIcon color="red" variant="light" size="lg">
                                    <IconArrowUpRight size={18} />
                                </ThemeIcon>
                                <Box>
                                    <Text fw={500}>Withdrawal</Text>
                                    <Text size="xs" c="dimmed">
                                        Yesterday, 3:45 PM
                                    </Text>
                                </Box>
                            </Group>
                            <Text fw={600} c="red">
                                -$50.00
                            </Text>
                        </Group>
                    </Stack>
                </Card>
            </Container>
        </TopLayout>
    );
};

export default WalletScreen;
