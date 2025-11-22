import React from 'react';
import { Container, Title, Text, Box, Badge } from '@mantine/core';
import TopLayout from '../../layouts/TopLayout';
import BankProcess from '../../components/Widgets/BankProcess/BankProcess';
import { useAppTheme } from '../../lib/themeUtils';

const DepositScreen: React.FC = () => {
    const { primary } = useAppTheme();

    return (
        <TopLayout>
            <Container size="lg" py={60}>
                {/* Header */}
                <Box ta="center" mb={40}>
                    <Badge size="lg" variant="light" color="green" mb="md">
                        DEPOSIT & WITHDRAW
                    </Badge>
                    <Title order={1} mb="md">
                        Manage Your <span style={{ color: primary }}>Funds</span>
                    </Title>
                    <Text size="lg" c="dimmed" maw={600} mx="auto">
                        Deposit funds to start investing or withdraw your earnings. Fast, secure, and easy.
                    </Text>
                </Box>

                {/* Bank Process Component */}
                <BankProcess />
            </Container>
        </TopLayout>
    );
};

export default DepositScreen;
