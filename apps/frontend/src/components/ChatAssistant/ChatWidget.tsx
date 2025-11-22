import React, { useState, useRef, useEffect } from 'react';
import {
    Affix,
    Button,
    Paper,
    Text,
    Group,
    Stack,
    ThemeIcon,
    ActionIcon,
    TextInput,
    Box,
    ScrollArea,
    useMantineTheme,
    useMantineColorScheme,
    Transition,
} from '@mantine/core';
import {
    IconMessageCircle,
    IconX,
    IconSend,
    IconTrash,
} from '@tabler/icons-react';
import { useChatAssistant } from './ChatContext';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const ChatWidget: React.FC = () => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const { messages, isOpen, isTyping, isOnline, sendMessage, toggleChat, clearHistory } =
        useChatAssistant();
    const [inputValue, setInputValue] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages, isTyping, viewport]);

    const handleSend = () => {
        if (inputValue.trim()) {
            sendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <Affix position={{ bottom: 20, right: 20 }} zIndex={999}>
                <Transition transition="slide-up" mounted={!isOpen}>
                    {(transitionStyles) => (
                        <Button
                            style={transitionStyles}
                            leftSection={<IconMessageCircle size={20} />}
                            radius="xl"
                            size="lg"
                            color={theme.primaryColor}
                            onClick={toggleChat}
                            styles={{
                                root: {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    height: 56,
                                    paddingLeft: 24,
                                    paddingRight: 24,
                                },
                            }}
                        >
                            Chat Assistant
                        </Button>
                    )}
                </Transition>
            </Affix>

            {/* Chat Panel */}
            <Transition transition="slide-up" mounted={isOpen}>
                {(transitionStyles) => (
                    <Affix position={{ bottom: 20, right: 20 }} zIndex={1000}>
                        <Paper
                            style={{
                                ...transitionStyles,
                                width: 380,
                                height: 600,
                                maxHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            shadow="xl"
                            radius="lg"
                            withBorder
                        >
                            {/* Header */}
                            <Box
                                p="md"
                                style={{
                                    background: theme.colors[theme.primaryColor][6],
                                    borderTopLeftRadius: theme.radius.lg,
                                    borderTopRightRadius: theme.radius.lg,
                                }}
                            >
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon color="white" variant="transparent" size="lg">
                                            <IconMessageCircle size={24} />
                                        </ThemeIcon>
                                        <div>
                                            <Text c="white" fw={600} size="sm">
                                                Magnum Assistant
                                            </Text>
                                            <Group gap={4}>
                                                <Box
                                                    style={{
                                                        width: 6,
                                                        height: 6,
                                                        borderRadius: '50%',
                                                        background: isOnline ? '#4ade80' : '#ef4444',
                                                    }}
                                                />
                                                <Text c="white" size="xs" style={{ opacity: 0.9 }}>
                                                    {isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
                                                </Text>
                                            </Group>
                                        </div>
                                    </Group>
                                    <Group gap={4}>
                                        {messages.length > 0 && (
                                            <ActionIcon
                                                variant="transparent"
                                                color="white"
                                                onClick={clearHistory}
                                                title="Clear chat"
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        )}
                                        <ActionIcon
                                            variant="transparent"
                                            color="white"
                                            onClick={toggleChat}
                                        >
                                            <IconX size={20} />
                                        </ActionIcon>
                                    </Group>
                                </Group>
                            </Box>

                            {/* Messages */}
                            <ScrollArea
                                ref={scrollAreaRef}
                                style={{ flex: 1 }}
                                p="md"
                                styles={{
                                    viewport: {
                                        '& > div': {
                                            display: 'block !important',
                                        },
                                    },
                                }}
                            >
                                <Stack gap="md">
                                    {messages.map((message) => (
                                        <ChatMessage key={message.id} message={message} />
                                    ))}
                                    {isTyping && <TypingIndicator />}
                                </Stack>
                            </ScrollArea>

                            {/* Input */}
                            <Box
                                p="md"
                                style={{
                                    borderTop: `1px solid ${colorScheme === 'dark'
                                        ? theme.colors.dark[4]
                                        : theme.colors.gray[3]
                                        }`,
                                }}
                            >
                                <Group gap="xs" align="flex-end">
                                    <TextInput
                                        placeholder="Type your message..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.currentTarget.value)}
                                        onKeyPress={handleKeyPress}
                                        style={{ flex: 1 }}
                                        styles={{
                                            input: {
                                                borderRadius: 20,
                                            },
                                        }}
                                    />
                                    <ActionIcon
                                        size={36}
                                        radius="xl"
                                        color={theme.primaryColor}
                                        variant="filled"
                                        onClick={handleSend}
                                        disabled={!inputValue.trim() || isTyping}
                                    >
                                        <IconSend size={18} />
                                    </ActionIcon>
                                </Group>
                            </Box>
                        </Paper>
                    </Affix>
                )}
            </Transition>
        </>
    );
};

export default ChatWidget;
