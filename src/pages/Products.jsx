import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import worldMap from "../assets/world-map.svg";
import logoGif from "../assets/video.gif";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
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

const EMPTY_FORM = {
  name: "", description: "", type: "service",
  unit: "un", cost: "", price: "", category: "", active: true,
};

export default function Products() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/products`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.status === 401) { localStorage.removeItem("token"); navigate("/"); return; }
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch { showToast("Erro ao carregar produtos.", "error"); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchProducts(); }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", type: p.type,
      unit: p.unit || "un", cost: p.cost, price: p.price,
      category: p.category || "", active: p.active });
    setModalOpen(true);
  }
  function closeModal() { setModalOpen(false); setEditing(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, cost: parseFloat(form.cost), price: parseFloat(form.price) };
    const url    = editing ? `${API}/products/${editing.id}` : `${API}/products`;
    const method = editing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) { showToast(editing ? "Produto atualizado!" : "Produto criado!"); closeModal(); fetchProducts(); }
      else { const err = await res.json(); showToast(err.msg || "Erro.", "error"); }
    } catch { showToast("Erro de conexão.", "error"); }
  }

  async function handleToggle(p) {
    await fetch(`${API}/products/${p.id}/toggle`, {
      method: "PATCH", headers: { Authorization: `Bearer ${token()}` },
    });
    fetchProducts();
  }

  async function handleDelete(id) {
    const res = await fetch(`${API}/products/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token()}` },
    });
    if (res.ok) { showToast("Produto removido."); setDeleteConfirm(null); fetchProducts(); }
    else showToast("Erro ao remover.", "error");
  }

  const filtered = products.filter(p => {
    const typeOk   = filterType === "all" || p.type === filterType;
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase()) ||
                     (p.category || "").toLowerCase().includes(search.toLowerCase());
    return typeOk && searchOk;
  });

  const totalProducts = products.filter(p => p.type === "product").length;
  const totalServices = products.filter(p => p.type === "service").length;
  const avgMargin     = products.length
    ? (products.reduce((s, p) => s + p.margin, 0) / products.length).toFixed(1) : 0;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#020617", color:"#fff", fontFamily:"'Inter','Segoe UI',sans-serif", position:"relative" }}>

      <style>{`
        .card3d-p {
          background: rgba(255,255,255,0.02);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          backdrop-filter: blur(6px);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          transform: perspective(700px) rotateX(5deg) rotateY(-3deg);
          box-shadow: 0 20px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04);
          position: relative;
          overflow: hidden;
          cursor: default;
        }
        .card3d-p::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .card3d-p:hover {
          transform: perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(20px) translateY(-10px);
          box-shadow: 0 36px 72px rgba(0,0,0,0.5);
          background: rgba(255,255,255,0.04);
        }
        .table3d-p {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          box-shadow: 0 12px 32px rgba(0,0,0,0.3);
          backdrop-filter: blur(4px);
        }
        .prod-row:hover { background: rgba(59,130,246,0.06) !important; }
        @media (max-width: 768px) {
          .card3d-p { transform: none !important; }
          .card3d-p:hover { transform: translateY(-6px) !important; background: rgba(255,255,255,0.04) !important; }
          .table3d-p { transform: none !important; }
        }
      `}</style>

      {/* MAPA FUNDO */}
      <div style={{
        position:"fixed", inset:0,
        backgroundImage:`url(${worldMap})`,
        backgroundRepeat:"no-repeat",
        backgroundPosition:"center",
        backgroundSize: isMobile?"600px":"1100px",
        opacity:0.07, pointerEvents:"none", zIndex:0
      }} />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{
        flex:1,
        padding: isMobile?"72px 16px 40px":"32px 36px",
        overflowY:"auto", position:"relative", zIndex:1
      }}>

        {/* HEADER */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <img src={logoGif} alt="logo" style={{
              width: isMobile?44:60, height: isMobile?44:60,
              objectFit:"contain",
              filter:"drop-shadow(0 0 10px rgba(255,255,255,0.3))"
            }} />
            <div>
              <h1 style={{
                fontSize: isMobile?"20px":"1.75rem",
                fontWeight: 700,
                margin: 0,
                color: "#ffffff",
                letterSpacing: "-0.3px"
              }}>
                Produtos & Serviços
              </h1>
              <p style={{ color:"#64748b", margin:"4px 0 0", fontSize:"0.85rem" }}>
                Cadastre itens para usar nos orçamentos
              </p>
            </div>
          </div>
          <button style={btnPrimary} onClick={openCreate}>+ Novo Item</button>
        </div>

        {/* CARDS 3D */}
        <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr 1fr":"repeat(4,1fr)", gap:16, marginBottom:28 }}>
          {[
            { icon:"📦", label:"Produtos",     value:totalProducts,                       color:"#3b82f6", border:"rgba(59,130,246,0.2)"  },
            { icon:"⚙️", label:"Serviços",     value:totalServices,                       color:"#a855f7", border:"rgba(168,85,247,0.2)"  },
            { icon:"📊", label:"Margem Média", value:`${avgMargin}%`,                     color:"#22c55e", border:"rgba(34,197,94,0.2)"   },
            { icon:"✅", label:"Ativos",       value:products.filter(p=>p.active).length, color:"#f59e0b", border:"rgba(245,158,11,0.2)"  },
          ].map((c,i) => (
            <div key={i} className="card3d-p" style={{ border:`1px solid ${c.border}` }}>
              <div style={{ fontSize:"1.5rem" }}>{c.icon}</div>
              <div>
                <div style={{ color:"#64748b", fontSize:"0.75rem", marginBottom:2 }}>{c.label}</div>
                <div style={{ color:c.color, fontWeight:700, fontSize: isMobile?"1rem":"1.15rem" }}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* FILTROS */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
          <input
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"8px 14px", color:"#fff", fontSize:"0.88rem", outline:"none", width: isMobile?"100%":"280px", colorScheme:"dark" }}
            type="text" placeholder="🔍 Buscar por nome ou categoria..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {["all","product","service"].map(f => (
              <button key={f}
                style={{ ...filterBtn, ...(filterType===f ? filterBtnActive : {}) }}
                onClick={() => setFilterType(f)}>
                {f==="all"?"Todos":f==="product"?"📦 Produtos":"⚙️ Serviços"}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA */}
        <div className="table3d-p">
          {loading ? (
            <div style={emptyState}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={emptyState}><span style={{ fontSize:"2rem" }}>📭</span><p>Nenhum item encontrado</p></div>
          ) : (
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.88rem", minWidth: isMobile?"600px":"unset" }}>
              <thead>
                <tr>
                  {(isMobile
                    ? ["Nome","Tipo","Preço","Margem","Ações"]
                    : ["Nome","Tipo","Unid.","Custo","Preço","Lucro","Margem","Categoria","Status","Ações"]
                  ).map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="prod-row"
                    style={{ borderBottom:"1px solid rgba(255,255,255,0.04)", transition:"background 0.15s" }}>
                    <td style={td}>
                      <div style={{ fontWeight:600, color:"#e2e8f0" }}>{p.name}</div>
                      {!isMobile && p.description && <div style={{ fontSize:"0.75rem", color:"#64748b" }}>{p.description}</div>}
                    </td>
                    <td style={td}>
                      <span style={{
                        display:"inline-block", padding:"3px 8px", borderRadius:20,
                        fontSize:"0.72rem", fontWeight:600,
                        background: p.type==="product"?"rgba(59,130,246,0.12)":"rgba(168,85,247,0.12)",
                        color: p.type==="product"?"#3b82f6":"#a855f7"
                      }}>
                        {p.type==="product"?"📦":"⚙️"}{!isMobile&&(p.type==="product"?" Produto":" Serviço")}
                      </span>
                    </td>
                    {!isMobile && <td style={{ ...td, color:"#94a3b8" }}>{p.unit}</td>}
                    {!isMobile && <td style={td}>{fmt(p.cost)}</td>}
                    <td style={{ ...td, fontWeight:600 }}>{fmt(p.price)}</td>
                    {!isMobile && <td style={{ ...td, color:"#22c55e" }}>{fmt(p.profit)}</td>}
                    <td style={td}>
                      <span style={{
                        display:"inline-block", padding:"3px 8px", borderRadius:20,
                        fontSize:"0.72rem", fontWeight:600,
                        background: p.margin>=30?"rgba(34,197,94,0.12)":"rgba(245,158,11,0.12)",
                        color: p.margin>=30?"#22c55e":"#f59e0b"
                      }}>
                        {p.margin}%
                      </span>
                    </td>
                    {!isMobile && <td style={{ ...td, color:"#94a3b8" }}>{p.category||"—"}</td>}
                    {!isMobile && (
                      <td style={td}>
                        <button style={{
                          display:"inline-block", padding:"3px 10px", borderRadius:20,
                          fontSize:"0.75rem", fontWeight:600, cursor:"pointer", border:"none",
                          background: p.active?"rgba(34,197,94,0.12)":"rgba(100,116,139,0.12)",
                          color: p.active?"#22c55e":"#64748b"
                        }} onClick={() => handleToggle(p)}>
                          {p.active?"Ativo":"Inativo"}
                        </button>
                      </td>
                    )}
                    <td style={td}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button style={btnAction} onClick={() => openEdit(p)}>✏️</button>
                        <button style={{ ...btnAction, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }} onClick={() => setDeleteConfirm(p)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL CRIAR/EDITAR */}
      {modalOpen && (
        <div style={overlay} onClick={closeModal}>
          <div style={{
            background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:18, padding: isMobile?"24px 20px":32,
            width: isMobile?"92%":"100%", maxWidth:620,
            maxHeight:"90vh", overflowY:"auto",
            boxShadow:"0 25px 60px rgba(0,0,0,0.6)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={{ margin:0, fontSize:"1.2rem", fontWeight:700 }}>
                {editing?"✏️ Editar Item":"➕ Novo Item"}
              </h2>
              <button style={btnClose} onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:"grid", gridTemplateColumns: isMobile?"1fr":"1fr 1fr", gap:16, marginBottom:24 }}>

                <div style={{ ...field, gridColumn:"1 / -1" }}>
                  <label style={label}>Nome *</label>
                  <input style={input} required placeholder="Nome do produto ou serviço"
                    value={form.name} onChange={e => setForm({...form, name:e.target.value})}
                    onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                </div>

                <div style={field}>
                  <label style={label}>Tipo *</label>
                  <select style={selectStyle} value={form.type} onChange={e => setForm({...form, type:e.target.value})}>
                    <option value="service">⚙️ Serviço</option>
                    <option value="product">📦 Produto</option>
                  </select>
                </div>

                <div style={field}>
                  <label style={label}>Unidade</label>
                  <select style={selectStyle} value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}>
                    {["un","hr","kg","g","m","m²","m³","L","cx","pc","par","vb"].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div style={field}>
                  <label style={label}>Custo (R$)</label>
                  <input style={input} type="number" step="0.01" min="0" placeholder="0,00"
                    value={form.cost} onChange={e => setForm({...form, cost:e.target.value})}
                    onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                </div>

                <div style={field}>
                  <label style={label}>Preço de Venda (R$) *</label>
                  <input style={input} type="number" step="0.01" min="0" required placeholder="0,00"
                    value={form.price} onChange={e => setForm({...form, price:e.target.value})}
                    onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                </div>

                {form.price > 0 && (
                  <div style={{ ...field, gridColumn:"1 / -1" }}>
                    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 16px", display:"flex", gap:24, fontSize:"0.88rem", color:"#94a3b8", flexWrap:"wrap" }}>
                      <span>💡 Lucro: <strong style={{ color:"#22c55e" }}>{fmt((parseFloat(form.price)||0)-(parseFloat(form.cost)||0))}</strong></span>
                      <span>Margem: <strong style={{ color:"#f59e0b" }}>
                        {form.price>0?(((parseFloat(form.price)-parseFloat(form.cost||0))/parseFloat(form.price))*100).toFixed(1):0}%
                      </strong></span>
                    </div>
                  </div>
                )}

                <div style={{ ...field, gridColumn:"1 / -1" }}>
                  <label style={label}>Categoria</label>
                  <input style={input} placeholder="Ex: Mão de obra, Elétrica, TI..."
                    value={form.category} onChange={e => setForm({...form, category:e.target.value})}
                    onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                </div>

                <div style={{ ...field, gridColumn:"1 / -1" }}>
                  <label style={label}>Descrição</label>
                  <textarea style={{ ...input, resize:"vertical", minHeight:70 }}
                    placeholder="Detalhes do produto ou serviço..."
                    value={form.description} onChange={e => setForm({...form, description:e.target.value})}
                    onFocus={e => e.target.style.borderColor="rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.1)"} />
                </div>

              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", gap:12, flexDirection: isMobile?"column":"row" }}>
                <button type="button" style={{ ...btnSecondary, width: isMobile?"100%":"auto" }} onClick={closeModal}>Cancelar</button>
                <button type="submit" style={{ ...btnPrimary, width: isMobile?"100%":"auto" }}>{editing?"Salvar Alterações":"Criar Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteConfirm && (
        <div style={overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{
            background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:18, padding: isMobile?"24px 20px":32,
            width: isMobile?"92%":"100%", maxWidth:400,
            boxShadow:"0 25px 60px rgba(0,0,0,0.6)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ margin:0, fontSize:"1.1rem", fontWeight:700, color:"#ef4444" }}>Excluir Item</h2>
              <button style={btnClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color:"#94a3b8", marginBottom:24 }}>
              Excluir <strong style={{ color:"#fff" }}>"{deleteConfirm.name}"</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display:"flex", gap:12, flexDirection: isMobile?"column":"row", justifyContent:"flex-end" }}>
              <button style={{ ...btnSecondary, width: isMobile?"100%":"auto" }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ background:"#ef4444", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", fontWeight:700, cursor:"pointer", width: isMobile?"100%":"auto" }} onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position:"fixed", bottom: isMobile?16:28, right: isMobile?16:28,
          left: isMobile?16:"auto", color:"#fff",
          padding:"12px 22px", borderRadius:12, fontWeight:600,
          fontSize:"0.9rem", zIndex:9999,
          boxShadow:"0 8px 30px rgba(0,0,0,0.4)",
          background: toast.type==="error"?"#ef4444":"#22c55e",
          textAlign: isMobile?"center":"left"
        }}>
          {toast.msg}
        </div>
      )}
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