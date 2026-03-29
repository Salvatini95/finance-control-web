import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import worldMap from "../assets/world-map.svg";
import logoGif from "../assets/video.gif";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
}
function fmtDate(d) {
  if (!d) return "—";
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

const STATUS_MAP = {
  draft:     { label:"Rascunho",  color:"#94a3b8", bg:"rgba(148,163,184,0.12)" },
  sent:      { label:"Enviado",   color:"#3b82f6", bg:"rgba(59,130,246,0.12)"  },
  approved:  { label:"Aprovado",  color:"#22c55e", bg:"rgba(34,197,94,0.12)"   },
  rejected:  { label:"Recusado",  color:"#ef4444", bg:"rgba(239,68,68,0.12)"   },
  cancelled: { label:"Cancelado", color:"#f59e0b", bg:"rgba(245,158,11,0.12)"  },
};

const THEMES = {
  dark: {
    label:"🌙 Escuro",
    docBg:"#0a0f1e", docColor:"#e2e8f0",
    docBorder:"rgba(59,130,246,0.15)",
    accent:"#3b82f6",
    accentGrad:"linear-gradient(90deg,#3b82f6,#6366f1,#3b82f6)",
    logoBg:"rgba(59,130,246,0.08)", logoBorder:"rgba(59,130,246,0.2)", logoColor:"#3b82f6",
    titleColor:"#fff",
    clientBg:"rgba(255,255,255,0.02)", clientBorder:"rgba(255,255,255,0.06)",
    fieldLabel:"#475569", fieldValue:"#e2e8f0",
    tableBorder:"rgba(59,130,246,0.25)",
    tableRowEven:"rgba(255,255,255,0.02)",
    tableNum:"#475569", tableName:"#e2e8f0", tableExtra:"#64748b",
    totalBg:"rgba(59,130,246,0.05)", totalBorder:"rgba(59,130,246,0.15)",
    totalDivider:"rgba(59,130,246,0.2)", totalValue:"#e2e8f0", totalFinal:"#3b82f6",
    condBg:"rgba(255,255,255,0.02)", condBorder:"rgba(255,255,255,0.06)", condText:"#94a3b8",
    signBorder:"rgba(59,130,246,0.3)", signName:"#3b82f6", signLabel:"#475569",
    footerBorder:"rgba(255,255,255,0.05)", footerText:"#334155",
    discountColor:"#ef4444", subtotalColor:"#64748b", valueColor:"#22c55e",
    pageBg:"#020617",
    barBg:"rgba(255,255,255,0.03)", barBorder:"rgba(255,255,255,0.07)",
    backBtn:"rgba(255,255,255,0.08)", backColor:"#fff", backBorder:"rgba(255,255,255,0.1)",
    glowA:"rgba(59,130,246,0.04)", glowB:"rgba(99,102,241,0.05)",
    printBtn:"linear-gradient(135deg,#3b82f6,#2563eb)", printShadow:"rgba(59,130,246,0.3)",
    radioAccent:"#3b82f6", radioActive:"#60a5fa", radioInactive:"#64748b",
    themeLabel:"#64748b",
  },
  light: {
    label:"☀️ Claro",
    docBg:"#ffffff", docColor:"#1e293b",
    docBorder:"rgba(34,197,94,0.2)",
    accent:"#16a34a",
    accentGrad:"linear-gradient(90deg,#16a34a,#22c55e,#16a34a)",
    logoBg:"rgba(34,197,94,0.08)", logoBorder:"rgba(34,197,94,0.25)", logoColor:"#16a34a",
    titleColor:"#0f172a",
    clientBg:"#f8fafc", clientBorder:"#e2e8f0",
    fieldLabel:"#94a3b8", fieldValue:"#1e293b",
    tableBorder:"rgba(34,197,94,0.3)",
    tableRowEven:"#f8fafc",
    tableNum:"#94a3b8", tableName:"#1e293b", tableExtra:"#64748b",
    totalBg:"rgba(34,197,94,0.05)", totalBorder:"rgba(34,197,94,0.2)",
    totalDivider:"rgba(34,197,94,0.25)", totalValue:"#1e293b", totalFinal:"#16a34a",
    condBg:"#f8fafc", condBorder:"#e2e8f0", condText:"#475569",
    signBorder:"rgba(34,197,94,0.4)", signName:"#16a34a", signLabel:"#94a3b8",
    footerBorder:"#e2e8f0", footerText:"#94a3b8",
    discountColor:"#ef4444", subtotalColor:"#64748b", valueColor:"#16a34a",
    pageBg:"#f1f5f9",
    barBg:"rgba(0,0,0,0.03)", barBorder:"rgba(0,0,0,0.08)",
    backBtn:"rgba(0,0,0,0.06)", backColor:"#1e293b", backBorder:"rgba(0,0,0,0.1)",
    glowA:"rgba(34,197,94,0.05)", glowB:"rgba(22,163,74,0.04)",
    printBtn:"linear-gradient(135deg,#16a34a,#15803d)", printShadow:"rgba(22,163,74,0.3)",
    radioAccent:"#16a34a", radioActive:"#16a34a", radioInactive:"#94a3b8",
    themeLabel:"#475569",
  }
};

const EMPTY_FORM = {
  client_name:"", client_email:"", client_phone:"",
  client_document:"", client_address:"",
  status:"draft", valid_until:"", payment_terms:"",
  notes:"", discount:0,
};

export default function Quotes() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [quotes, setQuotes]               = useState([]);
  const [products, setProducts]           = useState([]);
  const [company, setCompany]             = useState({});
  const [loading, setLoading]             = useState(true);
  const [view, setView]                   = useState("list");
  const [editing, setEditing]             = useState(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [items, setItems]                 = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [filterStatus, setFilterStatus]   = useState("all");
  const [search, setSearch]               = useState("");
  const [printQuote, setPrintQuote]       = useState(null);
  const [printTheme, setPrintTheme]       = useState("dark");
  const [logoPreview, setLogoPreview]     = useState(null);
  const [companyModal, setCompanyModal]   = useState(false);
  const [companyForm, setCompanyForm]     = useState({});
  const logoInputRef = useRef();
  const navigate = useNavigate();

  async function fetchQuotes() {
    const res = await fetch(`${API}/quotes`, { headers:{ Authorization:`Bearer ${token()}` } });
    if (res.status === 401) { localStorage.removeItem("token"); navigate("/"); return; }
    const data = await res.json();
    setQuotes(Array.isArray(data) ? data : []);
  }
  async function fetchProducts() {
    const res = await fetch(`${API}/products`, { headers:{ Authorization:`Bearer ${token()}` } });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }
  async function fetchCompany() {
    const res = await fetch(`${API}/company`, { headers:{ Authorization:`Bearer ${token()}` } });
    const data = await res.json();
    setCompany(data); setCompanyForm(data);
    setLogoPreview(data.company_logo || null);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchQuotes(), fetchProducts(), fetchCompany()]);
      setLoading(false);
    })();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setLogoPreview(ev.target.result);
      setCompanyForm(f => ({ ...f, company_logo: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function saveCompany() {
    const res = await fetch(`${API}/company`, {
      method:"PUT",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
      body: JSON.stringify(companyForm),
    });
    if (res.ok) { showToast("Dados da empresa salvos!"); setCompanyModal(false); fetchCompany(); }
    else showToast("Erro ao salvar.", "error");
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setItems([]); setView("form"); }
  function openEdit(q) {
    setEditing(q);
    setForm({
      client_name:q.client_name, client_email:q.client_email||"",
      client_phone:q.client_phone||"", client_document:q.client_document||"",
      client_address:q.client_address||"", status:q.status,
      valid_until:q.valid_until||"", payment_terms:q.payment_terms||"",
      notes:q.notes||"", discount:q.discount||0,
    });
    setItems(q.items||[]);
    setView("form");
  }

  function addItem() {
    setItems(prev => [...prev, { product_id:"", name:"", unit:"un", qty:1, price:0, total:0 }]);
  }
  function removeItem(idx) { setItems(prev => prev.filter((_,i) => i!==idx)); }
  function updateItem(idx, fld, value) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [fld]:value };
      if (fld==="qty"||fld==="price") {
        next[idx].total = parseFloat(next[idx].qty||0) * parseFloat(next[idx].price||0);
      }
      return next;
    });
  }
  function selectProduct(idx, productId) {
    const p = products.find(p => String(p.id)===String(productId));
    if (!p) return;
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], product_id:p.id, name:p.name, unit:p.unit||"un", price:p.price, total:parseFloat(next[idx].qty||1)*p.price };
      return next;
    });
  }

  const subtotal    = items.reduce((s,i) => s+(parseFloat(i.qty||0)*parseFloat(i.price||0)), 0);
  const discountAmt = subtotal*(parseFloat(form.discount||0)/100);
  const total       = subtotal - discountAmt;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.client_name.trim()) { showToast("Nome do cliente obrigatório.","error"); return; }
    const payload = { ...form, discount:parseFloat(form.discount||0), items };
    const url    = editing ? `${API}/quotes/${editing.id}` : `${API}/quotes`;
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
      body: JSON.stringify(payload),
    });
    if (res.ok) { showToast(editing?"Orçamento atualizado!":"Orçamento criado!"); setView("list"); fetchQuotes(); }
    else { const err = await res.json(); showToast(err.msg||"Erro.","error"); }
  }

  async function changeStatus(q, status) {
    await fetch(`${API}/quotes/${q.id}/status`, {
      method:"PATCH",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    fetchQuotes();
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/quotes/${id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token()}` } });
    if (res.ok) { showToast("Orçamento removido."); setDeleteConfirm(null); fetchQuotes(); }
    else showToast("Erro ao remover.","error");
  }

  function openPrint(q) { setPrintQuote(q); setView("print"); }
  function handlePrint() { window.print(); }

  const filteredQuotes = quotes.filter(q => {
    const statusOk = filterStatus==="all" || q.status===filterStatus;
    const searchOk = q.client_name.toLowerCase().includes(search.toLowerCase()) ||
                     q.number.toLowerCase().includes(search.toLowerCase());
    return statusOk && searchOk;
  });

  if (loading) return <h2 style={{ color:"white", padding:20 }}>Carregando...</h2>;

  // ══════════════════════════════
  // VIEW: IMPRESSÃO COM TEMAS
  // ══════════════════════════════
  if (view==="print" && printQuote) {
    const q = printQuote;
    const sub  = q.subtotal || 0;
    const disc = q.discount > 0 ? sub * q.discount / 100 : 0;
    const T = THEMES[printTheme];

    return (
      <div style={{ background:T.pageBg, minHeight:"100vh" }}>
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: ${T.docBg} !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          body { margin:0; font-family:'Inter','Segoe UI',sans-serif; }
        `}</style>

        {/* BARRA TOPO */}
        <div className="no-print" style={{
          background:T.barBg, backdropFilter:"blur(10px)",
          borderBottom:`1px solid ${T.barBorder}`,
          padding:"12px 24px",
          display:"flex", gap:16, alignItems:"center", flexWrap:"wrap"
        }}>
          <button onClick={() => setView("list")} style={{
            background:T.backBtn, color:T.backColor,
            border:`1px solid ${T.backBorder}`, borderRadius:8,
            padding:"8px 16px", cursor:"pointer", fontWeight:600, fontSize:"0.88rem"
          }}>← Voltar</button>

          {/* SELETOR DE TEMA */}
          <div style={{
            display:"flex", alignItems:"center", gap:16,
            background: printTheme==="dark"?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.04)",
            border: printTheme==="dark"?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(0,0,0,0.1)",
            borderRadius:10, padding:"8px 16px"
          }}>
            <span style={{ fontSize:11, fontWeight:700, color:T.themeLabel, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Tema:
            </span>
            {Object.entries(THEMES).map(([key, t]) => (
              <label key={key} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                <input
                  type="radio"
                  name="printTheme"
                  value={key}
                  checked={printTheme===key}
                  onChange={() => setPrintTheme(key)}
                  style={{ accentColor: key==="dark"?"#3b82f6":"#16a34a", cursor:"pointer" }}
                />
                <span style={{
                  fontSize:13, fontWeight:600,
                  color: printTheme===key
                    ? (key==="dark"?"#60a5fa":"#16a34a")
                    : T.themeLabel
                }}>
                  {t.label}
                </span>
              </label>
            ))}
          </div>

          <button onClick={handlePrint} style={{
            background:T.printBtn, color:"#fff",
            border:"none", borderRadius:8,
            padding:"8px 16px", cursor:"pointer", fontWeight:600, fontSize:"0.88rem",
            boxShadow:`0 4px 15px ${T.printShadow}`
          }}>🖨️ Imprimir / Salvar PDF</button>
        </div>

        {/* DOCUMENTO */}
        <div style={{
          background:T.docBg, color:T.docColor,
          maxWidth:860, margin:"24px auto",
          padding: isMobile?"28px 20px":"52px 56px",
          boxShadow: printTheme==="dark"?"0 8px 48px rgba(0,0,0,0.8)":"0 8px 48px rgba(0,0,0,0.12)",
          borderRadius:16, border:`1px solid ${T.docBorder}`,
          position:"relative", overflow:"hidden"
        }}>

          {/* Gradiente topo */}
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:T.accentGrad }} />

          {/* Brilhos decorativos */}
          <div style={{ position:"absolute", top:20, right:40, width:120, height:120, borderRadius:"50%", background:T.glowA, filter:"blur(30px)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:40, left:20, width:80, height:80, borderRadius:"50%", background:T.glowB, filter:"blur(20px)", pointerEvents:"none" }} />

          {/* CABEÇALHO */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:40, flexWrap: isMobile?"wrap":"nowrap", gap:24 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
              <div style={{ width: isMobile?56:72, height: isMobile?56:72, borderRadius:12, background:T.logoBg, border:`1px solid ${T.logoBorder}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", flexShrink:0 }}>
                {company.company_logo
                  ? <img src={company.company_logo} alt="logo" style={{ maxWidth:"100%", maxHeight:"100%", objectFit:"contain" }} />
                  : <span style={{ color:T.logoColor, fontSize:"0.65rem", fontWeight:700, textAlign:"center", padding:4, lineHeight:1.3 }}>LOGO</span>
                }
              </div>
              <div>
                <div style={{ fontSize: isMobile?"1rem":"1.15rem", fontWeight:700, color:T.titleColor, marginBottom:4 }}>
                  {company.company_name || "Sua Empresa"}
                </div>
                {company.company_cnpj && <div style={{ fontSize:12, color:T.fieldLabel }}>CNPJ: {company.company_cnpj}</div>}
                {company.company_address && <div style={{ fontSize:12, color:T.fieldLabel }}>{company.company_address}</div>}
              </div>
            </div>

            <div style={{ textAlign: isMobile?"left":"right" }}>
              <div style={{ fontSize: isMobile?"1.3rem":"1.8rem", fontWeight:800, color:T.accent, letterSpacing:"1px", marginBottom:4 }}>
                ORÇAMENTO
              </div>
              <div style={{ fontSize:13, color:T.fieldLabel, marginBottom:2 }}>Nº {q.number}</div>
              <div style={{ fontSize:12, color:T.fieldLabel }}>Emitido em: {fmtDate(q.created_at)}</div>
              {q.valid_until && <div style={{ fontSize:12, color:T.fieldLabel }}>Válido até: {fmtDate(q.valid_until)}</div>}
              <div style={{ display:"inline-block", marginTop:8, padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:700, background: STATUS_MAP[q.status]?.bg, color: STATUS_MAP[q.status]?.color, border:`1px solid ${STATUS_MAP[q.status]?.color}33` }}>
                {STATUS_MAP[q.status]?.label}
              </div>
            </div>
          </div>

          {/* DIVISOR */}
          <div style={{ height:1, background:`linear-gradient(90deg,transparent,${T.accent}66,transparent)`, marginBottom:32 }} />

          {/* DADOS CLIENTE */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:T.accent, marginBottom:12 }}>PARA:</div>
            <div style={{ background:T.clientBg, border:`1px solid ${T.clientBorder}`, borderRadius:12, padding:"16px 20px", display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:"10px 24px" }}>
              <div>
                <div style={{ fontSize:10, color:T.fieldLabel, textTransform:"uppercase", letterSpacing:"0.05em" }}>Nome</div>
                <div style={{ fontSize:14, fontWeight:600, color:T.fieldValue, marginTop:2 }}>{q.client_name}</div>
              </div>
              {q.client_document && <div>
                <div style={{ fontSize:10, color:T.fieldLabel, textTransform:"uppercase", letterSpacing:"0.05em" }}>CPF/CNPJ</div>
                <div style={{ fontSize:14, color:T.fieldValue, marginTop:2 }}>{q.client_document}</div>
              </div>}
              {q.client_email && <div>
                <div style={{ fontSize:10, color:T.fieldLabel, textTransform:"uppercase", letterSpacing:"0.05em" }}>E-mail</div>
                <div style={{ fontSize:14, color:T.fieldValue, marginTop:2 }}>{q.client_email}</div>
              </div>}
              {q.client_phone && <div>
                <div style={{ fontSize:10, color:T.fieldLabel, textTransform:"uppercase", letterSpacing:"0.05em" }}>Telefone</div>
                <div style={{ fontSize:14, color:T.fieldValue, marginTop:2 }}>{q.client_phone}</div>
              </div>}
              {q.client_address && <div style={{ gridColumn:"1 / -1" }}>
                <div style={{ fontSize:10, color:T.fieldLabel, textTransform:"uppercase", letterSpacing:"0.05em" }}>Endereço</div>
                <div style={{ fontSize:14, color:T.fieldValue, marginTop:2 }}>{q.client_address}</div>
              </div>}
            </div>
          </div>

          {/* ITENS */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:T.accent, marginBottom:12 }}>ITENS DO ORÇAMENTO</div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth: isMobile?"500px":"unset" }}>
                <thead>
                  <tr style={{ borderBottom:`1px solid ${T.tableBorder}` }}>
                    {["#","Descrição","Unid.","Qtd.","Preço Unit.","Total"].map(h => (
                      <th key={h} style={{ textAlign: h==="Total"||h==="Preço Unit."?"right":"left", padding:"10px 12px", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", color:T.accent }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(q.items||[]).map((item,idx) => (
                    <tr key={idx} style={{ borderBottom:`1px solid ${T.clientBorder}`, background: idx%2===0?T.tableRowEven:"transparent" }}>
                      <td style={{ padding:"12px", color:T.tableNum, fontSize:12 }}>{idx+1}</td>
                      <td style={{ padding:"12px", fontWeight:500, color:T.tableName }}>{item.name}</td>
                      <td style={{ padding:"12px", color:T.tableExtra, fontSize:13 }}>{item.unit}</td>
                      <td style={{ padding:"12px", color:T.tableExtra, fontSize:13 }}>{item.qty}</td>
                      <td style={{ padding:"12px", textAlign:"right", color:T.tableExtra, fontSize:13 }}>{fmt(item.price)}</td>
                      <td style={{ padding:"12px", textAlign:"right", fontWeight:700, color:T.valueColor }}>
                        {fmt(parseFloat(item.qty)*parseFloat(item.price))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTAIS */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:32 }}>
            <div style={{ background:T.totalBg, border:`1px solid ${T.totalBorder}`, borderRadius:12, padding:"20px 24px", minWidth: isMobile?"100%":"280px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, color:T.subtotalColor, fontSize:14 }}>
                <span>Subtotal</span><span style={{ color:T.totalValue }}>{fmt(sub)}</span>
              </div>
              {q.discount > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, color:T.discountColor, fontSize:14 }}>
                  <span>Desconto ({q.discount}%)</span><span>- {fmt(disc)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:`1px solid ${T.totalDivider}`, paddingTop:12, marginTop:8, fontSize: isMobile?"1rem":"1.2rem", fontWeight:800, color:T.totalFinal }}>
                <span>TOTAL</span><span>{fmt(q.total)}</span>
              </div>
            </div>
          </div>

          {/* CONDIÇÕES */}
          {(q.payment_terms || q.notes) && (
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:20, marginBottom:32 }}>
              {q.payment_terms && (
                <div style={{ background:T.condBg, border:`1px solid ${T.condBorder}`, borderRadius:12, padding:"16px 20px" }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.accent, marginBottom:8 }}>CONDIÇÕES DE PAGAMENTO</div>
                  <div style={{ fontSize:13, color:T.condText, lineHeight:1.6 }}>{q.payment_terms}</div>
                </div>
              )}
              {q.notes && (
                <div style={{ background:T.condBg, border:`1px solid ${T.condBorder}`, borderRadius:12, padding:"16px 20px" }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:T.accent, marginBottom:8 }}>OBSERVAÇÕES</div>
                  <div style={{ fontSize:13, color:T.condText, lineHeight:1.6 }}>{q.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* ASSINATURA */}
          <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:40 }}>
            <div style={{ textAlign:"center", minWidth:200 }}>
              <div style={{ borderTop:`1px solid ${T.signBorder}`, paddingTop:8, marginTop:40 }}>
                <div style={{ fontSize:"1rem", color:T.signName, fontWeight:600 }}>{company.company_name || "Responsável"}</div>
                <div style={{ fontSize:11, color:T.signLabel, marginTop:2 }}>Assinatura</div>
              </div>
            </div>
          </div>

          {/* RODAPÉ */}
          <div style={{ borderTop:`1px solid ${T.footerBorder}`, paddingTop:16, textAlign:"center", fontSize:11, color:T.footerText }}>
            Documento gerado pelo Finance Control — {new Date().toLocaleDateString("pt-BR")}
          </div>

          {/* Gradiente base */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:3, background:T.accentGrad }} />
        </div>
      </div>
    );
  }

  // ══════════════════════
  // VIEW: FORMULÁRIO
  // ══════════════════════
  if (view==="form") {
    return (
      <div style={{ display:"flex", minHeight:"100vh", background:"#020617", color:"#fff", fontFamily:"'Inter','Segoe UI',sans-serif", position:"relative" }}>
        <div style={{ position:"fixed", inset:0, backgroundImage:`url(${worldMap})`, backgroundRepeat:"no-repeat", backgroundPosition:"center", backgroundSize: isMobile?"600px":"1100px", opacity:0.06, pointerEvents:"none", zIndex:0 }} />
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex:1, padding: isMobile?"72px 16px 40px":"32px 36px", overflowY:"auto", position:"relative", zIndex:1 }}>

          <div style={{ marginBottom:24 }}>
            <button style={{ ...btnSecondary, marginBottom:12, fontSize:"0.82rem" }} onClick={() => setView("list")}>← Voltar</button>
            <h1 style={{ fontSize: isMobile?"1.3rem":"1.75rem", fontWeight:700, margin:0, color:"#fff" }}>
              {editing?"Editar Orçamento":"Novo Orçamento"}
            </h1>
            {editing && <p style={{ color:"#64748b", margin:"4px 0 0" }}>{editing.number}</p>}
          </div>

          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom:28 }}>
              <p style={sectionLabelStyle}>👤 Dados do Cliente</p>
              <div style={formCard}>
                <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr 1fr", gap:16 }}>
                  <div style={{ ...field, gridColumn: isMobile?"1":"1 / -1" }}>
                    <label style={label}>Nome do Cliente *</label>
                    <input style={input} required placeholder="Nome completo ou razão social"
                      value={form.client_name} onChange={e => setForm({...form, client_name:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={field}>
                    <label style={label}>CPF / CNPJ</label>
                    <input style={input} placeholder="000.000.000-00"
                      value={form.client_document} onChange={e => setForm({...form, client_document:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={field}>
                    <label style={label}>Telefone</label>
                    <input style={input} placeholder="(44) 99999-9999"
                      value={form.client_phone} onChange={e => setForm({...form, client_phone:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={field}>
                    <label style={label}>E-mail</label>
                    <input style={input} type="email" placeholder="cliente@email.com"
                      value={form.client_email} onChange={e => setForm({...form, client_email:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={{ ...field, gridColumn: isMobile?"1":"2 / -1" }}>
                    <label style={label}>Endereço</label>
                    <input style={input} placeholder="Rua, número, cidade..."
                      value={form.client_address} onChange={e => setForm({...form, client_address:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom:28 }}>
              <p style={sectionLabelStyle}>📋 Condições do Orçamento</p>
              <div style={formCard}>
                <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr 1fr", gap:16 }}>
                  <div style={field}>
                    <label style={label}>Status</label>
                    <select style={selectStyle} value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                      {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div style={field}>
                    <label style={label}>Válido até</label>
                    <input style={input} type="date" value={form.valid_until}
                      onChange={e => setForm({...form, valid_until:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={field}>
                    <label style={label}>Desconto Global (%)</label>
                    <input style={input} type="number" min="0" max="100" step="0.1" placeholder="0"
                      value={form.discount} onChange={e => setForm({...form, discount:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={{ ...field, gridColumn: isMobile?"1":"1 / -1" }}>
                    <label style={label}>Condições de Pagamento</label>
                    <input style={input} placeholder="Ex: 50% na aprovação, 50% na entrega"
                      value={form.payment_terms} onChange={e => setForm({...form, payment_terms:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                  <div style={{ ...field, gridColumn: isMobile?"1":"1 / -1" }}>
                    <label style={label}>Observações</label>
                    <textarea style={{ ...input, resize:"vertical", minHeight:70 }}
                      placeholder="Informações adicionais..."
                      value={form.notes} onChange={e => setForm({...form, notes:e.target.value})}
                      onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                      onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom:28 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <p style={{ ...sectionLabelStyle, marginBottom:0 }}>📦 Itens do Orçamento</p>
                <button type="button" style={{ ...btnSecondary, fontSize:"0.82rem", padding:"7px 14px" }} onClick={addItem}>+ Adicionar Item</button>
              </div>

              {items.length === 0 ? (
                <div style={{ ...formCard, textAlign:"center", color:"#475569", padding:"32px" }}>
                  Nenhum item adicionado. Clique em "+ Adicionar Item".
                </div>
              ) : (
                <div style={formCard}>
                  {!isMobile && (
                    <div style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", color:"#64748b", fontSize:"0.75rem", fontWeight:600, textTransform:"uppercase", marginBottom:12 }}>
                      <span style={{ flex:3 }}>Produto / Serviço</span>
                      <span style={{ flex:1 }}>Unid.</span>
                      <span style={{ flex:1 }}>Qtd.</span>
                      <span style={{ flex:1.5 }}>Preço Unit.</span>
                      <span style={{ flex:1.5 }}>Total</span>
                      <span style={{ width:36 }}></span>
                    </div>
                  )}

                  {items.map((item, idx) => (
                    <div key={idx} style={{ display:"flex", flexDirection: isMobile?"column":"row", gap:10, marginBottom:16, padding: isMobile?"16px":"0", background: isMobile?"rgba(255,255,255,0.03)":"transparent", borderRadius: isMobile?10:0, border: isMobile?"1px solid rgba(255,255,255,0.07)":"none" }}>
                      <div style={{ flex:3 }}>
                        <select style={{ ...selectStyle, marginBottom:4 }}
                          value={item.product_id||""} onChange={e => selectProduct(idx, e.target.value)}>
                          <option value="">— Selecione ou digite —</option>
                          {products.filter(p=>p.active).map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({fmt(p.price)})</option>
                          ))}
                        </select>
                        <input style={{ ...input, fontSize:"0.8rem" }} placeholder="Ou descreva manualmente"
                          value={item.name} onChange={e => updateItem(idx,"name",e.target.value)} />
                      </div>
                      <div style={{ flex:1 }}>
                        {isMobile && <label style={label}>Unid.</label>}
                        <input style={input} value={item.unit} onChange={e => updateItem(idx,"unit",e.target.value)} />
                      </div>
                      <div style={{ flex:1 }}>
                        {isMobile && <label style={label}>Qtd.</label>}
                        <input style={input} type="number" min="1" step="0.01"
                          value={item.qty} onChange={e => updateItem(idx,"qty",e.target.value)} />
                      </div>
                      <div style={{ flex:1.5 }}>
                        {isMobile && <label style={label}>Preço</label>}
                        <input style={input} type="number" min="0" step="0.01"
                          value={item.price} onChange={e => updateItem(idx,"price",e.target.value)} />
                      </div>
                      <div style={{ flex:1.5, color:"#22c55e", fontWeight:700, display:"flex", alignItems:"center", fontSize:"0.95rem" }}>
                        {isMobile && <label style={{ ...label, marginRight:8 }}>Total:</label>}
                        {fmt(parseFloat(item.qty||0)*parseFloat(item.price||0))}
                      </div>
                      <button type="button"
                        style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"5px 9px", cursor:"pointer", color:"#ef4444", width: isMobile?"100%":36, height: isMobile?"auto":36 }}
                        onClick={() => removeItem(idx)}>
                        {isMobile?"Remover item":"✕"}
                      </button>
                    </div>
                  ))}

                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:16, paddingTop:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:"0.95rem" }}>
                      <span style={{ color:"#94a3b8" }}>Subtotal</span><span>{fmt(subtotal)}</span>
                    </div>
                    {parseFloat(form.discount)>0 && (
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, color:"#ef4444", fontSize:"0.95rem" }}>
                        <span>Desconto ({form.discount}%)</span><span>- {fmt(discountAmt)}</span>
                      </div>
                    )}
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:"1.2rem", fontWeight:700, color:"#3b82f6", borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:12, marginTop:4 }}>
                      <span>TOTAL</span><span>{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginBottom:48, flexDirection: isMobile?"column":"row" }}>
              <button type="button" style={{ ...btnSecondary, width: isMobile?"100%":"auto" }} onClick={() => setView("list")}>Cancelar</button>
              <button type="submit" style={{ ...btnPrimary, width: isMobile?"100%":"auto" }}>{editing?"Salvar Alterações":"Criar Orçamento"}</button>
            </div>
          </form>
        </div>
        {toast && <div style={{ ...toastStyle, background: toast.type==="error"?"#ef4444":"#22c55e" }}>{toast.msg}</div>}
      </div>
    );
  }

  // ══════════════════════
  // VIEW: LISTA
  // ══════════════════════
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020617", color:"#fff", fontFamily:"'Inter','Segoe UI',sans-serif", position:"relative" }}>

      <style>{`
        .card3d-q {
          background: rgba(255,255,255,0.02);
          border-radius: 14px; padding: 16px 20px;
          display: flex; align-items: center; gap: 14px;
          backdrop-filter: blur(6px);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          transform: perspective(700px) rotateX(5deg) rotateY(-3deg);
          box-shadow: 0 20px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
          position: relative; overflow: hidden; cursor: default;
        }
        .card3d-q::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
        }
        .card3d-q:hover {
          transform: perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(20px) translateY(-10px);
          box-shadow: 0 36px 72px rgba(0,0,0,0.5);
          background: rgba(255,255,255,0.04);
        }
        .table3d-q {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow-x: auto; -webkit-overflow-scrolling: touch;
          box-shadow: 0 12px 32px rgba(0,0,0,0.3); backdrop-filter: blur(4px);
        }
        @media (max-width: 768px) {
          .card3d-q { transform: none !important; }
          .card3d-q:hover { transform: translateY(-6px) !important; background: rgba(255,255,255,0.04) !important; }
        }
      `}</style>

      <div style={{ position:"fixed", inset:0, backgroundImage:`url(${worldMap})`, backgroundRepeat:"no-repeat", backgroundPosition:"center", backgroundSize: isMobile?"600px":"1100px", opacity:0.07, pointerEvents:"none", zIndex:0 }} />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{ flex:1, padding: isMobile?"72px 16px 40px":"32px 36px", overflowY:"auto", position:"relative", zIndex:1 }}>

        {/* HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <img src={logoGif} alt="logo" style={{ width: isMobile?44:60, height: isMobile?44:60, objectFit:"contain", filter:"drop-shadow(0 0 10px rgba(255,255,255,0.3))" }} />
            <div>
              <h1 style={{ fontSize: isMobile?"20px":"1.75rem", fontWeight:700, margin:0, color:"#fff" }}>Orçamentos</h1>
              <p style={{ color:"#64748b", margin:"4px 0 0", fontSize:"0.85rem" }}>Crie e gerencie seus orçamentos</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button style={{ ...btnSecondary, fontSize:"0.85rem" }} onClick={() => setCompanyModal(true)}>⚙️ {isMobile?"Empresa":"Minha Empresa"}</button>
            <button style={btnPrimary} onClick={openCreate}>+ {isMobile?"Novo":"Novo Orçamento"}</button>
          </div>
        </div>

        {/* CARDS 3D */}
        <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {[
            { icon:"📋", label:"Total",          value:quotes.length,                                                             color:"#3b82f6", border:"rgba(59,130,246,0.2)"  },
            { icon:"✅", label:"Aprovados",      value:quotes.filter(q=>q.status==="approved").length,                           color:"#22c55e", border:"rgba(34,197,94,0.2)"   },
            { icon:"⏳", label:"Pendentes",      value:quotes.filter(q=>q.status==="draft"||q.status==="sent").length,           color:"#f59e0b", border:"rgba(245,158,11,0.2)"  },
            { icon:"💰", label:"Total Aprovado", value:fmt(quotes.filter(q=>q.status==="approved").reduce((s,q)=>s+q.total,0)), color:"#22c55e", border:"rgba(34,197,94,0.2)"   },
          ].map((c,i) => (
            <div key={i} className="card3d-q" style={{ border:`1px solid ${c.border}` }}>
              <div style={{ fontSize:"1.5rem" }}>{c.icon}</div>
              <div>
                <div style={{ color:"#64748b", fontSize:"0.75rem", marginBottom:2 }}>{c.label}</div>
                <div style={{ color:c.color, fontWeight:700, fontSize: isMobile?"0.95rem":"1.1rem" }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          <input style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:"0.88rem", outline:"none", width: isMobile?"100%":"280px", colorScheme:"dark" }}
            type="text" placeholder="🔍 Buscar por cliente ou número..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["all",...Object.keys(STATUS_MAP)].map(s => (
              <button key={s}
                style={{ ...filterBtn, ...(filterStatus===s?filterBtnActive:{}) }}
                onClick={() => setFilterStatus(s)}>
                {s==="all"?"Todos":STATUS_MAP[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA */}
        <div className="table3d-q">
          {filteredQuotes.length === 0 ? (
            <div style={emptyState}><span style={{ fontSize:"2rem" }}>📭</span><p>Nenhum orçamento encontrado</p></div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.88rem", minWidth: isMobile?"520px":"unset" }}>
              <thead>
                <tr>
                  {(isMobile
                    ?["Número","Cliente","Status","Total","Ações"]
                    :["Número","Cliente","Status","Itens","Total","Válido até","Criado em","Ações"]
                  ).map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map(q => {
                  const st = STATUS_MAP[q.status]||STATUS_MAP.draft;
                  return (
                    <tr key={q.id}
                      style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(59,130,246,0.06)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ ...td, fontWeight:700, color:"#60a5fa" }}>{q.number}</td>
                      <td style={td}>
                        <div style={{ fontWeight:600, color:"#e2e8f0" }}>{q.client_name}</div>
                        {!isMobile && q.client_email && <div style={{ fontSize:"0.75rem", color:"#64748b" }}>{q.client_email}</div>}
                      </td>
                      <td style={td}>
                        <select style={{ border:"none", borderRadius:20, padding:"4px 10px", fontSize:"0.75rem", fontWeight:600, cursor:"pointer", colorScheme:"dark", outline:"none", color:st.color, background:st.bg }}
                          value={q.status} onChange={e => changeStatus(q, e.target.value)}>
                          {Object.entries(STATUS_MAP).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                      {!isMobile && <td style={{ ...td, color:"#94a3b8" }}>{(q.items||[]).length} itens</td>}
                      <td style={{ ...td, fontWeight:700, color:"#22c55e" }}>{fmt(q.total)}</td>
                      {!isMobile && <td style={td}>{fmtDate(q.valid_until)}</td>}
                      {!isMobile && <td style={{ ...td, color:"#64748b" }}>{fmtDate(q.created_at)}</td>}
                      <td style={td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button style={btnAction} title="Imprimir" onClick={() => openPrint(q)}>🖨️</button>
                          <button style={btnAction} title="Editar" onClick={() => openEdit(q)}>✏️</button>
                          <button style={{ ...btnAction, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }} title="Excluir" onClick={() => setDeleteConfirm(q)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL EMPRESA */}
      {companyModal && (
        <div style={overlay} onClick={() => setCompanyModal(false)}>
          <div style={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding: isMobile?"24px 20px":32, width: isMobile?"92%":"100%", maxWidth:620, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.6)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={{ margin:0, fontSize:"1.2rem", fontWeight:700 }}>⚙️ Dados da Empresa</h2>
              <button style={btnClose} onClick={() => setCompanyModal(false)}>✕</button>
            </div>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              {logoPreview
                ? <img src={logoPreview} alt="logo" style={{ maxWidth:180, maxHeight:80, objectFit:"contain", borderRadius:8, marginBottom:8 }} />
                : <div style={{ width:180, height:80, background:"rgba(255,255,255,0.06)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", margin:"0 auto 8px" }}>Sem logo</div>
              }
              <br />
              <button style={{ ...btnSecondary, fontSize:"0.82rem" }} onClick={() => logoInputRef.current.click()}>📁 Upload da Logo</button>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleLogoChange} />
              <div style={{ fontSize:"0.75rem", color:"#64748b", marginTop:6 }}>PNG, JPG ou SVG • Máx 2MB</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:16, marginBottom:24 }}>
              <div style={{ ...field, gridColumn:"1 / -1" }}>
                <label style={label}>Nome da Empresa</label>
                <input style={input} placeholder="Sua Empresa LTDA"
                  value={companyForm.company_name||""} onChange={e => setCompanyForm({...companyForm, company_name:e.target.value})}
                  onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
              </div>
              <div style={field}>
                <label style={label}>CNPJ</label>
                <input style={input} placeholder="00.000.000/0001-00"
                  value={companyForm.company_cnpj||""} onChange={e => setCompanyForm({...companyForm, company_cnpj:e.target.value})}
                  onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
              </div>
              <div style={field}>
                <label style={label}>Endereço</label>
                <input style={input} placeholder="Rua, número, cidade - UF"
                  value={companyForm.company_address||""} onChange={e => setCompanyForm({...companyForm, company_address:e.target.value})}
                  onFocus={e=>e.target.style.borderColor="rgba(99,102,241,0.6)"}
                  onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"} />
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:12, flexDirection: isMobile?"column":"row" }}>
              <button style={{ ...btnSecondary, width: isMobile?"100%":"auto" }} onClick={() => setCompanyModal(false)}>Cancelar</button>
              <button style={{ ...btnPrimary, width: isMobile?"100%":"auto" }} onClick={saveCompany}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteConfirm && (
        <div style={overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:18, padding: isMobile?"24px 20px":32, width: isMobile?"92%":"100%", maxWidth:400, boxShadow:"0 25px 60px rgba(0,0,0,0.6)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:"1.1rem", fontWeight:700, color:"#ef4444" }}>Excluir Orçamento</h2>
              <button style={btnClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color:"#94a3b8", marginBottom:24 }}>
              Excluir <strong style={{ color:"#fff" }}>{deleteConfirm.number}</strong> de{" "}
              <strong style={{ color:"#fff" }}>{deleteConfirm.client_name}</strong>?
            </p>
            <div style={{ display:"flex", gap:12, flexDirection: isMobile?"column":"row", justifyContent:"flex-end" }}>
              <button style={{ ...btnSecondary, width: isMobile?"100%":"auto" }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ background:"#ef4444", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer", width: isMobile?"100%":"auto" }} onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ ...toastStyle, background: toast.type==="error"?"#ef4444":"#22c55e", left: isMobile?16:"auto", right: isMobile?16:28, textAlign: isMobile?"center":"left" }}>{toast.msg}</div>}
    </div>
  );
}

// =========================
// ESTILOS
// =========================

const btnPrimary = { background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:600, cursor:"pointer", fontSize:"0.9rem", boxShadow:"0 4px 15px rgba(59,130,246,0.3)", whiteSpace:"nowrap" };
const btnSecondary = { background:"rgba(255,255,255,0.06)", color:"#cbd5e1", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 20px", fontWeight:600, cursor:"pointer", fontSize:"0.9rem" };
const filterBtn = { background:"rgba(255,255,255,0.04)", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"6px 14px", fontSize:"0.82rem", cursor:"pointer" };
const filterBtnActive = { background:"rgba(59,130,246,0.2)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.4)" };
const th = { textAlign:"left", padding:"12px 16px", color:"#64748b", fontWeight:600, fontSize:"0.75rem", textTransform:"uppercase", letterSpacing:"0.05em", background:"rgba(255,255,255,0.02)", borderBottom:"1px solid rgba(255,255,255,0.06)", whiteSpace:"nowrap" };
const td = { padding:"12px 16px", verticalAlign:"middle" };
const btnAction = { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"5px 9px", cursor:"pointer", fontSize:"0.9rem" };
const emptyState = { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", gap:12, color:"#475569" };
const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, backdropFilter:"blur(4px)" };
const btnClose = { background:"rgba(255,255,255,0.08)", border:"none", color:"white", width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:14 };
const field = { display:"flex", flexDirection:"column", gap:6 };
const label = { color:"#94a3b8", fontSize:"0.8rem", fontWeight:600 };
const input = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:"0.9rem", outline:"none", width:"100%", boxSizing:"border-box", transition:"border-color 0.2s", colorScheme:"dark" };
const selectStyle = { background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", color:"#fff", fontSize:"0.9rem", outline:"none", width:"100%", boxSizing:"border-box", colorScheme:"dark", cursor:"pointer" };
const sectionLabelStyle = { fontSize:"11px", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"#475569", margin:"0 0 14px 2px", display:"flex", alignItems:"center", gap:8 };
const formCard = { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24 };
const toastStyle = { position:"fixed", bottom:28, color:"#fff", padding:"12px 22px", borderRadius:12, fontWeight:600, fontSize:"0.9rem", zIndex:9999, boxShadow:"0 8px 30px rgba(0,0,0,0.4)" };