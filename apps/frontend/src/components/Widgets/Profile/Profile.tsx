import { useRef, useState, useEffect } from "react";

// lib
import { useAuth } from "../../../lib/auth";
import api from "../../../lib/api";

// hooks
import useClickOutside from "../../../hooks/useClickOutside";

// components
import Box from "../../Common/Box";
import { Avatar, Indicator, Button, Text, Group, Badge, CopyButton, ActionIcon, Tooltip } from "@mantine/core";
import { IconWallet, IconCopy, IconCheck, IconUsers } from "@tabler/icons-react";
import { useAppTheme, hexToRgba } from "../../../lib/themeUtils";
import MyAssets from "../MyAssets/MyAssets";
import { notify } from "../../../ui/notifications/notify";

const Profile: React.FC = () => {
  const ref = useRef<any>(null);

  const [menuOpened, setMenuOpened] = useState<boolean>(false);
  const [tronAddress, setTronAddress] = useState<string | null>(null);
  const [tronBalance, setTronBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);

  const { user } = useAuth();

  useClickOutside(ref, () => setMenuOpened(false));

  /**
   * Toggles the state of the menu to open or close.
   */
  const handleMenuOpen = (): void => setMenuOpened(!menuOpened);

  const connectTronWallet = async () => {
    if (typeof window === 'undefined') return;
    const tronWeb = (window as any).tronWeb;

    if (!tronWeb) {
      notify.error("TronLink not installed. Please install TronLink extension.");
      window.open("https://www.tronlink.org/", "_blank");
      return;
    }

    try {
      setConnecting(true);
      // Request account access
      const res = await tronWeb.request({ method: 'tron_requestAccounts' });

      if (res.code === 200 || (tronWeb.ready && tronWeb.defaultAddress.base58)) {
        const address = tronWeb.defaultAddress.base58;
        setTronAddress(address);

        // Get balance
        const balance = await tronWeb.trx.getBalance(address);
        setTronBalance((balance / 1000000).toFixed(2));

        notify.success("Tron wallet connected successfully");
      } else {
        notify.error("Failed to connect Tron wallet");
      }
    } catch (error) {
      console.error("Tron connection error:", error);
      notify.error("Error connecting to Tron wallet");
    } finally {
      setConnecting(false);
    }
  };

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
                    Settings
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
            <h3 style={{ margin: 0, marginBottom: 8, color: "var(--text)" }}>
              {user?.name || user?.email || "Guest"}
            </h3>

            {/* Referral Info */}
            {(user as any)?.referralCode && (
              <Group justify="center" gap="xs" mb="md">
                <Badge
                  size="lg"
                  variant="light"
                  color="blue"
                  leftSection={<IconUsers size={14} />}
                >
                  Referrals: {(user as any)?.referralCount || 0}
                </Badge>
                <CopyButton value={(user as any)?.referralCode} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy Referral Code'} withArrow position="right">
                      <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            )}

            {/* Tron Wallet Connection */}
            <div style={{ marginBottom: 20 }}>
              {!tronAddress ? (
                <Button
                  leftSection={<IconWallet size={16} />}
                  variant="light"
                  color="red"
                  size="xs"
                  loading={connecting}
                  onClick={connectTronWallet}
                >
                  Connect Tron Wallet
                </Button>
              ) : (
                <div style={{
                  background: hexToRgba(primary, 0.1),
                  padding: '8px 12px',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  <Text size="xs" c="dimmed" mb={4}>Tron Wallet Connected</Text>
                  <Group gap={8} justify="center">
                    <Text size="sm" fw={500}>
                      {tronAddress.slice(0, 6)}...{tronAddress.slice(-4)}
                    </Text>
                    <Badge color="red" variant="filled" size="sm">
                      {tronBalance || '0.00'} TRX
                    </Badge>
                  </Group>
                </div>
              )}
            </div>
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
