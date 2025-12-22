import { Route, Routes } from "react-router-dom"
import { Layout } from "./components/Layout"
import { LandingPage } from "./pages/LandingPage"
import { ExplorePage } from "./pages/ExplorePage"
import { DashboardPage } from "./pages/DashboardPage"
import { MyEscrowsPage } from "./pages/MyEscrowsPage"
import { CreateEscrowPage } from "./pages/CreateEscrowPage"
import { EscrowDetailPage } from "./pages/EscrowDetailPage"
import { ArbitratorDisputesPage } from "./pages/ArbitratorDisputesPage"
import { ArbitratorDisputeDetailPage } from "./pages/ArbitratorDisputeDetailPage"
import { AdminDashboardPage } from "./pages/AdminDashboardPage"
import { AdminPoolsPage } from "./pages/AdminPoolsPage"
import { AdminRolesPage } from "./pages/AdminRolesPage"
import { AdminTokensPage } from "./pages/AdminTokensPage"
import { NotificationPreferencesPage } from "./pages/NotificationPreferencesPage"
import { TermsPage } from "./pages/TermsPage"
import { PrivacyPage } from "./pages/PrivacyPage"
import { FaqPage } from "./pages/FaqPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { ProtectedRoute } from "./components/ProtectedRoute"

export const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route
          path="app/dashboard"
          element={
            <ProtectedRoute roles={["USER", "ARBITRATOR", "ADMIN"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="app/escrows"
          element={
            <ProtectedRoute roles={["USER", "ARBITRATOR", "ADMIN"]}>
              <MyEscrowsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="app/create"
          element={
            <ProtectedRoute roles={["USER", "ARBITRATOR", "ADMIN"]}>
              <CreateEscrowPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="app/escrows/:escrowId"
          element={
            <ProtectedRoute roles={["USER", "ARBITRATOR", "ADMIN"]}>
              <EscrowDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="arbitrator/disputes"
          element={
            <ProtectedRoute roles={["ARBITRATOR", "ADMIN"]}>
              <ArbitratorDisputesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="arbitrator/disputes/:escrowId"
          element={
            <ProtectedRoute roles={["ARBITRATOR", "ADMIN"]}>
              <ArbitratorDisputeDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/pools"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminPoolsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/roles"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminRolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/tokens"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminTokensPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="app/notifications"
          element={
            <ProtectedRoute roles={["USER", "ARBITRATOR", "ADMIN"]}>
              <NotificationPreferencesPage />
            </ProtectedRoute>
          }
        />
        <Route path="legal/terms" element={<TermsPage />} />
        <Route path="legal/privacy" element={<PrivacyPage />} />
        <Route path="legal/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
