import React from "react";
import {
    Container,
    Title,
    Text,
    Card,
    Stack,
    Group,
    ThemeIcon,
    Button,
    Grid,
    Badge,
    Divider,
    Box,
    useMantineTheme,
    useMantineColorScheme,
} from "@mantine/core";
import {
    IconBrandWhatsapp,
    IconBrandTelegram,
    IconGift,
    IconUsers,
    IconHeadset,
    IconClock,
} from "@tabler/icons-react";
import TopLayout from "../../layouts/TopLayout";

const SupportScreen: React.FC = () => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === "dark";
    const primary = theme.colors[theme.primaryColor][6];

    return (
        <TopLayout>
            <Container size="lg" py={60}>
                <Stack gap="xl">
                    {/* Header */}
                    <Box ta="center">
                        <Badge size="lg" variant="light" color={theme.primaryColor} mb="md">
                            SUPPORT & HELP
                        </Badge>
                        <Title order={1} mb="md">
                            We're Here to <span style={{ color: primary }}>Help You</span>
                        </Title>
                        <Text size="lg" c="dimmed" maw={600} mx="auto">
                            Get in touch with our support team or learn more about our promotions and referral program
                        </Text>
                    </Box>

                    {/* Contact Cards */}
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card
                                shadow="md"
                                padding="xl"
                                radius="lg"
                                style={{
                                    background: isDark
                                        ? `linear-gradient(135deg, ${theme.colors.green[9]} 0%, ${theme.colors.green[8]} 100%)`
                                        : `linear-gradient(135deg, ${theme.colors.green[6]} 0%, ${theme.colors.green[7]} 100%)`,
                                    color: "white",
                                    height: "100%",
                                }}
                            >
                                <Stack gap="md">
                                    <ThemeIcon size={60} radius="xl" color="white" variant="light">
                                        <IconBrandWhatsapp size={32} />
                                    </ThemeIcon>
                                    <Title order={2} c="white">
                                        WhatsApp Support
                                    </Title>
                                    <Text c="white" style={{ opacity: 0.9 }}>
                                        Get instant help from our support team via WhatsApp. Available 24/7 for all your questions.
                                    </Text>
                                    <Button
                                        component="a"
                                        href="https://wa.me/15343490641"
                                        target="_blank"
                                        size="lg"
                                        variant="white"
                                        color="dark"
                                        leftSection={<IconBrandWhatsapp size={20} />}
                                        fullWidth
                                        mt="md"
                                    >
                                        +1 534 349 0641
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Card
                                shadow="md"
                                padding="xl"
                                radius="lg"
                                style={{
                                    background: isDark
                                        ? `linear-gradient(135deg, ${theme.colors.blue[9]} 0%, ${theme.colors.blue[8]} 100%)`
                                        : `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[7]} 100%)`,
                                    color: "white",
                                    height: "100%",
                                }}
                            >
                                <Stack gap="md">
                                    <ThemeIcon size={60} radius="xl" color="white" variant="light">
                                        <IconBrandTelegram size={32} />
                                    </ThemeIcon>
                                    <Title order={2} c="white">
                                        Telegram Group
                                    </Title>
                                    <Text c="white" style={{ opacity: 0.9 }}>
                                        Join our community on Telegram. Connect with other investors and get updates.
                                    </Text>
                                    <Button
                                        component="a"
                                        href="https://t.me/+3Y8QFGwpWN9jZjZk"
                                        target="_blank"
                                        size="lg"
                                        variant="white"
                                        color="dark"
                                        leftSection={<IconBrandTelegram size={20} />}
                                        fullWidth
                                        mt="md"
                                    >
                                        Join Telegram
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>

                    <Divider my="xl" />

                    {/* Promotions Section */}
                    <Box>
                        <Title order={2} ta="center" mb="xl">
                            Special <span style={{ color: primary }}>Promotions</span>
                        </Title>
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Card shadow="sm" padding="xl" radius="lg" h="100%">
                                    <Stack gap="md">
                                        <ThemeIcon size={56} radius="xl" color="orange">
                                            <IconGift size={28} />
                                        </ThemeIcon>
                                        <Title order={3} size="h3">
                                            10% Welcome Bonus
                                        </Title>
                                        <Text c="dimmed">
                                            Get a 10% bonus on your first investment! This special offer is available to all new members.
                                        </Text>
                                        <Stack gap="xs">
                                            <Group gap="xs">
                                                <IconClock size={18} color={primary} />
                                                <Text size="sm">Applied automatically on your first deposit</Text>
                                            </Group>
                                            <Group gap="xs">
                                                <IconUsers size={18} color={primary} />
                                                <Text size="sm">One-time bonus for new users</Text>
                                            </Group>
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, md: 6 }}>
                                <Card shadow="sm" padding="xl" radius="lg" h="100%">
                                    <Stack gap="md">
                                        <ThemeIcon size={56} radius="xl" color="cyan">
                                            <IconUsers size={28} />
                                        </ThemeIcon>
                                        <Title order={3} size="h3">
                                            Referral Program
                                        </Title>
                                        <Text c="dimmed">
                                            Earn rewards by inviting friends! Get your unique referral link from your dashboard.
                                        </Text>
                                        <Stack gap="xs">
                                            <Group gap="xs">
                                                <IconGift size={18} color={primary} />
                                                <Text size="sm">Earn bonus when referrals invest</Text>
                                            </Group>
                                            <Group gap="xs">
                                                <IconHeadset size={18} color={primary} />
                                                <Text size="sm">Track all your referrals in dashboard</Text>
                                            </Group>
                                        </Stack>
                                    </Stack>
                                </Card>
                            </Grid.Col>
                        </Grid>
                    </Box>

                    {/* FAQ or Additional Info */}
                    <Card shadow="md" padding="xl" radius="lg" mt="xl">
                        <Title order={3} mb="md">
                            Need More Help?
                        </Title>
                        <Text c="dimmed" mb="lg">
                            Our support team is available 24/7 through WhatsApp and Telegram. Whether you have questions about investments, withdrawals, or promotions, we're here to assist you.
                        </Text>
                        <Group>
                            <Button
                                component="a"
                                href="https://wa.me/15343490641"
                                target="_blank"
                                leftSection={<IconBrandWhatsapp size={18} />}
                            >
                                Contact WhatsApp
                            </Button>
                            <Button
                                component="a"
                                href="https://t.me/+3Y8QFGwpWN9jZjZk"
                                target="_blank"
                                variant="light"
                                leftSection={<IconBrandTelegram size={18} />}
                            >
                                Join Telegram
                            </Button>
                        </Group>
                    </Card>
                </Stack>
            </Container>
        </TopLayout>
    );
};

export default SupportScreen;
