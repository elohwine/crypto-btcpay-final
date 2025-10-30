import React from "react";
import { ActionIcon } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useMantineColorScheme } from "../../lib/themeUtils";

const ThemeSwitch: React.FC = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <ActionIcon
      variant="default"
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
      style={{ marginRight: 8 }}
    >
      {colorScheme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
    </ActionIcon>
  );
};

export default ThemeSwitch;
