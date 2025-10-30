import { MantineThemeOverride } from "@mantine/core";

export const mantineTheme: MantineThemeOverride = {
  primaryColor: "blue",
  fontFamily:
    "Inter, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  defaultRadius: "md",
  headings: {
    fontFamily:
      "Inter, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  },
  components: {
    Button: {
      defaultProps: { fw: 500 },
    },
  },
};

export default mantineTheme;
