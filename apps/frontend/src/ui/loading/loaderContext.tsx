import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { FullScreenLoader } from "./FullScreenLoader";

interface LoaderContextValue {
  show: (message?: string, onCancel?: () => void) => void;
  hide: () => void;
}

const LoaderContext = createContext<LoaderContextValue | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // stacking count for concurrent show/hide calls
  const countRef = useRef(0);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [onCancel, setOnCancel] = useState<(() => void) | undefined>();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1);
    if (countRef.current === 0) {
      // clear any pending show timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      setVisible(false);
      setMessage("");
      setOnCancel(undefined);
    }
  }, []);

  const show = useCallback((msg?: string, cancel?: () => void) => {
    countRef.current += 1;
    setMessage(msg || "Loading...");
    setOnCancel(() => cancel);
    // Debounce the visible flag to avoid flicker (200ms)
    if (debounceTimer.current) {
      // already scheduled
      return;
    }
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null;
      setVisible(true);
      // Timeout fallback: auto-hide after 30s and notify error
      setTimeout(() => {
        if (countRef.current > 0) {
          hide();
          // Assuming notify is available; in real code, import it
          // notify.error('Operation timed out');
        }
      }, 30000);
    }, 200);
  }, [hide]);

  // Register global imperative bridge so non-React modules (axios) can call loader.show/hide
  useEffect(() => {
    globalLoaderBridge.show = (m?: string, c?: () => void) => show(m, c);
    globalLoaderBridge.hide = () => hide();
    return () => {
      globalLoaderBridge.show = undefined;
      globalLoaderBridge.hide = undefined;
    };
  }, [show, hide]);

  return (
    <LoaderContext.Provider value={{ show, hide }}>
      <FullScreenLoader
        visible={visible}
        message={message}
        onCancel={onCancel}
      />
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useLoader must be used within LoaderProvider");
  return ctx;
};

// Global loader for non-React code
// Imperative global bridge object. The provider registers handlers on mount.
const globalLoaderBridge: {
  show?: (message?: string, onCancel?: () => void) => void;
  hide?: () => void;
} = {};

export const loader = {
  show: (message?: string, onCancel?: () => void) => {
    try {
      if (globalLoaderBridge.show) globalLoaderBridge.show(message, onCancel);
    } catch (e) {}
  },
  hide: () => {
    try {
      if (globalLoaderBridge.hide) globalLoaderBridge.hide();
    } catch (e) {}
  },
};
