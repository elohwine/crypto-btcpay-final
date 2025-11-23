import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./api";
import { notify } from "../ui/notifications/notify";
import { loader } from "../ui/loading/loaderContext";

type User = { id: string; email: string; name?: string; role?: string } | null;

type AuthContextValue = {
  user: User;
  signin: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    name?: string,
    dateOfBirth?: string,
    phone?: string,
    referralCode?: string
  ) => Promise<void>;
  signout: () => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    // keep user in sync with localStorage if changed elsewhere
    const onStorage = () => {
      try {
        const raw = localStorage.getItem("user");
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) { }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persistTokens = (accessToken: string, u?: any) => {
    localStorage.setItem("accessToken", accessToken);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    setUser(u || JSON.parse(localStorage.getItem("user") || "null"));
  };

  const signin = async (email: string, password: string) => {
    loader.show("Signing in...");
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;
      if (data && data.accessToken) {
        persistTokens(data.accessToken, data.user);
        notify.success("Successfully signed in!");
      } else {
        throw new Error("Invalid login response");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Sign in failed";
      notify.error(msg);
      throw error;
    } finally {
      loader.hide();
    }
  };

  const signup = async (
    email: string,
    password: string,
    name?: string,
    dateOfBirth?: string,
    phone?: string,
    referralCode?: string
  ) => {
    loader.show("Signing up...");
    try {
      const res = await api.post("/auth/signup", {
        email,
        password,
        name,
        dateOfBirth,
        phone,
        referralCode,
      });
      const data = res.data;
      if (data && data.accessToken) {
        persistTokens(data.accessToken, data.user);
        notify.success("Account created successfully!");
      } else {
        throw new Error("Invalid signup response");
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Sign up failed";
      notify.error(msg);
      throw error;
    } finally {
      loader.hide();
    }
  };

  const signout = async () => {
    loader.show("Signing out...");
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      notify.info("Signed out successfully");
      // Redirect to landing page after logout so the user sees public home
      try {
        window.location.href = "/";
      } catch (e) {
        /* ignore */
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || error?.message || "Sign out failed";
      notify.error(msg);
    } finally {
      loader.hide();
    }
  };

  return (
    <AuthContext.Provider value={{ user, signin, signup, signout, logout: signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
