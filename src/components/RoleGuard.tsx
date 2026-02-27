import type { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { Role } from "../types/auth";

interface RoleGuardProps extends PropsWithChildren {
  allowedRoles: Role[];
}

function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/transactions" replace />;
  }

  return children;
}

export default RoleGuard;

