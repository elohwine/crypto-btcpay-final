import React from "react";
import { ActionIcon, Tooltip, Group, Menu } from "@mantine/core";
import {
    IconChartLine,
    IconUser,
    IconLogout,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";

const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <Group gap="xs">
            <Tooltip label="Plans" withArrow>
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => navigate("/plans")}
                >
                    <IconChartLine size={20} />
                </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200} position="bottom-end">
                <Menu.Target>
                    <ActionIcon variant="subtle" size="lg">
                        <IconUser size={20} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Label>Account</Menu.Label>
                    <Menu.Item
                        leftSection={<IconUser size={14} />}
                        onClick={() => navigate("/members")}
                    >
                        Profile
                    </Menu.Item>
                    <Menu.Item
                        leftSection={<IconChartLine size={14} />}
                        onClick={() => navigate("/plans")}
                    >
                        Investments
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item
                        color="red"
                        leftSection={<IconLogout size={14} />}
                        onClick={logout}
                    >
                        Logout
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
};

export default UserMenu;
