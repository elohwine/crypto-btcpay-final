import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Badge,
  Button,
  Group,
  Text,
  Card,
  Stack,
  ActionIcon,
  Tooltip,
  TextInput,
  Select,
  Grid,
  Paper,
  Title,
  Box,
  Modal,
  Code,
  ScrollArea,
  Switch,
} from "@mantine/core";
import {
  IconDownload,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconDatabase,
  IconWebhook,
  IconFileExport,
  IconEye,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconUsers,
  IconChartBar,
  IconShieldCheck,
} from "@tabler/icons-react";
import api from "../../lib/api";
import { notify } from "../../ui/notifications/notify";
import TopLayout from "../../layouts/TopLayout";

const AdminScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | null>("stats");
  const [deposits, setDeposits] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModal, setDetailModal] = useState<any>(null);
  const [userDetailModal, setUserDetailModal] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (e: any) {
      notify.error(e?.response?.data?.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { take: 100 };
      if (searchQuery) params.search = searchQuery;
      const res = await api.get("/admin/users", { params });
      setUsers(res.data.users || []);
    } catch (e: any) {
      notify.error(e?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const params: any = { take: 200 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/admin/deposits", { params });
      setDeposits(res.data || []);
    } catch (e: any) {
      notify.error(e?.response?.data?.message || "Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/webhooks", { params: { take: 200 } });
      setWebhooks(res.data || []);
    } catch (e: any) {
      notify.error(e?.response?.data?.message || "Failed to fetch webhooks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "stats") fetchStats();
    else if (activeTab === "users") fetchUsers();
    else if (activeTab === "deposits") fetchDeposits();
    else if (activeTab === "webhooks") fetchWebhooks();
  }, [activeTab, statusFilter]);

  useEffect(() => {
    if (activeTab === "users") {
      const timer = setTimeout(() => fetchUsers(), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleExport = async (type: "deposits" | "webhooks") => {
    try {
      const endpoint =
        type === "deposits"
          ? "/admin/export/deposits.csv"
          : "/admin/export/webhooks.csv";
      const res = await api.get(endpoint, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      notify.success(`${type} exported successfully`);
    } catch (e: any) {
      notify.error(`Failed to export ${type}`);
    }
  };

  const handleReconcile = async (depositId: string) => {
    try {
      const res = await api.post(`/admin/deposits/${depositId}/reconcile`);
      if (res.data.ok) {
        notify.success("Deposit reconciled successfully");
        fetchDeposits();
      } else {
        notify.error(res.data.note || res.data.error || "Reconcile failed");
      }
    } catch (e: any) {
      notify.error(
        e?.response?.data?.message || "Failed to reconcile deposit"
      );
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/admin`, {
        isAdmin: !currentStatus,
      });
      notify.success(`Admin status updated`);
      fetchUsers();
    } catch (e: any) {
      notify.error(e?.response?.data?.message || "Failed to update admin status");
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const res = await api.get(`/admin/users/${userId}`);
      setUserDetailModal(res.data);
    } catch (e: any) {
      notify.error("Failed to fetch user details");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; label: string; icon: any }
    > = {
      CONFIRMED: { color: "green", label: "Confirmed", icon: IconCheck },
      PENDING: { color: "yellow", label: "Pending", icon: IconClock },
      FAILED: { color: "red", label: "Failed", icon: IconAlertCircle },
    };
    const s = statusMap[status] || {
      color: "gray",
      label: status,
      icon: IconClock,
    };
    const Icon = s.icon;
    return (
      <Badge
        color={s.color}
        variant="light"
        leftSection={<Icon size={12} />}
        style={{ textTransform: "uppercase" }}
      >
        {s.label}
      </Badge>
    );
  };

  const filteredDeposits = deposits.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.depositId?.toLowerCase().includes(q) ||
      d.invoiceId?.toLowerCase().includes(q) ||
      d.userId?.toLowerCase().includes(q) ||
      d.walletAddress?.toLowerCase().includes(q) ||
      d.txHash?.toLowerCase().includes(q)
    );
  });

  const filteredWebhooks = webhooks.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      w.eventId?.toLowerCase().includes(q) ||
      JSON.stringify(w.payload || {})
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <TopLayout>
      <Box style={{ padding: "24px 32px", minHeight: "100vh" }}>
        {/* Header */}
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2} style={{ marginBottom: 8 }}>
              Admin Dashboard
            </Title>
            <Text size="sm" c="dimmed">
              Manage users, deposits, webhooks, and system configuration
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={() => {
                if (activeTab === "stats") fetchStats();
                else if (activeTab === "users") fetchUsers();
                else if (activeTab === "deposits") fetchDeposits();
                else fetchWebhooks();
              }}
              loading={loading}
            >
              Refresh
            </Button>
          </Group>
        </Group>

        {/* Main Content */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="stats" leftSection={<IconChartBar size={16} />}>
                Statistics
              </Tabs.Tab>
              <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
                Users
              </Tabs.Tab>
              <Tabs.Tab value="deposits" leftSection={<IconDatabase size={16} />}>
                Deposits
              </Tabs.Tab>
              <Tabs.Tab value="webhooks" leftSection={<IconWebhook size={16} />}>
                Webhooks
              </Tabs.Tab>
            </Tabs.List>

            {/* Statistics Tab */}
            <Tabs.Panel value="stats" pt="md">
              {stats && (
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Total Users
                          </Text>
                          <Text size="xl" fw={700}>
                            {stats.totalUsers}
                          </Text>
                        </div>
                        <ActionIcon size={48} radius="md" variant="light" color="blue">
                          <IconUsers size={24} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Total Deposits
                          </Text>
                          <Text size="xl" fw={700}>
                            {stats.totalDeposits}
                          </Text>
                        </div>
                        <ActionIcon size={48} radius="md" variant="light" color="cyan">
                          <IconDatabase size={24} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Confirmed
                          </Text>
                          <Text size="xl" fw={700} c="green">
                            {stats.confirmedDeposits}
                          </Text>
                        </div>
                        <ActionIcon size={48} radius="md" variant="light" color="green">
                          <IconCheck size={24} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Pending
                          </Text>
                          <Text size="xl" fw={700} c="yellow">
                            {stats.pendingDeposits}
                          </Text>
                        </div>
                        <ActionIcon size={48} radius="md" variant="light" color="yellow">
                          <IconClock size={24} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Webhooks
                          </Text>
                          <Text size="xl" fw={700}>
                            {stats.totalWebhooks}
                          </Text>
                        </div>
                        <ActionIcon size={48} radius="md" variant="light" color="grape">
                          <IconWebhook size={24} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <Paper p="md" radius="md" withBorder>
                      <Group justify="space-between">
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Total Volume
                          </Text>
                          <Text size="xl" fw={700} c="green">
                            ${stats.totalDepositAmount.toFixed(2)}
                          </Text>
                        </div>
                        <ActionIcon size={48} radius="md" variant="light" color="teal">
                          <IconChartBar size={24} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </Grid.Col>
                </Grid>
              )}
            </Tabs.Panel>

            {/* Users Tab */}
            <Tabs.Panel value="users" pt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <TextInput
                    placeholder="Search users by email, name, or ID..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ width: 400 }}
                  />
                </Group>

                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Admin</Table.Th>
                        <Table.Th>Deposits</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {users.map((user) => (
                        <Table.Tr key={user.id}>
                          <Table.Td>
                            <Text size="sm">{user.email}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{user.name || "-"}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Switch
                              checked={user.isAdmin}
                              onChange={() =>
                                handleToggleAdmin(user.id, user.isAdmin)
                              }
                              color="green"
                              size="sm"
                            />
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="light">
                              {user._count?.deposits || 0}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label="View details">
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => handleViewUser(user.id)}
                              >
                                <IconEye size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  {users.length === 0 && (
                    <Text
                      size="sm"
                      c="dimmed"
                      ta="center"
                      py="xl"
                      style={{ width: "100%" }}
                    >
                      No users found
                    </Text>
                  )}
                </ScrollArea>
              </Stack>
            </Tabs.Panel>

            {/* Deposits Tab */}
            <Tabs.Panel value="deposits" pt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Group>
                    <TextInput
                      placeholder="Search deposits..."
                      leftSection={<IconSearch size={16} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.currentTarget.value)}
                      style={{ width: 300 }}
                    />
                    <Select
                      placeholder="Filter by status"
                      leftSection={<IconFilter size={16} />}
                      data={[
                        { value: "", label: "All" },
                        { value: "CONFIRMED", label: "Confirmed" },
                        { value: "PENDING", label: "Pending" },
                        { value: "FAILED", label: "Failed" },
                      ]}
                      value={statusFilter || ""}
                      onChange={(v) => setStatusFilter(v || null)}
                      clearable
                      style={{ width: 200 }}
                    />
                  </Group>
                  <Button
                    variant="outline"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExport("deposits")}
                  >
                    Export CSV
                  </Button>
                </Group>

                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Deposit ID</Table.Th>
                        <Table.Th>Invoice ID</Table.Th>
                        <Table.Th>User ID</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Wallet</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredDeposits.map((dep) => (
                        <Table.Tr key={dep.depositId}>
                          <Table.Td>
                            <Code style={{ fontSize: 11 }}>
                              {dep.depositId.slice(0, 8)}...
                            </Code>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label={dep.invoiceId}>
                              <Code style={{ fontSize: 11 }}>
                                {dep.invoiceId?.startsWith("local-fallback-")
                                  ? "local"
                                  : dep.invoiceId?.slice(0, 8) || "-"}
                              </Code>
                            </Tooltip>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{dep.userId}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm" fw={600}>
                              {dep.amount} {dep.currency}
                            </Text>
                          </Table.Td>
                          <Table.Td>{getStatusBadge(dep.status)}</Table.Td>
                          <Table.Td>
                            <Tooltip label={dep.walletAddress}>
                              <Code style={{ fontSize: 11 }}>
                                {dep.walletAddress
                                  ? `${dep.walletAddress.slice(
                                    0,
                                    6
                                  )}...${dep.walletAddress.slice(-4)}`
                                  : "-"}
                              </Code>
                            </Tooltip>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {new Date(dep.createdAt).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4}>
                              <Tooltip label="View details">
                                <ActionIcon
                                  variant="light"
                                  size="sm"
                                  onClick={() => setDetailModal(dep)}
                                >
                                  <IconEye size={14} />
                                </ActionIcon>
                              </Tooltip>
                              {dep.invoiceId?.startsWith("local-fallback-") && (
                                <Tooltip label="Reconcile">
                                  <ActionIcon
                                    variant="light"
                                    color="blue"
                                    size="sm"
                                    onClick={() =>
                                      handleReconcile(dep.depositId)
                                    }
                                  >
                                    <IconRefresh size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  {filteredDeposits.length === 0 && (
                    <Text
                      size="sm"
                      c="dimmed"
                      ta="center"
                      py="xl"
                      style={{ width: "100%" }}
                    >
                      No deposits found
                    </Text>
                  )}
                </ScrollArea>
              </Stack>
            </Tabs.Panel>

            {/* Webhooks Tab */}
            <Tabs.Panel value="webhooks" pt="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <TextInput
                    placeholder="Search webhooks..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ width: 300 }}
                  />
                  <Button
                    variant="outline"
                    leftSection={<IconFileExport size={16} />}
                    onClick={() => handleExport("webhooks")}
                  >
                    Export CSV
                  </Button>
                </Group>

                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>ID</Table.Th>
                        <Table.Th>Event ID</Table.Th>
                        <Table.Th>Processed</Table.Th>
                        <Table.Th>Created</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredWebhooks.map((wh) => (
                        <Table.Tr key={wh.id}>
                          <Table.Td>
                            <Code style={{ fontSize: 11 }}>{wh.id}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label={wh.eventId}>
                              <Code style={{ fontSize: 11 }}>
                                {wh.eventId?.slice(0, 12) || "-"}
                              </Code>
                            </Tooltip>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={wh.processed ? "green" : "gray"}
                              variant="light"
                            >
                              {wh.processed ? "Yes" : "No"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="dimmed">
                              {new Date(wh.createdAt).toLocaleDateString()}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label="View payload">
                              <ActionIcon
                                variant="light"
                                size="sm"
                                onClick={() => setDetailModal(wh)}
                              >
                                <IconEye size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  {filteredWebhooks.length === 0 && (
                    <Text
                      size="sm"
                      c="dimmed"
                      ta="center"
                      py="xl"
                      style={{ width: "100%" }}
                    >
                      No webhooks found
                    </Text>
                  )}
                </ScrollArea>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>

        {/* Detail Modal */}
        <Modal
          opened={!!detailModal}
          onClose={() => setDetailModal(null)}
          title={
            detailModal?.depositId
              ? `Deposit: ${detailModal.depositId.slice(0, 12)}...`
              : `Webhook: ${detailModal?.eventId?.slice(0, 12) || ""}`
          }
          size="lg"
        >
          {detailModal && (
            <ScrollArea style={{ maxHeight: 500 }}>
              <Code block>{JSON.stringify(detailModal, null, 2)}</Code>
            </ScrollArea>
          )}
        </Modal>

        {/* User Detail Modal */}
        <Modal
          opened={!!userDetailModal}
          onClose={() => setUserDetailModal(null)}
          title={`User: ${userDetailModal?.email || ""}`}
          size="lg"
        >
          {userDetailModal && (
            <Stack gap="md">
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Email
                  </Text>
                  <Text fw={500}>{userDetailModal.email}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Name
                  </Text>
                  <Text fw={500}>{userDetailModal.name || "-"}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Admin
                  </Text>
                  <Badge color={userDetailModal.isAdmin ? "green" : "gray"}>
                    {userDetailModal.isAdmin ? "Yes" : "No"}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Referral Code
                  </Text>
                  <Code>{userDetailModal.referralCode}</Code>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="sm" c="dimmed" mb="xs">
                    Recent Deposits
                  </Text>
                  {userDetailModal.deposits?.length > 0 ? (
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Amount</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>Date</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {userDetailModal.deposits.map((dep: any) => (
                          <Table.Tr key={dep.id}>
                            <Table.Td>
                              {dep.amount} {dep.currency}
                            </Table.Td>
                            <Table.Td>{getStatusBadge(dep.status)}</Table.Td>
                            <Table.Td>
                              {new Date(dep.createdAt).toLocaleDateString()}
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  ) : (
                    <Text size="sm" c="dimmed">
                      No deposits
                    </Text>
                  )}
                </Grid.Col>
              </Grid>
            </Stack>
          )}
        </Modal>
      </Box>
    </TopLayout>
  );
};

export default AdminScreen;
