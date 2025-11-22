import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Title, Text, Button, Group, Center, ThemeIcon } from "@mantine/core";
import { IconError404, IconArrowLeft, IconHome } from "@tabler/icons-react";

const NotFoundScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="full-height" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Center>
        <ThemeIcon size={120} radius="xl" variant="light" color="gray" style={{ marginBottom: 32 }}>
          <IconError404 size={80} />
        </ThemeIcon>
      </Center>

      <Title order={1} style={{ fontSize: 48, marginBottom: 16, textAlign: 'center' }}>
        Page Not Found
      </Title>

      <Text c="dimmed" size="lg" ta="center" maw={500} mb={32}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Text>

      <Group>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          variant="default"
          size="md"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>

        <Button
          component={Link}
          to="/"
          leftSection={<IconHome size={18} />}
          variant="filled"
          color="blue"
          size="md"
        >
          Home Page
        </Button>
      </Group>
    </Container>
  );
};

export default NotFoundScreen;
