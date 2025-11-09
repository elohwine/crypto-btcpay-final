import React, { useEffect, useState } from "react";
import {
  Modal,
  Title,
  Text,
  Button,
  Stack,
  List,
  Divider,
  Group,
  Badge,
  useMantineTheme,
  Checkbox,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

interface RiskDisclaimerProps {
  opened: boolean;
  onClose: () => void;
  autoShow?: boolean;
}

const DISCLAIMER_KEY = "capital-one-disclaimer-accepted";

const RiskDisclaimer: React.FC<RiskDisclaimerProps> = ({
  opened,
  onClose,
  autoShow = false,
}) => {
  const theme = useMantineTheme();
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    if (autoShow) {
      const accepted = localStorage.getItem(DISCLAIMER_KEY);
      if (!accepted) {
        // Modal will open via parent component's state
      }
    }
  }, [autoShow]);

  const handleAccept = () => {
    if (understood) {
      localStorage.setItem(DISCLAIMER_KEY, "true");
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconAlertTriangle size={24} color={theme.colors.orange[6]} />
          <Title order={3}>Investment Risk Disclaimer</Title>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md">
        <Badge size="lg" variant="light" color="orange">
          Important: Please Read Carefully
        </Badge>

        <Text size="sm" style={{ lineHeight: 1.6 }}>
          Capital One Trading Investment involves significant risk. By using our
          platform, you acknowledge and accept the following:
        </Text>

        <Divider />

        <List size="sm" spacing="xs" style={{ lineHeight: 1.6 }}>
          <List.Item>
            <strong>Trading Risk:</strong> Binary options trading carries
            substantial risk of loss. Past performance does not guarantee future
            results.
          </List.Item>
          <List.Item>
            <strong>Capital at Risk:</strong> You may lose some or all of your
            invested capital. Only invest funds you can afford to lose.
          </List.Item>
          <List.Item>
            <strong>No Guarantees:</strong> While we strive for consistent
            returns, daily profit percentages are targets, not guarantees. Market
            conditions may affect actual returns.
          </List.Item>
          <List.Item>
            <strong>Withdrawal Terms:</strong> Principal amounts are locked for
            the duration of your chosen investment plan. Early withdrawal may not
            be available.
          </List.Item>
          <List.Item>
            <strong>Regulatory Status:</strong> Binary options trading may be
            restricted or prohibited in certain jurisdictions. Ensure you comply
            with local laws.
          </List.Item>
          <List.Item>
            <strong>Platform Risk:</strong> While we implement security measures,
            cryptocurrency and online investments carry inherent risks including
            technical failures, cyber attacks, and market volatility.
          </List.Item>
          <List.Item>
            <strong>USDT Volatility:</strong> We accept USDT (TRC20), which is a
            stablecoin but still subject to market risks and depeg events.
          </List.Item>
          <List.Item>
            <strong>Limited Spots:</strong> Daily investment limits exist. Your
            investment may be subject to acceptance and verification processes.
          </List.Item>
        </List>

        <Divider />

        <Text size="sm" fw={600} c={theme.colors.orange[7]}>
          By proceeding, you confirm that:
        </Text>

        <List size="sm" spacing="xs">
          <List.Item>
            You are of legal age to enter into this investment agreement
          </List.Item>
          <List.Item>
            You understand the risks and can bear potential losses
          </List.Item>
          <List.Item>
            You have read and agree to our terms and conditions
          </List.Item>
          <List.Item>
            You are not prohibited by law from using our services
          </List.Item>
        </List>

        <Divider />

        <Checkbox
          checked={understood}
          onChange={(event) => setUnderstood(event.currentTarget.checked)}
          label={
            <Text size="sm" fw={600}>
              I have read, understood, and accept all risks and terms outlined
              above
            </Text>
          }
        />

        <Group gap="md" justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Go Back
          </Button>
          <Button
            variant="filled"
            color={theme.primaryColor}
            disabled={!understood}
            onClick={handleAccept}
          >
            I Understand & Accept
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center" mt="sm">
          This disclaimer is for informational purposes only and does not
          constitute financial advice. Consult a qualified financial advisor
          before investing.
        </Text>
      </Stack>
    </Modal>
  );
};

export default RiskDisclaimer;

export const useRiskDisclaimer = () => {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    if (!accepted) {
      // Show after a short delay for better UX
      const timer = setTimeout(() => setOpened(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    opened,
    open: () => setOpened(true),
    close: () => setOpened(false),
  };
};
