import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import { JSX } from "react";
import { RootState } from "@/Store";
import AccessDenied from "@/pages/OtherPage/AccessDenied";
import Loading from "@/pages/OtherPage/Loading";

interface Props {
  children: JSX.Element;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: Props) {
  const { isAuthenticated, roles, authInitialized } = useSelector(
    (state: RootState) => state.auth
  );
  if (!authInitialized) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRoles && !requiredRoles.some((r) => roles.includes(r))) {
    return <AccessDenied />;
  }

  return children;
}
