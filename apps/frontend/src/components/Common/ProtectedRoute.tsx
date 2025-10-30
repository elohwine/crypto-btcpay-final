import React from "react";
import { Navigate } from "react-router-dom";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
