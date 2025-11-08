import React from "react";
import {
  Card,
  Text,
  Badge,
  Stack,
  Group,
  Button,
  Divider,
  List,
  ThemeIcon,
  Box,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconCheck, IconTrendingUp, IconStar } from "@tabler/icons-react";
import { InvestmentPlan, calculateTotalReturn } from "../../types/investment";
import { Link } from "react-router-dom";
import "./PlanCard.css";

interface PlanCardProps {
  plan: InvestmentPlan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const theme = useMantineTheme();
  const isDark = (theme as any).colorScheme === "dark";

  // Calculate example returns for max investment
  const exampleReturn = calculateTotalReturn(
    plan.maxInvest,
    plan.ror,
    plan.duration
  );

  const bgGradient = plan.popular
    ? `linear-gradient(135deg, ${theme.colors[theme.primaryColor][6]} 0%, ${theme.colors[theme.primaryColor][8]} 100%)`
    : isDark
    ? theme.colors.dark[6]
    : theme.colors.gray[0];

  const textColor = plan.popular ? "white" : undefined;

  return (
    <Card
      shadow="md"
      padding="xl"
      radius="lg"
      className="plan-card-hover"
      style={{
        background: bgGradient,
        border: plan.popular
          ? `2px solid ${theme.colors[theme.primaryColor][4]}`
          : plan.limited
          ? `2px solid ${theme.colors.yellow[6]}`
          : `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Popular/Limited badge at top */}
      {(plan.badge || plan.popular || plan.limited) && (
        <Box
          style={{
            position: "absolute",
            top: -12,
            right: 20,
          }}
        >
          <Badge
            size="lg"
            variant="filled"
            color={plan.popular ? "yellow" : plan.limited ? "orange" : "blue"}
            leftSection={
              plan.popular ? (
                <IconStar size={14} />
              ) : plan.limited ? (
                <IconTrendingUp size={14} />
              ) : null
            }
            style={{
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {plan.badge || (plan.popular ? "POPULAR" : "LIMITED")}
          </Badge>
        </Box>
      )}

      <Stack gap="md" mt={plan.badge || plan.popular || plan.limited ? 16 : 0}>
        {/* Plan name */}
        <Title
          order={3}
          size="h4"
          style={{
            color: textColor,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {plan.name}
        </Title>

        {/* Daily ROI highlight */}
        <Group gap="xs" align="baseline">
          <Text
            size="xl"
            fw={700}
            style={{
              fontSize: 42,
              lineHeight: 1,
              color: textColor || theme.colors[theme.primaryColor][6],
            }}
          >
            {plan.ror}%
          </Text>
          <Text size="sm" c={textColor ? "white" : "dimmed"}>
            daily returns
          </Text>
        </Group>

        {/* Investment range */}
        <Box>
          <Text size="xs" c={textColor ? "white" : "dimmed"} mb={4}>
            INVESTMENT RANGE
          </Text>
          <Text size="lg" fw={600} c={textColor}>
            ${plan.minInvest.toLocaleString()} - $
            {plan.maxInvest.toLocaleString()}
          </Text>
        </Box>

        {/* Duration */}
        <Group gap="xs">
          <Text size="sm" c={textColor ? "white" : "dimmed"}>
            Duration:
          </Text>
          <Badge
            variant={plan.popular ? "white" : "light"}
            color={plan.popular ? "dark" : theme.primaryColor}
          >
            {plan.duration} Days
          </Badge>
        </Group>

        {/* Example calculation */}
        <Card
          p="sm"
          radius="md"
          style={{
            background: plan.popular
              ? "rgba(255,255,255,0.15)"
              : isDark
              ? theme.colors.dark[5]
              : theme.colors.gray[1],
          }}
        >
          <Text size="xs" c={textColor ? "white" : "dimmed"} mb={4}>
            TOTAL PROFIT EXAMPLE
          </Text>
          <Group gap="xs" align="baseline">
            <Text size="xl" fw={700} c={textColor || theme.colors.green[6]}>
              ${exampleReturn.toFixed(2)}
            </Text>
            <Text size="xs" c={textColor ? "white" : "dimmed"}>
              on ${plan.maxInvest} investment
            </Text>
          </Group>
        </Card>

        <Divider
          color={
            plan.popular
              ? "rgba(255,255,255,0.2)"
              : isDark
              ? theme.colors.dark[4]
              : theme.colors.gray[3]
          }
        />

        {/* Features list */}
        <List
          spacing="xs"
          size="sm"
          icon={
            <ThemeIcon
              color={plan.popular ? "white" : theme.primaryColor}
              size={20}
              radius="xl"
              variant={plan.popular ? "filled" : "light"}
            >
              <IconCheck size={12} />
            </ThemeIcon>
          }
        >
          {plan.features.map((feature, idx) => (
            <List.Item key={idx}>
              <Text size="sm" c={textColor}>
                {feature}
              </Text>
            </List.Item>
          ))}
        </List>

        {/* CTA Button */}
        <Button
          size="lg"
          radius="md"
          fullWidth
          component={Link}
          to="/members/signup"
          variant={plan.popular ? "white" : "filled"}
          color={plan.popular ? "dark" : theme.primaryColor}
          style={{
            marginTop: 8,
            fontWeight: 600,
          }}
        >
          Get Started
        </Button>
      </Stack>
    </Card>
  );
};

export default PlanCard;
