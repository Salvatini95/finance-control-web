import { Link, useLocation } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "linear-gradient(180deg, #020617, #020617 60%, #020617)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        padding: "20px 10px",
        transition: "all 0.3s ease",
        overflow: "hidden",
        width: sidebarOpen ? "220px" : "70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >

      {/* LOGO */}
      <div>

        <h2
          style={{
            opacity: sidebarOpen ? 1 : 0,
            transition: "0.3s",
            whiteSpace: "nowrap",
            marginBottom: "40px",
            fontWeight: "600",
            letterSpacing: "1px"
          }}
        >
          Finance
        </h2>

        {/* DASHBOARD */}
        <MenuItem
          to="/dashboard"
          icon="🏠"
          label="Dashboard"
          active={isActive("/dashboard")}
          sidebarOpen={sidebarOpen}
        />

        {/* TRANSAÇÕES — agora é rota real */}
        <MenuItem
          to="/transactions"
          icon="💰"
          label="Transações"
          active={isActive("/transactions")}
          sidebarOpen={sidebarOpen}
        />

        {/* ANALYTICS */}
        <MenuItem
          to="/analytics"
          icon="📊"
          label="Analytics"
          active={isActive("/analytics")}
          sidebarOpen={sidebarOpen}
        />

      </div>

      {/* RODAPÉ — SAIR */}
      <div>
        <div
          style={{
            padding: "12px",
            cursor: "pointer",
            borderRadius: "10px",
            transition: "all 0.2s ease",
            marginBottom: "10px",
            marginTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "15px"
          }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          <span style={link}>
            <span style={iconStyle}>🚪</span>
            <span style={{
              opacity: sidebarOpen ? 1 : 0,
              transition: "0.3s",
              whiteSpace: "nowrap"
            }}>
              Sair
            </span>
          </span>
        </div>
      </div>

    </div>
  );
}


// =========================
// COMPONENTE ITEM
// =========================

function MenuItem({ to, icon, label, active, sidebarOpen }) {
  return (
    <div
      style={{
        padding: "12px",
        cursor: "pointer",
        borderRadius: "10px",
        transition: "all 0.2s ease",
        marginBottom: "10px",
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent"
      }}
    >
      <Link to={to} style={link}>
        <span style={iconStyle}>{icon}</span>
        <span style={{
          opacity: sidebarOpen ? 1 : 0,
          transition: "0.3s",
          whiteSpace: "nowrap"
        }}>
          {label}
        </span>
      </Link>
    </div>
  );
}


// =========================
// ESTILOS
// =========================

const link = {
  textDecoration: "none",
  color: "white",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  width: "100%"
};

const iconStyle = {
  fontSize: "18px",
  minWidth: "24px",
  textAlign: "center"
};

export default Sidebar;