import React from "react";
import { ActionIcon, Tooltip, Group } from "@mantine/core";
import {
    IconChartLine,
    IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth";

const UserMenu: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <Group gap="xs">
            <Tooltip label="Investments" withArrow>
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => navigate("/capital")}
                >
                    <IconChartLine size={20} />
                </ActionIcon>
            </Tooltip>

            <Tooltip label="Profile" withArrow>
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => navigate("/members")}
                >
                    <IconUser size={20} />
                </ActionIcon>
            </Tooltip>
        </Group>
    );
};

export default UserMenu;
