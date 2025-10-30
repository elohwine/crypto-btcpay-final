import React from "react";
import { Loader, Overlay, Paper, Text, FocusTrap } from "@mantine/core";

interface FullScreenLoaderProps {
  visible: boolean;
  message?: string;
  onCancel?: () => void;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  visible,
  message,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <FocusTrap active={visible}>
      <div role="status" aria-live="polite" aria-label="Loading">
        <Overlay
          opacity={0.6}
          blur={3}
          zIndex={5000}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Paper
              shadow="md"
              p="xl"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                minWidth: "200px",
              }}
            >
              <Loader size="xl" />
              {message && (
                <Text size="sm" color="dimmed">
                  {message}
                </Text>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  style={{
                    background: "transparent",
                    border: `1px solid var(--surface-border, #ccc)`,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              )}
            </Paper>
          </div>
        </Overlay>
      </div>
    </FocusTrap>
  );
};
