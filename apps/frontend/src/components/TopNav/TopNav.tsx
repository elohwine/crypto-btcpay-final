import React from "react";
import {
  Group,
  Button,
  Burger,
  Drawer,
  Stack,
  useMantineTheme,
  Container,
  Box,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import { IconTrendingUp } from "@tabler/icons-react";
import { useAuth } from "../../lib/auth";

const TopNav: React.FC = () => {
  const theme = useMantineTheme();
  const [opened, { toggle, close }] = useDisclosure(false);
  const location = useLocation();
  const { user } = useAuth();
  const isDark = (theme as any).colorScheme === "dark";

  type NavLink = {
    to: string;
    label: string;
    highlight?: boolean;
  };

  const publicNavLinks: NavLink[] = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/members/signup", label: "Investment Plans", highlight: true },
  ];

  const authenticatedNavLinks: NavLink[] = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/capital", label: "My Wallet" },
    { to: "/transactions", label: "Transactions" },
    { to: "/members", label: "Profile" },
    { to: "/admin", label: "Admin" },
  ];

  const navLinks = user ? authenticatedNavLinks : publicNavLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <Box
      component="nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: isDark
          ? `rgba(26, 27, 30, 0.95)`
          : `rgba(255, 255, 255, 0.95)`,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${
          isDark ? theme.colors.dark[4] : theme.colors.gray[3]
        }`,
      }}
    >
      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
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

          {/* Desktop Nav */}
          <Group gap="md" visibleFrom="sm">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                variant={
                  link.highlight
                    ? "filled"
                    : isActive(link.to)
                    ? "light"
                    : "subtle"
                }
                color={link.highlight ? theme.primaryColor : "gray"}
                size="md"
                onClick={close}
                style={{
                  fontWeight: isActive(link.to) ? 600 : 500,
                }}
              >
                {link.label}
              </Button>
            ))}

            {user ? (
              <Button
                component={Link}
                to="/dashboard"
                variant="filled"
                color={theme.primaryColor}
                size="md"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/members/signin"
                  variant="default"
                  size="md"
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  to="/members/signup"
                  variant="filled"
                  color={theme.primaryColor}
                  size="md"
                >
                  Get Started
                </Button>
              </>
            )}
          </Group>

          {/* Mobile Burger */}
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="100%"
        padding="md"
        title="Menu"
        styles={{
          title: { fontWeight: 700, fontSize: 18 },
        }}
      >
        <Stack gap="sm">
          {navLinks.map((link) => (
            <Button
              key={link.to}
              component={Link}
              to={link.to}
              variant={
                link.highlight
                  ? "filled"
                  : isActive(link.to)
                  ? "light"
                  : "subtle"
              }
              color={link.highlight ? theme.primaryColor : "gray"}
              size="lg"
              fullWidth
              onClick={close}
              style={{
                justifyContent: "flex-start",
                fontWeight: isActive(link.to) ? 600 : 500,
              }}
            >
              {link.label}
            </Button>
          ))}

          {user ? (
            <Button
              component={Link}
              to="/dashboard"
              variant="filled"
              color={theme.primaryColor}
              size="lg"
              fullWidth
              onClick={close}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                component={Link}
                to="/members/signin"
                variant="default"
                size="lg"
                fullWidth
                onClick={close}
              >
                Sign In
              </Button>
              <Button
                component={Link}
                to="/members/signup"
                variant="filled"
                color={theme.primaryColor}
                size="lg"
                fullWidth
                onClick={close}
              >
                Get Started
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
};

export default TopNav;
