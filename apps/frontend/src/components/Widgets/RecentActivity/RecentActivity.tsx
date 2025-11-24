import { useState, useEffect } from "react";
import { useAppTheme } from "../../../lib/themeUtils";
import api from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import { Loader, Center, Text } from "@mantine/core";

// components
import Box from "../../Common/Box";
import RecentActivityRow from "./RecentActivityRow";

// interfaces
interface IActivity {
  id: number;
  type: number; // 1: Deposit, 2: Withdrawal
  time: string;
  amount: string;
  status: number; // 1: Completed, 2: Pending, 3: Failed
  currency: string;
}

const RecentActivity: React.FC = () => {
  const [data, setData] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { primary } = useAppTheme();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const res = await api.get('/deposits/me');

        if (res.data && Array.isArray(res.data)) {
          const mappedData: IActivity[] = res.data.map((item: any, index: number) => ({
            id: index + 1,
            type: item.amount > 0 ? 1 : 2,
            time: new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: Math.abs(item.amount).toFixed(2),
            status: item.status === 'CONFIRMED' ? 1 : item.status === 'PENDING' ? 2 : 3,
            currency: item.currency || 'USDT'
          })).slice(0, 10); // Show last 10 items

          setData(mappedData);
        }
      } catch (error) {
        console.error("Failed to fetch activity", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <Box>
      <div className="box-title box-vertical-padding box-horizontal-padding no-select">
        <div className="flex flex-center flex-space-between">
          <div>
            <p>Recent Activity</p>
          </div>
        </div>
      </div>
      <div className="box-content">
        {loading ? (
          <Center p="xl">
            <Loader size="sm" />
          </Center>
        ) : data.length > 0 ? (
          data.map((item: IActivity) => (
            <RecentActivityRow key={item.id.toString()} item={item} />
          ))
        ) : (
          <Center p="xl">
            <Text c="dimmed" size="sm">No recent activity</Text>
          </Center>
        )}
      </div>
    </Box>
  );
};

export default RecentActivity;
