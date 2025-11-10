import React from "react";
import TopNav from "../components/TopNav/TopNav";
import { Container } from "@mantine/core";

interface IProps { children: React.ReactNode }

// Replaces sidebar SiteLayout with a sticky top navigation bar.
// Provides consistent padding and max-width container for page content.
const TopLayout: React.FC<IProps> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopNav />
      <main style={{ flex: 1 }}>
        {/* Individual screens can override layout by not relying on Container if they need full-bleed sections */}
        {children}
      </main>
      <footer style={{ padding: "1.5rem 0", textAlign: "center", fontSize: 14, opacity: 0.7 }}>
        © {new Date().getFullYear()} Capital One Trading. All rights reserved.
      </footer>
    </div>
  );
};

export default TopLayout;
