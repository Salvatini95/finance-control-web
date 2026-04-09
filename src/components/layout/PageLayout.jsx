import { useTheme } from "../../contexts/ThemeContext";
import worldMap from "../../assets/world-map.svg";
import fundoGlassEGelo  from "../../assets/fundoglassegelo.jpg";
import fundoCinzaPrata  from "../../assets/fundocinzaprata.jpg";

const BG_IMAGES = {
  glass: fundoGlassEGelo,
  gray:  fundoCinzaPrata,
};

export default function PageLayout({ children, style }) {
  const { theme, themeId } = useTheme();

  const bgImage    = BG_IMAGES[themeId] || null;
  const isImgTheme = !!bgImage;
  const isGlass    = themeId === "glass" || themeId === "gray";

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: isImgTheme ? theme.bgImageFallback : theme.bgPrimary,
      ...(isImgTheme && {
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }),
      color: theme.textPrimary,
      fontFamily: "'Inter','Segoe UI',sans-serif",
      position: "relative",
      ...style,
    }}>

      {/* ── CSS Global — corrige selects e ajusta cards em todos os temas ── */}
      <style>{`
        /* ── Selects: força cor do texto conforme o tema ── */
        select {
          color: ${theme.textPrimary} !important;
          background-color: ${theme.bgInput} !important;
        }
        select option {
          color: ${isGlass ? "#0a0f1a" : "#ffffff"} !important;
          background-color: ${isGlass ? "#e8f0f8" : "#1e293b"} !important;
        }

        /* ── Inputs e textareas ── */
        input, textarea {
          color: ${theme.textPrimary} !important;
        }
        input::placeholder, textarea::placeholder {
          color: ${theme.textMuted} !important;
          opacity: 1;
        }

        /* ── Scrollbar personalizada ── */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: ${isGlass ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.1)"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isGlass ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.2)"};
        }

        /* ── Cards glass/gray: menos transparência ── */
        ${isGlass ? `
          .card3d-pr, .card3d-sv, .card3d-q, .card3d-tm,
          .table3d-pr, .table3d-sv, .table3d-q, .table3d-tm,
          .detail-panel {
            background: rgba(255,255,255,0.32) !important;
          }
        ` : ""}

        /* ── Selects inline (status, filtros) com texto sempre visível ── */
        select[style*="border-radius: 20px"],
        select[style*="border-radius:20px"] {
          color: ${isGlass ? "#0f172a" : theme.textPrimary} !important;
          font-weight: 600 !important;
        }

        /* ── Garante legibilidade em selects de status ── */
        select option:hover,
        select option:focus,
        select option:checked {
          background: ${isGlass ? "#dbeafe" : "#1e40af"} !important;
          color: ${isGlass ? "#1e3a8a" : "#ffffff"} !important;
        }
      `}</style>

      {/* ── Overlay semitransparente — temas com imagem de fundo ── */}
      {isImgTheme && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: theme.bgOverlay,
          pointerEvents: "none",
          zIndex: 0,
        }} />
      )}

      {/* ── Mapa SVG — temas sem imagem de fundo ── */}
      {!isImgTheme && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${worldMap})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "1100px",
          opacity: theme.mapOpacity,
          pointerEvents: "none",
          zIndex: 0,
        }} />
      )}

      {/* ── Conteúdo da página ── */}
      {children}
    </div>
  );
}
