import React, { useState } from "react";
import { Card, Title, Text, Grid, Group, Button, Stack, CopyButton, ActionIcon, Tooltip, Badge } from "@mantine/core";
import { IconCopy, IconCheck, IconBrandTelegram, IconGift } from "@tabler/icons-react";
// components
import Box from "../../components/Common/Box";
import TopLayout from "../../layouts/TopLayout";
import BankProcess from "../../components/Widgets/BankProcess/BankProcess";
import { useAuth } from "../../lib/auth";

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const referralLink = user?.id ? `${window.location.origin}/members/signup?ref=${user.id}` : "";

  return (
    <TopLayout>
      {/* Referral and Telegram Cards */}
      <Grid mb="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconGift size={24} />
                  <Title order={4}>Referral Link</Title>
                </Group>
                <Badge color="green">Earn Rewards</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Share your referral link with friends and earn bonuses when they invest!
              </Text>
              <Group gap="xs" wrap="nowrap">
                <Text
                  size="sm"
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "var(--mantine-color-gray-1)",
                    borderRadius: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {referralLink}
                </Text>
                <CopyButton value={referralLink} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied!" : "Copy"} withArrow position="right">
                      <ActionIcon color={copied ? "teal" : "blue"} variant="filled" onClick={copy} size="lg">
                        {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconBrandTelegram size={24} />
                  <Title order={4}>Join Our Community</Title>
                </Group>
                <Badge color="blue">Live Chat</Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Connect with other investors, get updates, and chat with our support team on Telegram.
              </Text>
              <Button
                component="a"
                href="https://t.me/+3Y8QFGwpWN9jZjZk"
                target="_blank"
                leftSection={<IconBrandTelegram size={18} />}
                variant="light"
                fullWidth
              >
                Join Telegram Group
              </Button>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      <div className="flex flex-destroy flex-space-between">
        <div className="flex-1">
          <BankProcess />
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            background: "var(--primary-opaque, rgba(59,130,246,0.12))",
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Box>
            <div className="box-title box-vertical-padding box-horizontal-padding no-select">
              <div className="flex flex-center flex-space-between">
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
                  Withdrawal Information
                </p>
              </div>
            </div>
            <div
              className="box-content box-text box-horizontal-padding box-content-height-nobutton"
              style={{ fontSize: 13, color: "var(--text)" }}
            >
              <p style={{ marginBottom: 8 }}>
                &bull; You can make withdrawals from all the bank accounts opened
                in your name (individual, non-term, TL). Transfers to another
                person will not be processed.
              </p>
              <p style={{ marginBottom: 8 }}>
                &bull; The minimum withdrawal amount is $5.
              </p>
              <p style={{ marginBottom: 8 }}>
                &bull; A processing fee of 3 TL will be charged for withdrawal
                transactions.
              </p>
              <p style={{ marginBottom: 8 }}>
                &bull; When you issue a withdrawal instruction, the amount will be
                deducted from your available balance.
              </p>
              <p style={{ marginBottom: 8 }}>
                &bull; You can cancel any instructions that have not been
                processed yet. In this case, the instruction amount will be
                returned to your available balance.
              </p>
              <p style={{ marginBottom: 0 }}>
                &bull; Withdrawal instructions given outside of bank working hours
                will be processed once the banks begin their working hours.
              </p>
            </div>
          </Box>
        </div>
      </div>
    </TopLayout>
  );
};

export default DashboardScreen;

