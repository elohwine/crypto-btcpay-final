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
    Avatar,
} from '@mantine/core';
import { IconBrandWhatsapp, IconBrandTelegram, IconMail, IconPhone } from '@tabler/icons-react';
import TopLayout from '../../layouts/TopLayout';
import { useAppTheme } from '../../lib/themeUtils';

const LiveSupportScreen: React.FC = () => {
    const { primary } = useAppTheme();

    return (
        <TopLayout>
            <Container size="md" py={60}>
                {/* Header */}
                <Box ta="center" mb={50}>
                    <Badge size="lg" variant="light" color="green" mb="md">
                        LIVE SUPPORT
                    </Badge>
                    <Title order={1} mb="md">
                        We're Here to <span style={{ color: primary }}>Help You</span>
                    </Title>
                    <Text size="lg" c="dimmed">
                        Get instant support from our team. We're available 24/7 to assist you.
                    </Text>
                </Box>

                {/* Support Options */}
                <Stack gap="md">
                    <Card shadow="md" padding="xl" radius="lg">
                        <Group>
                            <Avatar size={60} radius="xl" color="green">
                                <IconBrandWhatsapp size={32} />
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                                <Text fw={600} size="lg">
                                    WhatsApp Support
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Chat with us instantly on WhatsApp
                                </Text>
                            </Box>
                            <Button
                                component="a"
                                href="https://wa.me/15343490641"
                                target="_blank"
                                color="green"
                                leftSection={<IconBrandWhatsapp size={18} />}
                            >
                                Chat Now
                            </Button>
                        </Group>
                    </Card>

                    <Card shadow="md" padding="xl" radius="lg">
                        <Group>
                            <Avatar size={60} radius="xl" color="blue">
                                <IconBrandTelegram size={32} />
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                                <Text fw={600} size="lg">
                                    Telegram Group
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Join our community and get support
                                </Text>
                            </Box>
                            <Button
                                component="a"
                                href="https://t.me/+3Y8QFGwpWN9jZjZk"
                                target="_blank"
                                color="blue"
                                leftSection={<IconBrandTelegram size={18} />}
                            >
                                Join Group
                            </Button>
                        </Group>
                    </Card>

                    <Card shadow="md" padding="xl" radius="lg">
                        <Group>
                            <Avatar size={60} radius="xl" color="red">
                                <IconMail size={32} />
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                                <Text fw={600} size="lg">
                                    Email Support
                                </Text>
                                <Text size="sm" c="dimmed">
                                    support@magnum.com
                                </Text>
                            </Box>
                            <Button
                                component="a"
                                href="mailto:support@magnum.com"
                                color="red"
                                leftSection={<IconMail size={18} />}
                            >
                                Send Email
                            </Button>
                        </Group>
                    </Card>

                    <Card shadow="md" padding="xl" radius="lg">
                        <Group>
                            <Avatar size={60} radius="xl" color="orange">
                                <IconPhone size={32} />
                            </Avatar>
                            <Box style={{ flex: 1 }}>
                                <Text fw={600} size="lg">
                                    Phone Support
                                </Text>
                                <Text size="sm" c="dimmed">
                                    +1 534 349 0641
                                </Text>
                            </Box>
                            <Button
                                component="a"
                                href="tel:+15343490641"
                                color="orange"
                                leftSection={<IconPhone size={18} />}
                            >
                                Call Now
                            </Button>
                        </Group>
                    </Card>
                </Stack>
            </Container>
        </TopLayout>
    );
};

export default LiveSupportScreen;
