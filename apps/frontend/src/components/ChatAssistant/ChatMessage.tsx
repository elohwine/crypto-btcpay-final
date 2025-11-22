import React from 'react';
import { Box, Text, useMantineTheme, useMantineColorScheme } from '@mantine/core';
import { ChatMessage as ChatMessageType } from './types';
import QuickActions from './QuickActions';
import { IconRobot, IconUser } from '@tabler/icons-react';

interface ChatMessageProps {
    message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const isBot = message.type === 'bot';

    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isBot ? 'flex-start' : 'flex-end',
                marginBottom: 16,
            }}
        >
            <Box
                style={{
                    display: 'flex',
                    gap: 8,
                    maxWidth: '85%',
                    flexDirection: isBot ? 'row' : 'row-reverse',
                }}
            >
                {/* Avatar */}
                <Box
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isBot
                            ? theme.colors[theme.primaryColor][6]
                            : theme.colors.gray[6],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {isBot ? (
                        <IconRobot size={18} color="white" />
                    ) : (
                        <IconUser size={18} color="white" />
                    )}
                </Box>

                {/* Message Bubble */}
                <Box style={{ flex: 1 }}>
                    <Box
                        style={{
                            background: isBot
                                ? isDark
                                    ? theme.colors.dark[6]
                                    : theme.colors.gray[1]
                                : theme.colors[theme.primaryColor][6],
                            color: isBot
                                ? isDark
                                    ? theme.colors.gray[0]
                                    : theme.colors.dark[9]
                                : 'white',
                            padding: '10px 14px',
                            borderRadius: 16,
                            borderTopLeftRadius: isBot ? 4 : 16,
                            borderTopRightRadius: isBot ? 16 : 4,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                        }}
                    >
                        <Text size="sm" style={{ lineHeight: 1.5 }}>
                            {message.content}
                        </Text>
                    </Box>

                    {/* Quick Actions */}
                    {message.quickActions && message.quickActions.length > 0 && (
                        <QuickActions actions={message.quickActions} />
                    )}

                    {/* Timestamp */}
                    <Text
                        size="xs"
                        c="dimmed"
                        mt={4}
                        style={{
                            textAlign: isBot ? 'left' : 'right',
                            paddingLeft: isBot ? 4 : 0,
                            paddingRight: isBot ? 0 : 4,
                        }}
                    >
                        {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatMessage;
