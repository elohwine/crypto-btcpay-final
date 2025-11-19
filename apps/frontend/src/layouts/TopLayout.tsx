import React, { useEffect } from "react";
import TopNav from "../components/TopNav/TopNav";
import Navbar from "../components/Navbar/Navbar";
import { Box, useMantineColorScheme, useMantineTheme, Group, Text, Anchor, Drawer, Burger } from "@mantine/core";
import { useAuth } from "../lib/auth";
import { IconBrandWhatsapp, IconBrandTelegram } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useLocation } from "react-router-dom";

interface IProps { children: React.ReactNode }

// Conditional layout: sidebar drawer for logged-in users, top nav for public users.
const TopLayout: React.FC<IProps> = ({ children }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const [drawerOpened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();

  // Auto-close drawer on route change (mobile only)
  useEffect(() => {
    if (isMobile && drawerOpened) {
      close();
    }
  }, [location.pathname]);

  // If user is logged in, show sidebar layout with mobile drawer
  if (user) {
    return (
      <>
        {/* Mobile Header with Burger */}
        {isMobile && (
          <Box
            style={{
              position: "sticky",
              top: 0,
              zIndex: 100,
              background: isDark ? theme.colors.dark[7] : "white",
              borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
              padding: "12px 16px",
            }}
          >
            <Group justify="space-between">
              <Text size="lg" fw={700}>Magnum</Text>
              <Burger opened={drawerOpened} onClick={toggle} size="sm" />
            </Group>
          </Box>
        )}

        {/* Desktop: Fixed Sidebar Layout */}
        {!isMobile ? (
          <div className="site-layout">
            <div className="navbar">
              <Navbar />
            </div>
            <div className="site-content">
              {children}
            </div>
          </div>
        ) : (
          // Mobile: Content without sidebar
          <div style={{ padding: "16px" }}>
            {children}
          </div>
        )}

        {/* Mobile Drawer - Only rendered when needed */}
        {isMobile && (
          <Drawer
            opened={drawerOpened}
            onClose={close}
            size="80%"
            padding={0}
            styles={{
              content: {
                background: isDark ? theme.colors.dark[7] : "white",
              },
            }}
          >
            <Navbar />
          </Drawer>
        )}
      </>
    );
  }

  // If user is NOT logged in, show top navigation layout
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Box component="footer" py="xl" style={{ background: isDark ? theme.colors.dark[8] : theme.colors.gray[1] }}>
        <Group justify="center" gap="xl" mb="md" wrap="wrap" px="md">
          <Anchor href="https://wa.me/15343490641" target="_blank" style={{ textDecoration: "none" }}>
            <Group gap="xs">
              <IconBrandWhatsapp size={20} />
              <Text size="sm">WhatsApp Support</Text>
            </Group>
          </Anchor>
          <Anchor href="https://t.me/+3Y8QFGwpWN9jZjZk" target="_blank" style={{ textDecoration: "none" }}>
            <Group gap="xs">
              <IconBrandTelegram size={20} />
              <Text size="sm">Telegram Group</Text>
            </Group>
          </Anchor>
        </Group>
        <Text size="sm" ta="center">© {new Date().getFullYear()} Magnum. All rights reserved.</Text>
      </Box>
    </div>
  );
};

export default TopLayout;
