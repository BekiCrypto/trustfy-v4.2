import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthContext } from "../context/AuthContext"

interface ProtectedRouteProps {
  roles?: ("USER" | "ARBITRATOR" | "ADMIN")[]
}

export const ProtectedRoute = ({
  roles,
  children,
}: PropsWithChildren<ProtectedRouteProps>) => {
  const { session } = useAuthContext()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (roles && !roles.some((role) => session.roles.includes(role))) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
