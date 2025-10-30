import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconX,
  IconInfoCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";

export interface NotifyOptions {
  title?: string;
  message: string;
  autoClose?: number;
  onClose?: () => void;
  onOpen?: () => void;
  id?: string;
}

const dedupeMap = new Map<string, number>();

const notify = {
  success: (message: string, opts?: Omit<NotifyOptions, "message">) => {
    const key = opts?.id || message;
    if (dedupeMap.has(key)) return;
    dedupeMap.set(key, Date.now());
    setTimeout(() => dedupeMap.delete(key), 1000); // dedupe for 1s

    notifications.show({
      id: key,
      title: opts?.title || "Success",
      message,
      color: "teal",
      icon: <IconCheck size={18} />,
      autoClose: opts?.autoClose ?? 7000,
      onClose: opts?.onClose,
      onOpen: opts?.onOpen,
    });
  },

  warn: (message: string, opts?: Omit<NotifyOptions, "message">) => {
    const key = opts?.id || message;
    if (dedupeMap.has(key)) return;
    dedupeMap.set(key, Date.now());
    setTimeout(() => dedupeMap.delete(key), 1000);

    notifications.show({
      id: key,
      title: opts?.title || "Warning",
      message,
      color: "orange",
      icon: <IconAlertTriangle size={18} />,
      autoClose: opts?.autoClose ?? 7000,
      onClose: opts?.onClose,
      onOpen: opts?.onOpen,
    });
  },

  error: (message: string, opts?: Omit<NotifyOptions, "message">) => {
    const key = opts?.id || message;
    if (dedupeMap.has(key)) return;
    dedupeMap.set(key, Date.now());
    setTimeout(() => dedupeMap.delete(key), 1000);

    notifications.show({
      id: key,
      title: opts?.title || "Error",
      message,
      color: "red",
      icon: <IconX size={18} />,
      autoClose: opts?.autoClose ?? 7000,
      onClose: opts?.onClose,
      onOpen: opts?.onOpen,
    });
  },

  info: (message: string, opts?: Omit<NotifyOptions, "message">) => {
    const key = opts?.id || message;
    if (dedupeMap.has(key)) return;
    dedupeMap.set(key, Date.now());
    setTimeout(() => dedupeMap.delete(key), 1000);

    notifications.show({
      id: key,
      title: opts?.title || "Info",
      message,
      color: "blue",
      icon: <IconInfoCircle size={18} />,
      autoClose: opts?.autoClose ?? 7000,
      onClose: opts?.onClose,
      onOpen: opts?.onOpen,
    });
  },

  showProgress: (id: string, initial = 0) => {
    notifications.show({
      id,
      title: "Processing",
      message: `${initial}%`,
      loading: true,
      autoClose: false,
    });
  },

  updateProgress: (id: string, percent: number) => {
    notifications.update({
      id,
      message: `${Math.round(percent)}%`,
    });
  },

  completeProgress: (id: string, success = true) => {
    notifications.update({
      id,
      loading: false,
      title: success ? "Done" : "Failed",
      message: success ? "Finished" : "Operation failed",
      color: success ? "teal" : "red",
      icon: success ? <IconCheck size={18} /> : <IconX size={18} />,
      autoClose: 3000,
    });
  },
};

export { notify };
