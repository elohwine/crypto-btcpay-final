import React from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { useMantineTheme } from "@mantine/core";

interface NavLinksProps {
    authenticated: boolean;
    mobile?: boolean;
    onNavigate?: () => void;
}

interface NavItem {
    label: string;
    getPath: (auth: boolean) => string;
}

const navItems: NavItem[] = [
    {
        label: "Home",
        getPath: (auth) => (auth ? "/dashboard" : "/"),
    },
    {
        label: "Investments",
        getPath: (auth) => (auth ? "/capital" : "/#plans"),
    },
    {
        label: "About Us",
        getPath: () => "/about",
    },
    {
        label: "Support",
        getPath: () => "/support",
    },
];

const NavLinks: React.FC<NavLinksProps> = ({
    authenticated,
    mobile = false,
    onNavigate,
}) => {
    const theme = useMantineTheme();
    const location = useLocation();

    const handleClick = (path: string) => {
        // Handle anchor links (e.g., /#plans)
        if (path.includes("#")) {
            const [pathname, hash] = path.split("#");
            if (pathname === "/" && location.pathname === "/") {
                // Already on landing page, just scroll
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }
        }
        onNavigate?.();
    };

    const isActive = (path: string) => {
        if (path.includes("#")) {
            const [pathname] = path.split("#");
            return location.pathname === pathname;
        }
        return location.pathname === path;
    };

    if (mobile) {
        return (
            <Stack gap="xs" style={{ width: "100%" }}>
                {navItems.map((item) => {
                    const path = item.getPath(authenticated);
                    return (
                        <Button
                            key={item.label}
                            component={Link}
                            to={path}
                            onClick={() => handleClick(path)}
                            variant={isActive(path) ? "light" : "subtle"}
                            fullWidth
                            size="md"
                            style={{ justifyContent: "flex-start" }}
                        >
                            {item.label}
                        </Button>
                    );
                })}
            </Stack>
        );
    }

    return (
        <Group gap="lg">
            {navItems.map((item) => {
                const path = item.getPath(authenticated);
                const active = isActive(path);
                return (
                    <Button
                        key={item.label}
                        component={Link}
                        to={path}
                        onClick={() => handleClick(path)}
                        variant="subtle"
                        size="sm"
                        style={{
                            fontWeight: active ? 600 : 500,
                            color: active
                                ? theme.colors[theme.primaryColor][6]
                                : undefined,
                        }}
                    >
                        {item.label}
                    </Button>
                );
            })}
        </Group>
    );
};

export default NavLinks;
