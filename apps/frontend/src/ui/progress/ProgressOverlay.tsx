import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Overlay, Paper, Progress, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';

type ProgressSession = {
  id: string;
  percent: number;
  message?: string;
};

// Module-level store so non-React callers can use progress.start/update/complete
const store: { sessions: ProgressSession[] } = { sessions: [] };
const subs: Array<() => void> = [];

function notifySubs() {
  subs.forEach((s) => {
    try {
      s();
    } catch (e) {}
  });
}

export const progress = {
  start: (id: string, message?: string) => {
    store.sessions.push({ id, percent: 0, message });
    notifySubs();
    return id;
  },
  update: (id: string, percent: number) => {
    store.sessions = store.sessions.map((s) => (s.id === id ? { ...s, percent } : s));
    notifySubs();
  },
  complete: (id: string) => {
    store.sessions = store.sessions.filter((s) => s.id !== id);
    notifySubs();
  },
  _subscribe: (fn: () => void) => {
    subs.push(fn);
    return () => {
      const i = subs.indexOf(fn);
      if (i >= 0) subs.splice(i, 1);
    };
  },
  _getSessions: () => store.sessions,
};

export const useProgress = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = progress._subscribe(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const start = useCallback((id: string, message?: string) => progress.start(id, message), []);
  const update = useCallback((id: string, percent: number) => progress.update(id, percent), []);
  const complete = useCallback((id: string) => progress.complete(id), []);
  const sessions = useMemo(() => progress._getSessions(), [/* tick triggers update */]);

  return { start, update, complete, sessions } as const;
};

export const ProgressOverlay: React.FC = () => {
  const { sessions } = useProgress();
  const [debounced] = useDebouncedValue(sessions, 100);

  if (!debounced || debounced.length === 0) return null;

  const active = debounced[debounced.length - 1];

  return (
    <Overlay
      opacity={0.6}
      blur={3}
      zIndex={1200}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Paper
          shadow="md"
          p="xl"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            minWidth: '300px',
          }}
        >
          <Text size="sm">{active.message || 'Processing...'}</Text>
          <div role="progressbar" aria-label="Upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={active.percent}>
            <Progress value={active.percent} style={{ width: '100%' }} />
          </div>
          <Text size="xs" color="dimmed">{Math.round(active.percent)}%</Text>
        </Paper>
      </div>
    </Overlay>
  );
};