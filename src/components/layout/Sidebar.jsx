import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { logoutUser } from "../../services/api";

// ─── Persistência do estilo ───────────────────────────────────────────────────
const SIDEBAR_STYLE_KEY = "sv_sidebar_style";
export function getSidebarStyle() {
  return localStorage.getItem(SIDEBAR_STYLE_KEY) || "vertical";
}
export function setSidebarStyleLS(s) {
  localStorage.setItem(SIDEBAR_STYLE_KEY, s);
}

// ─── Menu items ───────────────────────────────────────────────────────────────
function useMenuItems() {
  const role        = localStorage.getItem("role")         || "viewer";
  const accountType = localStorage.getItem("account_type") || "business";
  const isPersonal  = accountType === "personal";

  const all = isPersonal ? [
    { to:"/dashboard",    icon:"🏠", label:"Dashboard"         },
    { to:"/transactions", icon:"💰", label:"Transações"        },
    { to:"/bills",        icon:"📄", label:"Contas"            },
    { to:"/analytics",   icon:"📊", label:"Analytics"         },
    { to:"/goals",        icon:"🎯", label:"Metas"             },
    { to:"/settings",     icon:"⚙️", label:"Configurações"     },
  ] : [
    { to:"/dashboard",     icon:"🏠", label:"Dashboard",                        roles:null },
    { to:"/clients",       icon:"👥", label:"Clientes",                          roles:null },
    { to:"/transactions",  icon:"💰", label:"Transações",                        roles:["admin","financial"] },
    { to:"/bills",         icon:"📄", label:"Contas",                            roles:["admin","financial"] },
    { to:"/analytics",    icon:"📊", label:"Analytics",                         roles:["admin","financial"] },
    { to:"/reports",       icon:"📈", label:"Relatórios",                        roles:["admin","financial"] },
    { to:"/products",      icon:"📦", label:"Produtos",                          roles:["admin","financial","stock","seller"] },
    { to:"/quotes",        icon:"🧾", label:"Orçamentos",                        roles:null },
    { to:"/sales",         icon:"🛒", label:"Vendas",                            roles:null },
    { to:"/team",          icon:"👤", label:"Equipe",                            roles:["admin"] },
    { to:"/import-export", icon:"📂", label:"Importar/Exportar",                 roles:["admin","financial"] },
    { to:"/settings",      icon:"⚙️", label:"Configurações",                     roles:null },
  ];

  return all.filter(item => !item.roles || item.roles.includes(role));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILO 1 — VERTICAL (atual, retrátil no hover)
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarVertical({ menuItems, theme, isGlass, sidebarOpen, setSidebarOpen }) {
  const location  = useLocation();
  const isActive  = p => location.pathname === p;
  const navigate  = useNavigate();

  const bg       = isGlass ? "rgba(255,255,255,0.18)" : theme.sidebarBg;
  const backdrop = isGlass ? "blur(24px) saturate(160%)" : "blur(18px)";
  const border   = isGlass ? "rgba(255,255,255,0.4)"  : theme.borderCard;
  const shadow   = isGlass
    ? "4px 0 24px rgba(0,0,0,0.1), inset 1px 0 0 rgba(255,255,255,0.5)"
    : "4px 0 24px rgba(0,0,0,0.4), inset 1px 0 0 rgba(255,255,255,0.06)";

  return (
    <div style={{ height:"100vh", position:"sticky", top:0, background:bg,
      backdropFilter:backdrop, WebkitBackdropFilter:backdrop,
      borderRight:`1px solid ${border}`, boxShadow:shadow,
      padding:"20px 10px 10px", transition:"all 0.3s ease",
      overflow:"hidden", width:sidebarOpen?"220px":"70px",
      display:"flex", flexDirection:"column", zIndex:100 }}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div style={{ flexShrink:0, marginBottom:20 }}>
        <div style={{ opacity:sidebarOpen?1:0, transition:"0.3s" }}>
          <h2 style={{ whiteSpace:"nowrap", margin:0, fontWeight:600, letterSpacing:1, color:theme.textPrimary }}>SV Finance</h2>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", minHeight:0 }}>
        {menuItems.map(item => {
          const active   = isActive(item.to);
          const activeBg = isGlass?"rgba(255,255,255,0.35)":theme.sidebarActive;
          const hoverBg  = isGlass?"rgba(255,255,255,0.2)":`${theme.primary}11`;
          return (
            <div key={item.to}
              style={{ padding:12, cursor:"pointer", borderRadius:10, transition:"all 0.2s", marginBottom:6,
                background:active?activeBg:"transparent",
                border:active?`1px solid ${isGlass?"rgba(255,255,255,0.55)":theme.sidebarBorder}`:"1px solid transparent",
                boxShadow:active?(isGlass?"0 4px 16px rgba(0,0,0,0.08)":`0 4px 16px ${theme.sidebarShadow||"rgba(0,0,0,0.2)"}`):"none" }}
              onMouseEnter={e => { if(!active) e.currentTarget.style.background=hoverBg; }}
              onMouseLeave={e => { if(!active) e.currentTarget.style.background="transparent"; }}
            >
              <Link to={item.to} style={{ textDecoration:"none", color:theme.textPrimary, display:"flex", alignItems:"center", gap:12, width:"100%" }}>
                <span style={{ fontSize:18, minWidth:24, textAlign:"center" }}>{item.icon}</span>
                <span style={{ opacity:sidebarOpen?1:0, transition:"0.3s", whiteSpace:"nowrap", fontWeight:active?600:400 }}>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </div>

      <div style={{ flexShrink:0, borderTop:`1px solid ${border}`, paddingTop:10, marginTop:10 }}>
        <div style={{ padding:12, cursor:"pointer", borderRadius:10, transition:"all 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background="transparent"}
          onClick={() => { logoutUser(); navigate("/"); }}
        >
          <span style={{ display:"flex", alignItems:"center", gap:12, color:theme.textPrimary }}>
            <span style={{ fontSize:18, minWidth:24, textAlign:"center" }}>🚪</span>
            <span style={{ opacity:sidebarOpen?1:0, transition:"0.3s", whiteSpace:"nowrap", color:"#ef4444", fontWeight:500 }}>Sair</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILO 2 — HORIZONTAL (barra no topo)
// ═══════════════════════════════════════════════════════════════════════════════
function SidebarHorizontal({ menuItems, theme, isGlass }) {
  const location = useLocation();
  const isActive = p => location.pathname === p;
  const navigate = useNavigate();

  const bg      = isGlass ? "rgba(255,255,255,0.18)" : theme.sidebarBg || theme.bgSecondary;
  const border  = isGlass ? "rgba(255,255,255,0.4)"  : theme.borderCard;
  const backdrop= isGlass ? "blur(24px) saturate(160%)" : "blur(18px)";

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:200,
      background:bg, backdropFilter:backdrop, WebkitBackdropFilter:backdrop,
      borderBottom:`1px solid ${border}`,
      boxShadow:isGlass?"0 4px 24px rgba(0,0,0,0.08)":"0 4px 24px rgba(0,0,0,0.4)",
      display:"flex", alignItems:"center", padding:"0 16px", height:58, gap:4 }}
    >
      {/* Logo */}
      <span style={{ fontWeight:700, fontSize:15, color:theme.textPrimary, marginRight:12, whiteSpace:"nowrap", letterSpacing:1 }}>
        SV Finance
      </span>

      {/* Items */}
      <div style={{ display:"flex", alignItems:"center", gap:2, flex:1, overflowX:"auto" }}>
        {menuItems.map(item => {
          const active  = isActive(item.to);
          const hoverBg = isGlass?"rgba(255,255,255,0.2)":`${theme.primary}18`;
          return (
            <Link key={item.to} to={item.to}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 12px",
                borderRadius:10, textDecoration:"none", whiteSpace:"nowrap",
                color:active?theme.textActive:theme.textMuted,
                background:active?(isGlass?"rgba(255,255,255,0.3)":`${theme.primary}22`):"transparent",
                border:active?`1px solid ${isGlass?"rgba(255,255,255,0.5)":`${theme.primary}44`}`:"1px solid transparent",
                fontWeight:active?700:400, fontSize:13, transition:"all 0.2s",
                flexShrink:0 }}
              onMouseEnter={e => { if(!active) e.currentTarget.style.background=hoverBg; }}
              onMouseLeave={e => { if(!active) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <button onClick={() => { logoutUser(); navigate("/"); }}
        style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)",
          borderRadius:10, color:"#ef4444", padding:"7px 14px", cursor:"pointer",
          fontWeight:600, fontSize:13, flexShrink:0, display:"flex", alignItems:"center", gap:6 }}>
        🚪 Sair
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTILO 3 — DOCK (arco/meia lua na lateral esquerda)
// ═══════════════════════════════════════════════════════════════════════════════

function calcArcPositions(n, radius = 160, cx = -80, angleSpan = 100) {
  const positions = [];
  for (let i = 0; i < n; i++) {
    const angleDeg = n === 1 ? 0 : -angleSpan / 2 + (angleSpan * i) / (n - 1);
    const angleRad = (angleDeg * Math.PI) / 180;
    positions.push({
      x: cx + radius * Math.cos(angleRad),
      y: radius * Math.sin(angleRad),
    });
  }
  return positions;
}

function SidebarDock({ menuItems, theme, isGlass }) {
  const location = useLocation();
  const isActive = p => location.pathname === p;
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const n      = menuItems.length + 1; // +1 para o logout
  const pos    = calcArcPositions(n);
  const allItems = [...menuItems, { to: "__logout__", icon: "🚪", label: "Sair" }];

  // altura total necessária para o arco
  const ys     = pos.map(p => p.y);
  const minY   = Math.min(...ys);
  const maxY   = Math.max(...ys);
  const height = maxY - minY;
  const maxX   = Math.max(...pos.map(p => p.x));

  const RADIUS  = 22;  // raio de cada bolinha
  const PAD     = 12;  // padding lateral

  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 200,
      width: maxX + RADIUS + PAD + 20,
      height: height + RADIUS * 2 + 16,
      pointerEvents: "none",
    }}>
      {allItems.map((item, i) => {
        const { x, y } = pos[i];
        const active   = item.to !== "__logout__" && isActive(item.to);
        const hovered  = hoveredIdx === i;
        const isLogout = item.to === "__logout__";

        const cx = x + RADIUS;
        const cy = y - minY + RADIUS + 8;

        const bgColor = active
          ? theme.primary
          : isLogout && hovered
            ? "rgba(239,68,68,0.85)"
            : isGlass
              ? "rgba(255,255,255,0.18)"
              : "rgba(255,255,255,0.07)";

        const borderColor = active
          ? theme.primary
          : isLogout && hovered
            ? "rgba(239,68,68,0.6)"
            : isGlass
              ? "rgba(255,255,255,0.4)"
              : "rgba(255,255,255,0.12)";

        const scale   = hovered ? 1.22 : active ? 1.08 : 1;
        const shadow  = active
          ? `0 0 0 5px ${theme.primary}30, 0 6px 20px ${theme.primary}50`
          : hovered
            ? "0 8px 28px rgba(0,0,0,0.35)"
            : "0 2px 8px rgba(0,0,0,0.2)";

        return (
          <div
            key={item.to}
            style={{
              position: "absolute",
              left: cx - RADIUS,
              top:  cy - RADIUS,
              width:  RADIUS * 2,
              height: RADIUS * 2,
              pointerEvents: "all",
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => {
              if (isLogout) { logoutUser(); navigate("/"); }
            }}
          >
            {/* Bolinha */}
            <div style={{
              width:  RADIUS * 2,
              height: RADIUS * 2,
              borderRadius: "50%",
              background: bgColor,
              border: `2px solid ${borderColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              cursor: "pointer",
              transform: `scale(${scale}) translateY(${hovered ? -4 : 0}px)`,
              transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: shadow,
              backdropFilter: isGlass ? "blur(14px)" : undefined,
              WebkitBackdropFilter: isGlass ? "blur(14px)" : undefined,
              flexShrink: 0,
            }}>
              {isLogout
                ? <span style={{ fontSize: 16 }}>🚪</span>
                : <Link to={item.to} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", borderRadius: "50%" }}>
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                  </Link>
              }
            </div>

            {/* Tooltip à direita */}
            {hovered && (
              <div style={{
                position: "absolute",
                left: RADIUS * 2 + 10,
                top: "50%",
                transform: "translateY(-50%)",
                background: isGlass ? "rgba(255,255,255,0.92)" : "rgba(10,15,30,0.95)",
                color: isLogout ? "#ef4444" : isGlass ? "#1e293b" : theme.textPrimary,
                padding: "5px 13px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                border: `1px solid ${isGlass ? "rgba(255,255,255,0.7)" : theme.borderCard || "rgba(255,255,255,0.1)"}`,
                boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                zIndex: 300,
                animation: "fadeIn 0.12s ease",
              }}>
                {item.label}
                {/* seta */}
                <div style={{
                  position: "absolute",
                  left: -5,
                  top: "50%",
                  transform: "translateY(-50%) rotate(45deg)",
                  width: 8,
                  height: 8,
                  background: isGlass ? "rgba(255,255,255,0.92)" : "rgba(10,15,30,0.95)",
                  border: `1px solid ${isGlass ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.1)"}`,
                  borderRight: "none",
                  borderTop: "none",
                }}/>
              </div>
            )}
          </div>
        );
      })}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(-50%) translateX(-4px); } to { opacity:1; transform:translateY(-50%) translateX(0); } }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { theme, themeId } = useTheme();
  const isGlass  = themeId === "glass" || themeId === "gray";
  const isMobile = window.innerWidth <= 768;
  const menuItems = useMenuItems();

  const [sidebarStyle, setSidebarStyleState] = useState(getSidebarStyle());

  // Escuta mudanças de estilo feitas em Settings.jsx
  useEffect(() => {
    const handler = () => setSidebarStyleState(getSidebarStyle());
    window.addEventListener("sv_sidebar_style_changed", handler);
    return () => window.removeEventListener("sv_sidebar_style_changed", handler);
  }, []);

  if (isMobile) return <SidebarMobile menuItems={menuItems} theme={theme} isGlass={isGlass}/>;

  if (sidebarStyle === "horizontal") {
    return <SidebarHorizontal menuItems={menuItems} theme={theme} isGlass={isGlass}/>;
  }
  if (sidebarStyle === "dock") {
    return <SidebarDock menuItems={menuItems} theme={theme} isGlass={isGlass}/>;
  }
  return <SidebarVertical menuItems={menuItems} theme={theme} isGlass={isGlass} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>;
}
