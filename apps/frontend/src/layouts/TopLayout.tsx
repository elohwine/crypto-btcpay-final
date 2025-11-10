import React from "react";
import TopNav from "../components/TopNav/TopNav";
import { Box, useMantineColorScheme, useMantineTheme } from "@mantine/core";

interface IProps { children: React.ReactNode }

// Replaces sidebar SiteLayout with a sticky top navigation bar.
// Provides consistent padding and max-width container for page content.
const TopLayout: React.FC<IProps> = ({ children }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav />
      <main style={{ flex: 1 }}>
        {/* Individual screens can override layout by not relying on Container if they need full-bleed sections */}
        {children}
      </main>
      <Box component="footer" py="xl" style={{ background: isDark ? theme.colors.dark[8] : theme.colors.gray[1], textAlign: "center" }}>
        © {new Date().getFullYear()} Magnum. All rights reserved.
      </Box>
    </div>
  );
};

export default TopLayout;
