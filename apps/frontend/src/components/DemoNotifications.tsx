import React from 'react';
import { Button, Group } from '@mantine/core';
import { notify } from '../ui/notifications/notify';
import { useLoader } from '../ui/loading/loaderContext';
import { useProgress } from '../ui/progress/ProgressOverlay';

export const DemoNotifications: React.FC = () => {
  const { show: showLoader, hide: hideLoader } = useLoader();
  const { start, update, complete } = useProgress();

  const handleSuccess = () => notify.success('Operation completed successfully!');
  const handleError = () => notify.error('Something went wrong!');
  const handleWarn = () => notify.warn('This is a warning message.');
  const handleInfo = () => notify.info('This is an info message.');

  const handleLoader = () => {
    showLoader('Simulating loading...');
    setTimeout(() => hideLoader(), 3000);
  };

  const handleProgress = () => {
    const id = start('demo', 'Processing...');
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      update(id, p);
      if (p >= 100) {
        clearInterval(interval);
        complete(id);
        notify.success('Progress completed!');
      }
    }, 500);
  };

  return (
    <Group>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
      <Button onClick={handleWarn}>Show Warning</Button>
      <Button onClick={handleInfo}>Show Info</Button>
      <Button onClick={handleLoader}>Show Loader</Button>
      <Button onClick={handleProgress}>Show Progress</Button>
    </Group>
  );
};