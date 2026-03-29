import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = window.innerWidth <= 768;

  const menuItems = [
    { to: "/dashboard",    icon: "🏠", label: "Dashboard"   },
    { to: "/transactions", icon: "💰", label: "Transações"  },
    { to: "/bills",        icon: "📄", label: "Contas"      },
    { to: "/analytics",    icon: "📊", label: "Analytics"   },
    { to: "/products",     icon: "📦", label: "Produtos"    },
    { to: "/quotes",       icon: "🧾", label: "Orçamentos"  },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ══════════════════════════════
  // MOBILE — barra inferior + drawer
  // ══════════════════════════════
  if (isMobile) {
    return (
      <>
        {/* BOTÃO HAMBURGUER */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={hamburgerBtn}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        {/* OVERLAY */}
        {mobileOpen && (
          <div
            style={mobileOverlay}
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* DRAWER LATERAL */}
        <div style={{
          ...mobileDrawer,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)"
        }}>
          <div style={drawerHeader}>
            <span style={drawerTitle}>Finance</span>
            <button
              onClick={() => setMobileOpen(false)}
              style={drawerClose}
            >✕</button>
          </div>

          <div style={drawerMenu}>
            {menuItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  ...drawerItem,
                  background: isActive(item.to)
                    ? "rgba(59,130,246,0.2)"
                    : "transparent",
                  border: isActive(item.to)
                    ? "1px solid rgba(59,130,246,0.4)"
                    : "1px solid transparent",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={drawerItemLabel}>{item.label}</span>
              </Link>
            ))}
          </div>

          <button onClick={handleLogout} style={drawerLogout}>
            🚪 Sair
          </button>
        </div>
      </>
    );
  }

  // ══════════════════════════════
  // DESKTOP — sidebar retrátil original
  // ══════════════════════════════
  return (
    <div
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.4), inset 1px 0 0 rgba(255,255,255,0.06)",
        padding: "20px 10px",
        transition: "all 0.3s ease",
        overflow: "hidden",
        width: sidebarOpen ? "220px" : "70px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 100,
      }}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div>
        <h2 style={{
          opacity: sidebarOpen ? 1 : 0,
          transition: "0.3s",
          whiteSpace: "nowrap",
          marginBottom: "40px",
          fontWeight: "600",
          letterSpacing: "1px",
          color: "white",
        }}>
          Finance
        </h2>

        {menuItems.map(item => (
          <MenuItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            active={isActive(item.to)}
            sidebarOpen={sidebarOpen}
          />
        ))}
      </div>

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
            paddingTop: "15px",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          onClick={handleLogout}
        >
          <span style={link}>
            <span style={iconStyle}>🚪</span>
            <span style={{
              opacity: sidebarOpen ? 1 : 0,
              transition: "0.3s",
              whiteSpace: "nowrap",
              color: "#ef4444",
              fontWeight: 500,
            }}>
              Sair
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ to, icon, label, active, sidebarOpen }) {
  return (
    <div style={{
      padding: "12px",
      cursor: "pointer",
      borderRadius: "10px",
      transition: "all 0.2s ease",
      marginBottom: "10px",
      background: active ? "rgba(59,130,246,0.15)" : "transparent",
      border: active ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
      boxShadow: active ? "0 4px 16px rgba(59,130,246,0.15)" : "none",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; } }}
    >
      <Link to={to} style={link}>
        <span style={iconStyle}>{icon}</span>
        <span style={{ opacity: sidebarOpen ? 1 : 0, transition: "0.3s", whiteSpace: "nowrap" }}>
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
  textDecoration: "none", color: "white",
  display: "flex", alignItems: "center", gap: "12px", width: "100%",
};

const iconStyle = {
  fontSize: "18px", minWidth: "24px", textAlign: "center",
};

// Mobile
const hamburgerBtn = {
  position: "fixed",
  top: 16,
  left: 16,
  zIndex: 200,
  background: "rgba(15,23,42,0.9)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  color: "white",
  fontSize: 20,
  width: 44,
  height: 44,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mobileOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 150,
  backdropFilter: "blur(2px)",
};

const mobileDrawer = {
  position: "fixed",
  top: 0,
  left: 0,
  bottom: 0,
  width: 260,
  background: "rgba(10,15,30,0.97)",
  backdropFilter: "blur(20px)",
  borderRight: "1px solid rgba(255,255,255,0.08)",
  zIndex: 160,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease",
  boxShadow: "8px 0 32px rgba(0,0,0,0.5)",
};

const drawerHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 20px 16px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const drawerTitle = {
  fontSize: 18,
  fontWeight: 700,
  color: "white",
  letterSpacing: 1,
};

const drawerClose = {
  background: "rgba(255,255,255,0.08)",
  border: "none",
  color: "white",
  borderRadius: 8,
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 14,
};

const drawerMenu = {
  flex: 1,
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  overflowY: "auto",
};

const drawerItem = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 16px",
  borderRadius: 12,
  textDecoration: "none",
  color: "white",
  fontSize: 15,
  transition: "all 0.2s",
};

const drawerItemLabel = {
  fontWeight: 500,
};

const drawerLogout = {
  margin: "0 12px 24px",
  padding: "14px 16px",
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: 12,
  color: "#ef4444",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
};

export default Sidebar;