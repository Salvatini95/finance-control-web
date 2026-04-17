/**
 * printThemes.js
 * Temas de impressão compartilhados entre DRE e Orçamentos.
 * Cada tema mapeia para a identidade visual do sistema.
 */

export const PRINT_THEMES = {
  // ── Azul (padrão do sistema) ──────────────────────────
  blue: {
    id: "blue",
    label: "🔵 Azul",
    // documento
    docBg:         "#0a0f1e",
    docColor:      "#e2e8f0",
    docBorder:     "rgba(59,130,246,0.2)",
    // acento
    accent:        "#3b82f6",
    accentGrad:    "linear-gradient(90deg,#3b82f6,#6366f1,#3b82f6)",
    accentLight:   "rgba(59,130,246,0.08)",
    accentBorder:  "rgba(59,130,246,0.25)",
    // logo
    logoBg:        "rgba(59,130,246,0.1)",
    logoBorder:    "rgba(59,130,246,0.25)",
    logoColor:     "#3b82f6",
    // textos
    titleColor:    "#ffffff",
    labelColor:    "#475569",
    valueColor:    "#e2e8f0",
    mutedColor:    "#64748b",
    // tabelas / cards
    rowEven:       "rgba(255,255,255,0.02)",
    tableBorder:   "rgba(59,130,246,0.2)",
    cardBg:        "rgba(255,255,255,0.03)",
    cardBorder:    "rgba(255,255,255,0.07)",
    // totais
    totalBg:       "rgba(59,130,246,0.06)",
    totalBorder:   "rgba(59,130,246,0.2)",
    totalFinal:    "#3b82f6",
    // resultado DRE
    resultBg:      "rgba(59,130,246,0.1)",
    resultBorder:  "rgba(59,130,246,0.3)",
    receitaBg:     "rgba(34,197,94,0.08)",
    deducaoBg:     "rgba(239,68,68,0.06)",
    lucroLiqBg:    "linear-gradient(135deg,#3b82f6,#6366f1)",
    // barra de controle (no-print)
    barBg:         "rgba(15,23,42,0.95)",
    barBorder:     "rgba(255,255,255,0.08)",
    backBtn:       "rgba(255,255,255,0.08)",
    backColor:     "#fff",
    // page (fora do doc)
    pageBg:        "#020617",
    // sombra/glow
    glowA:         "rgba(59,130,246,0.06)",
    glowB:         "rgba(99,102,241,0.05)",
    // botão imprimir
    printBtn:      "linear-gradient(135deg,#3b82f6,#2563eb)",
    printShadow:   "rgba(59,130,246,0.35)",
    // income/expense
    incomeColor:   "#22c55e",
    expenseColor:  "#ef4444",
    isLight:       false,
  },

  // ── Glass (claro) ─────────────────────────────────────
  glass: {
    id: "glass",
    label: "🪟 Glass",
    docBg:         "#ffffff",
    docColor:      "#0f172a",
    docBorder:     "rgba(29,78,216,0.15)",
    accent:        "#1d4ed8",
    accentGrad:    "linear-gradient(90deg,#1d4ed8,#4f46e5,#1d4ed8)",
    accentLight:   "rgba(29,78,216,0.06)",
    accentBorder:  "rgba(29,78,216,0.2)",
    logoBg:        "rgba(29,78,216,0.07)",
    logoBorder:    "rgba(29,78,216,0.2)",
    logoColor:     "#1d4ed8",
    titleColor:    "#0f172a",
    labelColor:    "#94a3b8",
    valueColor:    "#1e293b",
    mutedColor:    "#64748b",
    rowEven:       "#f8fafc",
    tableBorder:   "rgba(29,78,216,0.15)",
    cardBg:        "#f8fafc",
    cardBorder:    "#e2e8f0",
    totalBg:       "rgba(29,78,216,0.04)",
    totalBorder:   "rgba(29,78,216,0.15)",
    totalFinal:    "#1d4ed8",
    resultBg:      "rgba(29,78,216,0.06)",
    resultBorder:  "rgba(29,78,216,0.2)",
    receitaBg:     "rgba(21,128,61,0.06)",
    deducaoBg:     "rgba(185,28,28,0.05)",
    lucroLiqBg:    "linear-gradient(135deg,#1d4ed8,#4f46e5)",
    barBg:         "rgba(248,250,252,0.98)",
    barBorder:     "#e2e8f0",
    backBtn:       "rgba(0,0,0,0.06)",
    backColor:     "#1e293b",
    pageBg:        "#f1f5f9",
    glowA:         "rgba(29,78,216,0.04)",
    glowB:         "rgba(79,70,229,0.03)",
    printBtn:      "linear-gradient(135deg,#1d4ed8,#1e40af)",
    printShadow:   "rgba(29,78,216,0.3)",
    incomeColor:   "#15803d",
    expenseColor:  "#b91c1c",
    isLight:       true,
  },

  // ── Aurora (dark iridescente) ─────────────────────────
  aurora: {
    id: "aurora",
    label: "🌌 Aurora",
    docBg:         "#070d1a",
    docColor:      "#e8f4ff",
    docBorder:     "rgba(56,189,248,0.15)",
    accent:        "#38bdf8",
    accentGrad:    "linear-gradient(90deg,#38bdf8,#818cf8,#38bdf8)",
    accentLight:   "rgba(56,189,248,0.08)",
    accentBorder:  "rgba(56,189,248,0.2)",
    logoBg:        "rgba(56,189,248,0.08)",
    logoBorder:    "rgba(56,189,248,0.2)",
    logoColor:     "#38bdf8",
    titleColor:    "#e8f4ff",
    labelColor:    "#526d88",
    valueColor:    "#94b8d4",
    mutedColor:    "#526d88",
    rowEven:       "rgba(255,255,255,0.02)",
    tableBorder:   "rgba(56,189,248,0.15)",
    cardBg:        "rgba(255,255,255,0.03)",
    cardBorder:    "rgba(255,255,255,0.07)",
    totalBg:       "rgba(56,189,248,0.06)",
    totalBorder:   "rgba(56,189,248,0.15)",
    totalFinal:    "#38bdf8",
    resultBg:      "rgba(56,189,248,0.08)",
    resultBorder:  "rgba(56,189,248,0.25)",
    receitaBg:     "rgba(52,211,153,0.07)",
    deducaoBg:     "rgba(248,113,113,0.06)",
    lucroLiqBg:    "linear-gradient(135deg,#38bdf8,#818cf8)",
    barBg:         "rgba(7,13,26,0.98)",
    barBorder:     "rgba(255,255,255,0.07)",
    backBtn:       "rgba(255,255,255,0.07)",
    backColor:     "#e8f4ff",
    pageBg:        "#040810",
    glowA:         "rgba(56,189,248,0.05)",
    glowB:         "rgba(129,140,248,0.05)",
    printBtn:      "linear-gradient(135deg,#38bdf8,#818cf8)",
    printShadow:   "rgba(56,189,248,0.3)",
    incomeColor:   "#34d399",
    expenseColor:  "#f87171",
    isLight:       false,
  },

  // ── Gray (executivo) ──────────────────────────────────
  gray: {
    id: "gray",
    label: "⚪ Cinza",
    docBg:         "#1a1f2e",
    docColor:      "#f1f5f9",
    docBorder:     "rgba(148,163,184,0.15)",
    accent:        "#94a3b8",
    accentGrad:    "linear-gradient(90deg,#94a3b8,#cbd5e1,#94a3b8)",
    accentLight:   "rgba(148,163,184,0.08)",
    accentBorder:  "rgba(148,163,184,0.2)",
    logoBg:        "rgba(148,163,184,0.1)",
    logoBorder:    "rgba(148,163,184,0.2)",
    logoColor:     "#94a3b8",
    titleColor:    "#f1f5f9",
    labelColor:    "#64748b",
    valueColor:    "#cbd5e1",
    mutedColor:    "#64748b",
    rowEven:       "rgba(255,255,255,0.03)",
    tableBorder:   "rgba(148,163,184,0.15)",
    cardBg:        "rgba(255,255,255,0.04)",
    cardBorder:    "rgba(255,255,255,0.1)",
    totalBg:       "rgba(148,163,184,0.07)",
    totalBorder:   "rgba(148,163,184,0.2)",
    totalFinal:    "#cbd5e1",
    resultBg:      "rgba(148,163,184,0.1)",
    resultBorder:  "rgba(148,163,184,0.25)",
    receitaBg:     "rgba(74,222,128,0.07)",
    deducaoBg:     "rgba(248,113,113,0.06)",
    lucroLiqBg:    "linear-gradient(135deg,#64748b,#94a3b8)",
    barBg:         "rgba(20,25,40,0.98)",
    barBorder:     "rgba(255,255,255,0.08)",
    backBtn:       "rgba(255,255,255,0.08)",
    backColor:     "#f1f5f9",
    pageBg:        "#0f1520",
    glowA:         "rgba(148,163,184,0.05)",
    glowB:         "rgba(100,116,139,0.04)",
    printBtn:      "linear-gradient(135deg,#64748b,#475569)",
    printShadow:   "rgba(100,116,139,0.3)",
    incomeColor:   "#4ade80",
    expenseColor:  "#f87171",
    isLight:       false,
  },
};

export const DEFAULT_PRINT_THEME = "blue";

/**
 * Gera o CSS base para impressão de qualquer documento.
 * Usado tanto no DRE quanto no Orçamento.
 */
export function buildPrintCSS(T) {
  return `
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      color: ${T.docColor};
      background: ${T.docBg};
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc-wrapper {
      background: ${T.docBg};
      color: ${T.docColor};
      max-width: 860px;
      margin: 0 auto;
      padding: 48px 52px;
      position: relative;
      overflow: hidden;
    }
    .accent-bar-top    { position:absolute; top:0; left:0; right:0; height:3px; background:${T.accentGrad}; }
    .accent-bar-bottom { position:absolute; bottom:0; left:0; right:0; height:3px; background:${T.accentGrad}; }
    .glow-a { position:absolute; top:20px; right:40px; width:120px; height:120px; border-radius:50%; background:${T.glowA}; filter:blur(30px); pointer-events:none; }
    .glow-b { position:absolute; bottom:40px; left:20px; width:80px; height:80px; border-radius:50%; background:${T.glowB}; filter:blur(20px); pointer-events:none; }
    .doc-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; gap:20px; }
    .logo-box { width:64px; height:64px; border-radius:12px; background:${T.logoBg}; border:1px solid ${T.logoBorder}; display:flex; align-items:center; justify-content:center; overflow:hidden; flex-shrink:0; }
    .logo-box img { max-width:100%; max-height:100%; object-fit:contain; }
    .logo-placeholder { color:${T.logoColor}; font-size:9px; font-weight:700; text-align:center; padding:4px; line-height:1.3; }
    .company-name { font-size:14px; font-weight:700; color:${T.titleColor}; margin-bottom:3px; }
    .company-meta { font-size:10px; color:${T.labelColor}; line-height:1.5; }
    .doc-title { font-size:22px; font-weight:800; color:${T.accent}; letter-spacing:1px; text-align:right; }
    .doc-subtitle { font-size:11px; color:${T.labelColor}; text-align:right; margin-top:4px; line-height:1.6; }
    .divider { height:1px; background:linear-gradient(90deg,transparent,${T.accent}55,transparent); margin:20px 0; }
    .section-title { font-size:9px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:${T.accent}; margin-bottom:10px; }
    .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; padding:14px 16px; background:${T.cardBg}; border:1px solid ${T.cardBorder}; border-radius:10px; margin-bottom:20px; }
    .info-cell .label { font-size:9px; text-transform:uppercase; letter-spacing:0.05em; color:${T.labelColor}; margin-bottom:2px; }
    .info-cell .value { font-size:11px; font-weight:600; color:${T.valueColor}; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    thead tr { border-bottom:1px solid ${T.tableBorder}; }
    thead th { padding:8px 10px; font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${T.accent}; text-align:left; }
    thead th.right { text-align:right; }
    tbody tr { border-bottom:1px solid ${T.cardBorder}; }
    tbody tr:nth-child(even) { background:${T.rowEven}; }
    tbody td { padding:9px 10px; font-size:11px; color:${T.valueColor}; }
    tbody td.right { text-align:right; }
    tbody td.muted { color:${T.mutedColor}; }
    tbody td.mono  { font-family:monospace; font-size:10px; color:${T.mutedColor}; }
    tbody td.income  { color:${T.incomeColor}; font-weight:700; }
    tbody td.expense { color:${T.expenseColor}; font-weight:700; }
    .totals-box { display:flex; justify-content:flex-end; margin-bottom:20px; }
    .totals-inner { background:${T.totalBg}; border:1px solid ${T.totalBorder}; border-radius:10px; padding:16px 20px; min-width:240px; }
    .totals-row { display:flex; justify-content:space-between; font-size:11px; margin-bottom:6px; color:${T.mutedColor}; }
    .totals-row.final { border-top:1px solid ${T.accentBorder}; padding-top:10px; margin-top:6px; font-size:14px; font-weight:800; color:${T.totalFinal}; }
    .totals-row.discount { color:${T.expenseColor}; }
    /* DRE específico */
    .dre-row { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-radius:6px; margin-bottom:2px; }
    .dre-row.receita   { background:${T.receitaBg}; }
    .dre-row.deducao   { background:${T.deducaoBg}; }
    .dre-row.resultado { background:${T.resultBg}; border-left:3px solid ${T.accent}; font-weight:600; }
    .dre-row.lucro_liq { background:${T.lucroLiqBg}; color:#fff; font-weight:800; font-size:13px; border-radius:8px; margin:6px 0; }
    .dre-label { flex:1; font-size:11px; color:inherit; }
    .dre-margem { font-size:10px; color:${T.mutedColor}; min-width:55px; text-align:right; margin-left:8px; }
    .dre-valor  { font-size:12px; font-weight:600; min-width:110px; text-align:right; }
    .dre-detail { display:flex; justify-content:space-between; padding:4px 22px; font-size:10px; color:${T.mutedColor}; border-bottom:1px solid ${T.cardBorder}; }
    .dre-separator { height:1px; background:${T.cardBorder}; margin:8px 0; }
    /* indicadores */
    .ind-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:20px; }
    .ind-card { background:${T.cardBg}; border:1px solid ${T.cardBorder}; border-radius:8px; padding:10px 12px; }
    .ind-label { font-size:9px; text-transform:uppercase; letter-spacing:0.05em; color:${T.mutedColor}; margin-bottom:3px; }
    .ind-value { font-size:13px; font-weight:700; }
    .ind-value.pos { color:${T.incomeColor}; }
    .ind-value.neg { color:${T.expenseColor}; }
    .ind-value.neu { color:${T.accent}; }
    /* assinatura */
    .sign-row { display:flex; justify-content:flex-end; margin:24px 0; }
    .sign-box { text-align:center; min-width:200px; }
    .sign-line { border-top:1px solid ${T.accentBorder}; padding-top:8px; margin-top:40px; }
    .sign-name  { font-size:12px; color:${T.accent}; font-weight:600; }
    .sign-label { font-size:10px; color:${T.mutedColor}; margin-top:2px; }
    /* footer */
    .doc-footer { border-top:1px solid ${T.cardBorder}; padding-top:12px; text-align:center; font-size:9px; color:${T.mutedColor}; margin-top:24px; }
    /* barra de controle (não imprime) */
    .print-bar { background:${T.barBg}; border-bottom:1px solid ${T.barBorder}; padding:10px 20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
    @media print {
      .print-bar { display:none !important; }
      body { padding:0; }
      .doc-wrapper { max-width:100%; padding:24px 32px; box-shadow:none; border-radius:0; }
    }
  `;
}
