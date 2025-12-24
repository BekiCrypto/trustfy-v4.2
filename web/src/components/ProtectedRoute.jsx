import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuthContext } from "@/context/AuthContext"

export default function ProtectedRoute({ roles, children }) {
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
