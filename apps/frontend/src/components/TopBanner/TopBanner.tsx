import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Text, Group, ThemeIcon, Box } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';
import { useAuth } from '../../lib/auth';

const TopBanner: React.FC = () => {
    const { user } = useAuth();
    const [totalVolume, setTotalVolume] = useState<number | null>(null);

    useEffect(() => {
        // Only fetch if user is admin
        if (!user?.isAdmin) return;

        const fetchStats = async () => {
            try {
                const res = await api.get('/stats/public');
                setTotalVolume(res.data.totalVolume);
            } catch (error) {
                console.error('Failed to fetch public stats', error);
            }
        };

        fetchStats();
        // Refresh every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, [user?.isAdmin]);

    // Don't render anything if not admin or no data
    if (!user?.isAdmin || totalVolume === null) return null;

    return (
        <Box
            style={{
                backgroundColor: '#1A1B1E', // Dark background matching theme
                borderBottom: '1px solid #2C2E33',
                padding: '8px 16px',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}
        >
            <Group justify="center" gap="xs">
                <ThemeIcon variant="light" color="green" size="sm" radius="xl">
                    <IconTrendingUp size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500} c="dimmed">
                    Total Platform Deposits:
                </Text>
                <Text size="sm" fw={700} c="green.4">
                    ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text size="xs" c="dimmed" style={{ marginLeft: 4 }}>
                    (Live Tron Network)
                </Text>
            </Group>
        </Box>
    );
};

export default TopBanner;
