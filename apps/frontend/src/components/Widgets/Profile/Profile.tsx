import { useRef, useState, useEffect } from "react";

// lib
import { useAuth } from "../../../lib/auth";
import api from "../../../lib/api";

// hooks
import useClickOutside from "../../../hooks/useClickOutside";

// components
import Box from "../../Common/Box";
import { Avatar, Indicator } from "@mantine/core";
import { useAppTheme, hexToRgba } from "../../../lib/themeUtils";
import MyAssets from "../MyAssets/MyAssets";

const Profile: React.FC = () => {
  const ref = useRef<any>(null);

  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState<boolean>(false);
  const [depositsError, setDepositsError] = useState<string | null>(null);

  const { user } = useAuth();

  useClickOutside(ref, () => setMenuOpened(false));

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingDeposits(true);
      setDepositsError(null);
      try {
        const res = await api.get("/deposits/me");
        if (!mounted) return;
        // keep only supported chains in the profile view
        const supported = ["BTC", "USDT", "ETH"];
        const rows = Array.isArray(res.data) ? res.data : [];
        const filtered = rows.filter((r: any) =>
          supported.includes(String(r.currency).toUpperCase())
        );
        setDeposits(filtered);
      } catch (err: any) {
        console.warn("Profile: failed to load deposits", err);
        if (!mounted) return;
        setDepositsError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load deposits"
        );
      } finally {
        if (mounted) setLoadingDeposits(false);
      }
    };
    // only load when we have an authenticated user; otherwise keep empty
    if (user) load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const { primary } = useAppTheme();

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div ref={ref} className="flex flex-center flex-space-between">
          <button
            type="button"
            className="box-icon pointer"
            onClick={() => handleMenuOpen()}
          >
            <i className="material-icons">more_vert</i>
          </button>

          {menuOpened && (
            <div className="box-dropdown">
              <ul>
                <li>
                  <button type="button">
                    <i className="material-icons">settings</i>
                    Button 1
                  </button>
                </li>
                <li>
                  <button type="button">
                    <i className="material-icons">favorite</i>
                    Button 2
                  </button>
                </li>
                <li>
                  <button type="button">
                    <i className="material-icons">info</i>
                    Button 3
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div
        className="widget-profile box-content box-content-height-nobutton"
        style={{
          position: "relative",
          background: `linear-gradient(180deg, ${hexToRgba(
            primary,
            0.04
          )} 0%, rgba(0,0,0,0) 40%)`,
        }}
      >
        {/* subtle primary accent strip (reduced) */}
        <div
          aria-hidden
          style={{
            height: 8,
            background: hexToRgba(primary, 0.04),
            borderRadius: 6,
            margin: "12px",
            zIndex: 0,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 18,
            marginBottom: 18,
            position: "relative",
            zIndex: 3,
          }}
        >
          {/* Mantine Avatar with Indicator wired to auth user info. Prefers user.avatar / picture / image if available. Increased size by ~30% and added spacing below to avoid overlap with assets. */}
          <Indicator position="bottom-end" offset={8} color="green" withBorder>
            <Avatar
              size={125}
              radius="xl"
              src={
                (user as any)?.avatar ||
                (user as any)?.picture ||
                (user as any)?.image ||
                "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
              }
              alt={user?.name || user?.email || "Guest"}
              title={user?.name || user?.email}
            >
              {(() => {
                const name = user?.name || user?.email || "G";
                const parts = String(name).trim().split(/\s+/);
                if (parts.length === 1)
                  return parts[0].slice(0, 1).toUpperCase();
                return (
                  parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)
                ).toUpperCase();
              })()}
            </Avatar>
          </Indicator>
        </div>
        <div className="box-horizontal-padding" style={{ marginTop: 12 }}>
          <div className="center">
            <h3 style={{ margin: 0, marginBottom: 18, color: "var(--text)" }}>
              {user?.name || user?.email || "Guest"}
            </h3>
          </div>
          <div style={{ marginTop: 16 }}>
            <MyAssets />
          </div>
        </div>
      </div>
    </Box>
  );
};
export default Profile;
