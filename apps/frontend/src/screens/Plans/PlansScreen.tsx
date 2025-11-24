import React from 'react';
import {
    Container,
    Title,
    Text,
    Grid,
    Badge,
    Box,
    ThemeIcon,
    List,
} from '@mantine/core';
import TopLayout from '../../layouts/TopLayout';
import PlanCard from '../../components/PlanCard/PlanCard';
import { INVESTMENT_PLANS } from '../../types/investment';
import { useAppTheme } from '../../lib/themeUtils';

const PlansScreen: React.FC = () => {
    const { primary } = useAppTheme();

    return (
        <TopLayout>
            <Container size="lg" py={60}>
                {/* Header */}
                <Box ta="center" mb={50}>
                    <Badge size="lg" variant="light" color="blue" mb="md">
                        INVESTMENT PLANS
                    </Badge>
                    <Title order={1} mb="md">
                        Choose Your <span style={{ color: primary }}>Investment Plan</span>
                    </Title>
                    <Text size="lg" c="dimmed" maw={700} mx="auto">
                        Select the plan that best fits your investment goals. All plans include daily returns,
                        10% referral bonus, and priority support.
                    </Text>
                </Box>

                {/* Plans Grid */}
                <Grid>
                    {INVESTMENT_PLANS.map((plan) => (
                        <Grid.Col key={plan.id} span={{ base: 12, sm: 6, md: 6, lg: 3 }}>
                            <PlanCard plan={plan} />
                        </Grid.Col>
                    ))}
                </Grid>

                {/* Additional Info */}
                <Box mt={60} p="xl" style={{ background: 'var(--surface)', borderRadius: 12 }}>
                    <Title order={3} mb="md">
                        Why Invest With Magnum?
                    </Title>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Text fw={600} mb="xs">
                                🎁 Welcome Bonus
                            </Text>
                            <Text size="sm" c="dimmed">
                                Get 10% extra on your first investment automatically
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Text fw={600} mb="xs">
                                💰 Daily Returns
                            </Text>
                            <Text size="sm" c="dimmed">
                                Earn consistent daily returns credited to your account
                            </Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 4 }}>
                            <Text fw={600} mb="xs">
                                🔒 Secure Platform
                            </Text>
                            <Text size="sm" c="dimmed">
                                Your investments are protected with industry-standard security
                            </Text>
                            <List.Item>
                                Withdraw profits <strong>Everyday</strong>
                            </List.Item>
                        </Grid.Col>
                    </Grid>
                </Box>
            </Container>
        </TopLayout>
    );
};

export default PlansScreen;
