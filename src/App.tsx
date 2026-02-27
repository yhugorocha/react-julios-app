import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import GlobalAlerts from "./components/GlobalAlerts";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import RoleGuard from "./components/RoleGuard";
import ThemeToggle from "./components/ThemeToggle";
import CategoriesPage from "./pages/CategoriesPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import SignupPage from "./pages/SignupPage";
import TransactionsPage from "./pages/TransactionsPage";
import UsersPage from "./pages/UsersPage";

function App() {
  return (
    <>
      <ThemeToggle />
      <GlobalAlerts />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/transactions" replace />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route
              path="/users"
              element={
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <UsersPage />
                </RoleGuard>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
