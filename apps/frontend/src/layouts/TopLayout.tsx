import React, { useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import UnifiedHeader from "../components/UnifiedHeader/UnifiedHeader";
import SupportWidget from "../components/Support/SupportWidget";
import { Box, useMantineColorScheme, useMantineTheme, Group, Text, Anchor, Drawer, Burger } from "@mantine/core";
import { useAuth } from "../lib/auth";
import { IconBrandWhatsapp, IconBrandTelegram } from "@tabler/icons-react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useLocation } from "react-router-dom";

interface IProps { children: React.ReactNode }

// Conditional layout with unified header for all pages
const TopLayout: React.FC<IProps> = ({ children }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const [drawerOpened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();

  // Auto-close sidebar drawer on route change (mobile only)
  useEffect(() => {
    if (isMobile && drawerOpened) {
      close();
    }
  }, [location.pathname]);

  // If user is logged in, show unified header + sidebar layout
  if (user) {
    return (
      <>
        {/* Unified Header */}
        <UnifiedHeader />

        {/* Mobile Header with Burger for Sidebar */}
        {isMobile && (
          <Box
            style={{
              position: "sticky",
              top: 64, // Below unified header
              zIndex: 99,
              background: isDark ? theme.colors.dark[7] : "white",
              borderBottom: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
              padding: "12px 16px",
            }}
          >
            <Group justify="space-between">
              <Text size="sm" fw={600}>Menu</Text>
              <Burger opened={drawerOpened} onClick={toggle} size="sm" />
            </Group>
          </Box>
        )}

        {/* Desktop: Fixed Sidebar Layout */}
        {!isMobile ? (
          <div className="site-layout" style={{ marginTop: 0 }}>
            <div className="navbar">
              <Navbar />
            </div>
            <div className="site-content">
              {children}
            </div>
          </div>
        ) : (
          // Mobile: Content without sidebar
          <div style={{ padding: "16px", marginTop: 0 }}>
            {children}
          </div>
        )}

        {/* Mobile Sidebar Drawer */}
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
              body: {
                height: "100%",
                padding: 0,
              },
            }}
          >
            <div className="navbar" style={{
              width: '100%',
              height: '100%',
              borderRight: 'none',
              overflow: 'auto'
            }}>
              <Navbar />
            </div>
          </Drawer>
        )}
      </>
    );
  }

  // If user is NOT logged in, show unified header + public layout
  return (
    <>
      <UnifiedHeader />
      <main style={{ minHeight: "calc(100vh - 64px)" }}>
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
      <SupportWidget />
    </>
  );
};

export default TopLayout;
