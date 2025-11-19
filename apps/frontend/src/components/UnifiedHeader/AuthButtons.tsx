import React from "react";
import { Button, Group } from "@mantine/core";
import { Link } from "react-router-dom";
import { useMantineTheme } from "@mantine/core";

const AuthButtons: React.FC = () => {
    const theme = useMantineTheme();

    return (
        <Group gap="sm">
            <Button
                variant="default"
                component={Link}
                to="/members/signin"
                size="sm"
            >
                Sign In
            </Button>
            <Button
                variant="filled"
                component={Link}
                to="/members/signup"
                color={theme.primaryColor}
                size="sm"
            >
                Get Started
            </Button>
        </Group>
    );
};

export default AuthButtons;
