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
import api from '../../lib/api';

const WalletScreen: React.FC = () => {
    const { primary } = useAppTheme();
    const { user } = useAuth();
    const [balance, setBalance] = React.useState<number>(0);
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [walletAddress, setWalletAddress] = React.useState<string>('');


    React.useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch balance - handle errors gracefully
                try {
                    const balanceRes = await api.get('/deposits/balance');
                    if (balanceRes.data && balanceRes.data.balances && Array.isArray(balanceRes.data.balances)) {
                        const usdt = balanceRes.data.balances.find((b: any) => b.currency === 'USDT');
                        setBalance(usdt && typeof usdt.amount === 'number' ? Math.abs(usdt.amount) : 0);
                    } else {
                        setBalance(0);
                    }
                } catch (balanceError: any) {
                    console.error('Failed to fetch balance', balanceError);
                    setBalance(0); // Default to 0 if balance fetch fails
                }

                // Fetch transactions - handle errors gracefully
                try {
                    const txRes = await api.get('/deposits/me');
                    if (txRes.data && Array.isArray(txRes.data)) {
                        setTransactions(txRes.data);
                        // Try to find a wallet address from history if available
                        const withAddress = txRes.data.find((tx: any) => tx.walletAddress);
                        if (withAddress && withAddress.walletAddress) {
                            setWalletAddress(withAddress.walletAddress);
                        }
                    } else {
                        setTransactions([]);
                    }
                } catch (txError: any) {
                    console.error('Failed to fetch transactions', txError);
                    setTransactions([]); // Default to empty array if tx fetch fails
                }
            } catch (error) {
                console.error('Unexpected error in wallet data fetch', error);
                setBalance(0);
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

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

                {/* Wallet Address - Only show if we have one */}
                {walletAddress && (
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
                )}

                {/* Quick Actions */}
                <Grid mb="xl">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Card shadow="sm" padding="xl" radius="lg" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/deposit'}>
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
                        {transactions.length === 0 ? (
                            <Text c="dimmed" ta="center" py="xl">No transactions yet</Text>
                        ) : (
                            transactions.map((tx: any) => (
                                <Group key={tx.depositId} justify="space-between">
                                    <Group>
                                        <ThemeIcon color={tx.amount > 0 ? "green" : "red"} variant="light" size="lg">
                                            {tx.amount > 0 ? <IconArrowDownLeft size={18} /> : <IconArrowUpRight size={18} />}
                                        </ThemeIcon>
                                        <Box>
                                            <Text fw={500}>{tx.amount > 0 ? 'Deposit' : 'Withdrawal'}</Text>
                                            <Text size="xs" c="dimmed">
                                                {new Date(tx.createdAt).toLocaleString()}
                                            </Text>
                                            <Badge size="xs" color={tx.status === 'CONFIRMED' ? 'green' : 'yellow'}>{tx.status}</Badge>
                                        </Box>
                                    </Group>
                                    <Text fw={600} c={tx.amount > 0 ? "green" : "red"}>
                                        {tx.amount > 0 ? '+' : ''}${Number(tx.amount).toFixed(2)}
                                    </Text>
                                </Group>
                            ))
                        )}
                    </Stack>
                </Card>
            </Container>
        </TopLayout>
    );
};

export default WalletScreen;
