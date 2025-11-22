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
    Switch,
    Button,
    TextInput,
    PasswordInput,
    Select,
    Divider,
} from '@mantine/core';
import {
    IconBell,
    IconLock,
    IconUser,
    IconMail,
    IconShield,
    IconLanguage,
} from '@tabler/icons-react';
import TopLayout from '../../layouts/TopLayout';
import { useAppTheme } from '../../lib/themeUtils';
import { useAuth } from '../../lib/auth';

const SettingsScreen: React.FC = () => {
    const { primary } = useAppTheme();
    const { user } = useAuth();
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <TopLayout>
            <Container size="md" py={60}>
                {/* Header */}
                <Box ta="center" mb={40}>
                    <Badge size="lg" variant="light" color="gray" mb="md">
                        SETTINGS
                    </Badge>
                    <Title order={1} mb="md">
                        Account <span style={{ color: primary }}>Settings</span>
                    </Title>
                    <Text size="lg" c="dimmed">
                        Manage your account preferences and security
                    </Text>
                </Box>

                <Stack gap="xl">
                    {/* Profile Settings */}
                    <Card shadow="md" padding="xl" radius="lg">
                        <Group mb="md">
                            <IconUser size={24} />
                            <Text fw={600} size="lg">
                                Profile Information
                            </Text>
                        </Group>
                        <Stack gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="John Doe"
                                defaultValue={user?.name || ''}
                            />
                            <TextInput
                                label="Email Address"
                                placeholder="john@example.com"
                                defaultValue={user?.email || ''}
                                leftSection={<IconMail size={16} />}
                            />
                            <TextInput label="Phone Number" placeholder="+1 234 567 8900" />
                            <Button>Save Changes</Button>
                        </Stack>
                    </Card>

                    {/* Security Settings */}
                    <Card shadow="md" padding="xl" radius="lg">
                        <Group mb="md">
                            <IconLock size={24} />
                            <Text fw={600} size="lg">
                                Security
                            </Text>
                        </Group>
                        <Stack gap="md">
                            <PasswordInput
                                label="Current Password"
                                placeholder="Enter current password"
                            />
                            <PasswordInput
                                label="New Password"
                                placeholder="Enter new password"
                            />
                            <PasswordInput
                                label="Confirm New Password"
                                placeholder="Confirm new password"
                            />
                            <Button>Change Password</Button>
                            <Divider />
                            <Group justify="space-between">
                                <Box>
                                    <Text fw={500}>Two-Factor Authentication</Text>
                                    <Text size="sm" c="dimmed">
                                        Add an extra layer of security
                                    </Text>
                                </Box>
                                <Switch
                                    checked={twoFactor}
                                    onChange={(e) => setTwoFactor(e.currentTarget.checked)}
                                    size="lg"
                                />
                            </Group>
                        </Stack>
                    </Card>

                    {/* Notification Settings */}
                    <Card shadow="md" padding="xl" radius="lg">
                        <Group mb="md">
                            <IconBell size={24} />
                            <Text fw={600} size="lg">
                                Notifications
                            </Text>
                        </Group>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Box>
                                    <Text fw={500}>Email Notifications</Text>
                                    <Text size="sm" c="dimmed">
                                        Receive updates via email
                                    </Text>
                                </Box>
                                <Switch
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.currentTarget.checked)}
                                    size="lg"
                                />
                            </Group>
                            <Group justify="space-between">
                                <Box>
                                    <Text fw={500}>Push Notifications</Text>
                                    <Text size="sm" c="dimmed">
                                        Receive push notifications
                                    </Text>
                                </Box>
                                <Switch
                                    checked={pushNotifications}
                                    onChange={(e) => setPushNotifications(e.currentTarget.checked)}
                                    size="lg"
                                />
                            </Group>
                        </Stack>
                    </Card>

                    {/* Preferences */}
                    <Card shadow="md" padding="xl" radius="lg">
                        <Group mb="md">
                            <IconLanguage size={24} />
                            <Text fw={600} size="lg">
                                Preferences
                            </Text>
                        </Group>
                        <Stack gap="md">
                            <Select
                                label="Language"
                                placeholder="Select language"
                                data={[
                                    { value: 'en', label: 'English' },
                                    { value: 'es', label: 'Spanish' },
                                    { value: 'fr', label: 'French' },
                                ]}
                                defaultValue="en"
                            />
                            <Select
                                label="Currency"
                                placeholder="Select currency"
                                data={[
                                    { value: 'usd', label: 'USD ($)' },
                                    { value: 'eur', label: 'EUR (€)' },
                                    { value: 'gbp', label: 'GBP (£)' },
                                ]}
                                defaultValue="usd"
                            />
                            <Select
                                label="Timezone"
                                placeholder="Select timezone"
                                data={[
                                    { value: 'utc', label: 'UTC' },
                                    { value: 'est', label: 'EST' },
                                    { value: 'pst', label: 'PST' },
                                ]}
                                defaultValue="utc"
                            />
                        </Stack>
                    </Card>

                    {/* Danger Zone */}
                    <Card shadow="md" padding="xl" radius="lg" style={{ borderColor: 'var(--mantine-color-red-6)', borderWidth: 1 }}>
                        <Group mb="md">
                            <IconShield size={24} color="var(--mantine-color-red-6)" />
                            <Text fw={600} size="lg" c="red">
                                Danger Zone
                            </Text>
                        </Group>
                        <Stack gap="md">
                            <Text size="sm" c="dimmed">
                                Once you delete your account, there is no going back. Please be certain.
                            </Text>
                            <Button color="red" variant="outline">
                                Delete Account
                            </Button>
                        </Stack>
                    </Card>
                </Stack>
            </Container>
        </TopLayout>
    );
};

export default SettingsScreen;
