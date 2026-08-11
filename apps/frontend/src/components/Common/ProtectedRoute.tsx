import React from "react";
import { Navigate, useLocation } from "react-router-dom";

type Props = { children: React.ReactNode };

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (!token) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/members/signin?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  return children;
};

export default ProtectedRoute;
