import React from 'react';
import { Box, useMantineTheme, useMantineColorScheme } from '@mantine/core';

const TypingIndicator: React.FC = () => {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box
      style={{
        display: 'flex',
        gap: 4,
        padding: '12px 16px',
        background: colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
        borderRadius: 16,
        maxWidth: 'fit-content',
      }}
    >
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: theme.colors.gray[5],
            animation: `typing 1.4s infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
};

export default TypingIndicator;
