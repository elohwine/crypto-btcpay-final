import React from "react";
import { Menu, Button, Text, Group } from "@mantine/core";
import {
    IconUser,
    IconSettings,
    IconLogout,
    IconChevronDown,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";

const UserMenu: React.FC = () => {
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signout();
        navigate("/");
    };

    if (!user) return null;

    return (
        <Menu shadow="md" width={220}>
            <Menu.Target>
                <Button variant="subtle" size="sm" rightSection={<IconChevronDown size={16} />}>
                    <Text size="sm" style={{ maxWidth: 150 }} truncate>
                        {user.email}
                    </Text>
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => navigate("/members")}
                >
                    Profile
                </Menu.Item>
                <Menu.Item
                    leftSection={<IconSettings size={16} />}
                    onClick={() => navigate("/settings")}
                >
                    Settings
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    color="red"
                    onClick={handleLogout}
                >
                    Logout
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default UserMenu;
