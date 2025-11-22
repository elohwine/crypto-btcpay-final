import React, { useState } from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Stack,
    Group,
    Badge,
    Box,
    Avatar,
    TextInput,
    ActionIcon,
    ScrollArea,
} from '@mantine/core';
import { IconSend, IconSearch } from '@tabler/icons-react';
import TopLayout from '../../layouts/TopLayout';
import { useAppTheme } from '../../lib/themeUtils';

const MessagesScreen: React.FC = () => {
    const { primary } = useAppTheme();
    const [searchQuery, setSearchQuery] = useState('');

    // Placeholder messages
    const messages = [
        {
            id: 1,
            from: 'Magnum Support',
            message: 'Welcome to Magnum! How can we help you today?',
            time: '10:30 AM',
            unread: true,
        },
        {
            id: 2,
            from: 'System',
            message: 'Your deposit of $100 has been confirmed',
            time: 'Yesterday',
            unread: false,
        },
    ];

    return (
        <TopLayout>
            <Container size="lg" py={60}>
                {/* Header */}
                <Box ta="center" mb={40}>
                    <Badge size="lg" variant="light" color="blue" mb="md">
                        MESSAGES
                    </Badge>
                    <Title order={1} mb="md">
                        Your <span style={{ color: primary }}>Messages</span>
                    </Title>
                    <Text size="lg" c="dimmed">
                        View and manage your conversations
                    </Text>
                </Box>

                {/* Messages Container */}
                <Card shadow="md" padding={0} radius="lg" style={{ height: 600 }}>
                    <Group h="100%" align="stretch" gap={0}>
                        {/* Conversations List */}
                        <Box
                            style={{
                                width: 320,
                                borderRight: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Box p="md">
                                <TextInput
                                    placeholder="Search messages..."
                                    leftSection={<IconSearch size={16} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </Box>
                            <ScrollArea style={{ flex: 1 }}>
                                <Stack gap={0}>
                                    {messages.map((msg) => (
                                        <Box
                                            key={msg.id}
                                            p="md"
                                            style={{
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--border)',
                                                background: msg.unread ? 'var(--surface-hover)' : 'transparent',
                                            }}
                                        >
                                            <Group gap="sm">
                                                <Avatar color="blue" radius="xl">
                                                    {msg.from[0]}
                                                </Avatar>
                                                <Box style={{ flex: 1 }}>
                                                    <Text fw={msg.unread ? 600 : 400} size="sm">
                                                        {msg.from}
                                                    </Text>
                                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                                        {msg.message}
                                                    </Text>
                                                </Box>
                                                <Text size="xs" c="dimmed">
                                                    {msg.time}
                                                </Text>
                                            </Group>
                                        </Box>
                                    ))}
                                </Stack>
                            </ScrollArea>
                        </Box>

                        {/* Message View */}
                        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            {/* Message Header */}
                            <Box p="md" style={{ borderBottom: '1px solid var(--border)' }}>
                                <Group>
                                    <Avatar color="blue" radius="xl">
                                        M
                                    </Avatar>
                                    <Box>
                                        <Text fw={600}>Magnum Support</Text>
                                        <Text size="xs" c="dimmed">
                                            Online
                                        </Text>
                                    </Box>
                                </Group>
                            </Box>

                            {/* Messages */}
                            <ScrollArea style={{ flex: 1 }} p="md">
                                <Stack gap="md">
                                    <Box>
                                        <Group gap="xs" mb={4}>
                                            <Avatar size="sm" color="blue" radius="xl">
                                                M
                                            </Avatar>
                                            <Text size="xs" c="dimmed">
                                                10:30 AM
                                            </Text>
                                        </Group>
                                        <Box
                                            p="sm"
                                            ml={32}
                                            style={{
                                                background: 'var(--surface)',
                                                borderRadius: 12,
                                                maxWidth: '70%',
                                            }}
                                        >
                                            <Text size="sm">
                                                Welcome to Magnum! How can we help you today?
                                            </Text>
                                        </Box>
                                    </Box>
                                </Stack>
                            </ScrollArea>

                            {/* Message Input */}
                            <Box p="md" style={{ borderTop: '1px solid var(--border)' }}>
                                <Group gap="xs">
                                    <TextInput
                                        placeholder="Type a message..."
                                        style={{ flex: 1 }}
                                        styles={{ input: { borderRadius: 20 } }}
                                    />
                                    <ActionIcon size={36} radius="xl" color={primary} variant="filled">
                                        <IconSend size={18} />
                                    </ActionIcon>
                                </Group>
                            </Box>
                        </Box>
                    </Group>
                </Card>
            </Container>
        </TopLayout>
    );
};

export default MessagesScreen;
