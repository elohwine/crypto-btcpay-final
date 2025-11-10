import React from "react";
import TopNav from "../components/TopNav/TopNav";
import Navbar from "../components/Navbar/Navbar";
import { Box, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useAuth } from "../lib/auth";

interface IProps { children: React.ReactNode }

// Conditional layout: sidebar drawer for logged-in users, top nav for public users.
const TopLayout: React.FC<IProps> = ({ children }) => {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();

  // If user is logged in, show sidebar layout (classic flex layout)
  if (user) {
    return (
      <div className="site-layout">
        <div className="navbar">
          <Navbar />
        </div>
        <div className="site-content">
          {children}
        </div>
      </div>
    );
  }

  // If user is NOT logged in, show top navigation layout
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Box component="footer" py="xl" style={{ background: isDark ? theme.colors.dark[8] : theme.colors.gray[1], textAlign: "center" }}>
        © {new Date().getFullYear()} Magnum. All rights reserved.
      </Box>
    </div>
  );
};

export default TopLayout;
