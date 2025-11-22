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
    Grid,
} from '@mantine/core';
import TopLayout from '../../layouts/TopLayout';
import BankProcess from '../../components/Widgets/BankProcess/BankProcess';
import { useAppTheme } from '../../lib/themeUtils';

const AccountsScreen: React.FC = () => {
    const { primary } = useAppTheme();

    return (
        <TopLayout>
            <Container size="lg" py={60}>
                {/* Header */}
                <Box ta="center" mb={40}>
                    <Badge size="lg" variant="light" color="blue" mb="md">
                        MY ACCOUNT
                    </Badge>
                    <Title order={1} mb="md">
                        Manage Your <span style={{ color: primary }}>Account</span>
                    </Title>
                    <Text size="lg" c="dimmed" maw={600} mx="auto">
                        Deposit funds, withdraw earnings, and manage your investments all in one place.
                    </Text>
                </Box>

                {/* Info Cards */}
                <Grid mb={40}>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md">
                            <Text fw={600} size="lg" mb="xs">
                                💰 Instant Deposits
                            </Text>
                            <Text size="sm" c="dimmed">
                                Connect your wallet and deposit instantly with TronLink or send USDT manually
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md">
                            <Text fw={600} size="lg" mb="xs">
                                🚀 24/7 Withdrawals
                            </Text>
                            <Text size="sm" c="dimmed">
                                Withdraw your earnings anytime, any day. Instant processing available
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Card shadow="sm" padding="lg" radius="md">
                            <Text fw={600} size="lg" mb="xs">
                                🔒 Secure Transactions
                            </Text>
                            <Text size="sm" c="dimmed">
                                All transactions are encrypted and processed securely on the blockchain
                            </Text>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Bank Process Component */}
                <BankProcess />
            </Container>
        </TopLayout>
    );
};

export default AccountsScreen;
