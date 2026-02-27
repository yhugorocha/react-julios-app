import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useFeedbackStore } from "../store/feedbackStore";
import assets from "../assets/assets";
  
function AppShell() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.role);
  const clearSession = useAuthStore((state) => state.clearSession);
  const pushSuccess = useFeedbackStore((state) => state.pushSuccess);

  const handleLogout = () => {
    clearSession();
    pushSuccess("Sessão encerrada.");
    navigate("/login", { replace: true });
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-content">
          <NavLink to="/transactions" className="brand">
            <img src={assets.logo} alt="Logo" width={100} height={100}/> 
          </NavLink>

          <nav className="main-nav">
            <NavLink
              to="/transactions"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Transações
            </NavLink>
            <NavLink
              to="/categories"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Categorias
            </NavLink>
            {role === "ADMIN" && (
              <NavLink
                to="/users"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Usuários
              </NavLink>
            )}
          </nav>

          <div className="topbar-actions">
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© 2026 — Desenvolvido por <strong>Hugo Silva</strong></p>
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
