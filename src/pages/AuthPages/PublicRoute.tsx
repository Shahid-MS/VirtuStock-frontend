import { RootState } from "@/Store";
import { ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = useSelector((state: RootState) => state.auth.token);

  if (token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export default PublicRoute;
