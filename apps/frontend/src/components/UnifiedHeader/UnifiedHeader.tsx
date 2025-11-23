import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Group,
    Text,
    Burger,
    Drawer,
    Stack,
    useMantineTheme,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import { IconTrendingUp } from "@tabler/icons-react";
import { useAuth } from "../../lib/auth";
import NavLinks from "./NavLinks";
import UserMenu from "./UserMenu";
import AuthButtons from "./AuthButtons";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";

interface UnifiedHeaderProps {
    transparent?: boolean;
    elevation?: boolean;
}

const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
    transparent = false,
    elevation = true,
}) => {
    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();
    const { user } = useAuth();
    const [drawerOpened, { toggle, close }] = useDisclosure(false);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const isDark = colorScheme === "dark";

    // Auto-close drawer on navigation
    useEffect(() => {
        close();
    }, [location.pathname]);

    // Detect scroll for elevation
    useEffect(() => {
        if (!elevation) return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [elevation]);

    const headerBg = transparent && !scrolled
        ? "transparent"
        : isDark
            ? "rgba(26, 27, 30, 0.98)"
            : "rgba(255, 255, 255, 0.98)";

    const borderColor = isDark ? theme.colors.dark[4] : theme.colors.gray[3];

    return (
        <>
            <Box
                component="header"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    background: headerBg,
                    backdropFilter: "blur(10px)",
                    borderBottom: scrolled || !transparent ? `1px solid ${borderColor}` : "none",
                    boxShadow: scrolled && elevation ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.3s ease",
                }}
            >
                <Container size="xl" py={{ base: 12, sm: 16 }}>
                    <Group justify="space-between" align="center">
                        {/* Left: Logo + Nav Links */}
                        <Group gap="xl">
                            {/* Logo */}
                            <Link
                                to="/"
                                style={{
                                    textDecoration: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <IconTrendingUp
                                    size={32}
                                    color={theme.colors[theme.primaryColor][6]}
                                />
                                <Text
                                    size="xl"
                                    fw={700}
                                    style={{
                                        color: isDark ? "white" : theme.colors.dark[9],
                                        letterSpacing: "-0.5px",
                                    }}
                                >
                                    Magnum
                                </Text>
                            </Link>

                            {/* Desktop Navigation Links */}
                            {!isMobile && <NavLinks authenticated={!!user} />}
                        </Group>

                        {/* Right: User Controls */}
                        <Group gap="md">
                            {!isMobile && (
                                <>
                                    <ThemeSwitch />
                                    {user ? <UserMenu /> : <AuthButtons />}
                                </>
                            )}

                            {/* Mobile Controls */}
                            {isMobile && (
                                <>
                                    <ThemeSwitch />
                                    {user ? (
                                        // Authenticated: Show icons only (no hamburger)
                                        <UserMenu />
                                    ) : (
                                        // Public: Show hamburger for nav drawer
                                        <Burger opened={drawerOpened} onClick={toggle} size="sm" />
                                    )}
                                </>
                            )}
                        </Group>
                    </Group>
                </Container>
            </Box>

            {/* Mobile Drawer - ONLY for unauthenticated users */}
            {!user && (
                <Drawer
                    opened={drawerOpened}
                    onClose={close}
                    size="80%"
                    padding="md"
                    title="Menu"
                    styles={{
                        title: { fontWeight: 700, fontSize: 18 },
                        content: {
                            background: isDark ? theme.colors.dark[7] : "white",
                        },
                    }}
                >
                    <Stack gap="lg">
                        <NavLinks authenticated={!!user} mobile onNavigate={close} />

                        <Box
                            style={{
                                borderTop: `1px solid ${borderColor}`,
                                paddingTop: 16,
                            }}
                        >
                            <Stack gap="md">
                                <ThemeSwitch />
                                <AuthButtons />
                            </Stack>
                        </Box>
                    </Stack>
                </Drawer>
            )}
        </>
    );
};

export default UnifiedHeader;
