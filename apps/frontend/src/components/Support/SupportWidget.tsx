import React, { useState } from 'react';
import { Affix, Button, Transition, Paper, Text, Group, Stack, ThemeIcon, ActionIcon, TextInput, Textarea, Box, useMantineTheme } from '@mantine/core';
import { IconMessageCircle, IconBrandWhatsapp, IconBrandTelegram, IconX, IconSend, IconMail } from '@tabler/icons-react';

const SupportWidget: React.FC = () => {
    const [opened, setOpened] = useState(false);
    const theme = useMantineTheme();

    return (
        <>
            <Affix position={{ bottom: 20, right: 20 }}>
                <Transition transition="slide-up" mounted={!opened}>
                    {(transitionStyles) => (
                        <Button
                            style={transitionStyles}
                            leftSection={<IconMessageCircle size={20} />}
                            radius="xl"
                            size="lg"
                            color={theme.primaryColor}
                            onClick={() => setOpened(true)}
                            styles={{
                                root: {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    height: 56,
                                    paddingLeft: 24,
                                    paddingRight: 24,
                                }
                            }}
                        >
                            Support
                        </Button>
                    )}
                </Transition>
            </Affix>

            <Transition transition="slide-up" mounted={opened}>
                {(transitionStyles) => (
                    <Affix position={{ bottom: 20, right: 20 }} zIndex={1000}>
                        <Paper
                            style={{ ...transitionStyles, width: 340, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
                            shadow="xl"
                            radius="lg"
                            withBorder
                        >
                            {/* Header */}
                            <Box p="md" style={{ background: theme.colors[theme.primaryColor][6], borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg }}>
                                <Group justify="space-between">
                                    <Group gap="xs">
                                        <ThemeIcon color="white" variant="transparent">
                                            <IconMessageCircle size={24} />
                                        </ThemeIcon>
                                        <div>
                                            <Text c="white" fw={600}>Magnum Support</Text>
                                            <Text c="white" size="xs" style={{ opacity: 0.9 }}>We typically reply in a few minutes</Text>
                                        </div>
                                    </Group>
                                    <ActionIcon variant="transparent" color="white" onClick={() => setOpened(false)}>
                                        <IconX size={20} />
                                    </ActionIcon>
                                </Group>
                            </Box>

                            {/* Content */}
                            <Box p="md" style={{ flex: 1, overflowY: 'auto' }}>
                                <Stack gap="md">
                                    <Text size="sm" c="dimmed">
                                        Hi there! 👋 How can we help you today? Choose a channel below to start a conversation.
                                    </Text>

                                    <Button
                                        component="a"
                                        href="https://wa.me/15343490641"
                                        target="_blank"
                                        fullWidth
                                        variant="light"
                                        color="green"
                                        leftSection={<IconBrandWhatsapp size={20} />}
                                        styles={{ inner: { justifyContent: 'flex-start' } }}
                                    >
                                        Chat on WhatsApp
                                    </Button>

                                    <Button
                                        component="a"
                                        href="https://t.me/+3Y8QFGwpWN9jZjZk"
                                        target="_blank"
                                        fullWidth
                                        variant="light"
                                        color="blue"
                                        leftSection={<IconBrandTelegram size={20} />}
                                        styles={{ inner: { justifyContent: 'flex-start' } }}
                                    >
                                        Join Telegram Group
                                    </Button>

                                    <Divider label="Or leave a message" labelPosition="center" />

                                    <form onSubmit={(e) => e.preventDefault()}>
                                        <Stack gap="sm">
                                            <TextInput placeholder="Your Name" size="sm" />
                                            <TextInput placeholder="Email Address" size="sm" />
                                            <Textarea placeholder="How can we help?" minRows={3} size="sm" />
                                            <Button fullWidth size="sm" rightSection={<IconSend size={16} />}>
                                                Send Message
                                            </Button>
                                        </Stack>
                                    </form>
                                </Stack>
                            </Box>

                            {/* Footer */}
                            <Box p="xs" style={{ borderTop: `1px solid ${theme.colors.gray[2]}` }}>
                                <Text size="xs" c="dimmed" ta="center">Powered by Magnum Support</Text>
                            </Box>
                        </Paper>
                    </Affix>
                )}
            </Transition>
        </>
    );
};

// Helper component for Divider since it was missing from imports
const Divider = ({ label, labelPosition }: { label: string, labelPosition: string }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#eee' }} />
            <span style={{ padding: '0 10px', color: '#999', fontSize: '0.8em' }}>{label}</span>
            <div style={{ flex: 1, height: 1, background: '#eee' }} />
        </div>
    )
}

export default SupportWidget;
