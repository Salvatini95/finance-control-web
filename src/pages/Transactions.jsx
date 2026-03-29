import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import worldMap from "../assets/world-map.svg";
import logoGif from "../assets/video.gif";

const API_URL = "http://localhost:5000/api";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function Transactions() {

  const isMobile = useIsMobile();

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({
    description: "", amount: "", type: "income", category: "", date: ""
  });
  const [showForm, setShowForm] = useState(false);
  const [newForm, setNewForm] = useState({
    description: "", amount: "", type: "income", category: "", date: ""
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    if (!token) { navigate("/"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setTransactions(list);
      setFiltered(list);
    } catch (err) {
      setTransactions([]); setFiltered([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, []);

  useEffect(() => {
    let result = [...transactions];
    if (searchText) {
      result = result.filter(t =>
        t.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filterType) result = result.filter(t => t.type === filterType);
    if (filterMonth) result = result.filter(t => t.date?.substring(5, 7) === filterMonth);
    result.sort((a, b) => {
      let valA = a[sortField] ?? "", valB = b[sortField] ?? "";
      if (sortField === "amount") { valA = Number(valA); valB = Number(valB); }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    setFiltered(result);
  }, [searchText, filterType, filterMonth, sortField, sortDir, transactions]);

  const handleNewSubmit = async (e) => {
    e.preventDefault();
    if (!newForm.description || !newForm.amount || !newForm.date) {
      alert("Preencha todos os campos obrigatórios!"); return;
    }
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          description: newForm.description, amount: Number(newForm.amount),
          type: newForm.type, category: newForm.category, date: newForm.date
        })
      });
      if (res.ok) {
        setNewForm({ description: "", amount: "", type: "income", category: "", date: "" });
        setShowForm(false);
        fetchTransactions();
      } else {
        const data = await res.json();
        alert(data.msg || "Erro ao criar transação");
      }
    } catch (err) { alert("Erro de conexão com servidor"); }
  };

  const deleteTransaction = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
    } catch (err) { console.error(err); }
  };

  const openEdit = (t) => {
    setEditingTransaction(t);
    setEditForm({ description: t.description, amount: t.amount, type: t.type, category: t.category || "", date: t.date || "" });
  };

  const closeEdit = () => setEditingTransaction(null);

  const saveEdit = async () => {
    if (!editForm.description || !editForm.amount || !editForm.date) {
      alert("Preencha todos os campos obrigatórios!"); return;
    }
    try {
      const res = await fetch(`${API_URL}/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          description: editForm.description, amount: Number(editForm.amount),
          type: editForm.type, category: editForm.category, date: editForm.date
        })
      });
      if (res.ok) { closeEdit(); fetchTransactions(); }
      else { const data = await res.json(); alert(data.msg || "Erro ao salvar"); }
    } catch (err) { alert("Erro de conexão com servidor"); }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const totalIncome  = filtered.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d) => {
    if (!d) return "-";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  return (
    <div style={{
      display: "flex",
      background: "#020617",
      color: "white",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      position: "relative"
    }}>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .card3d-t {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 22px 20px;
          cursor: default;
          transition: transform 0.35s ease, box-shadow 0.35s ease, background 0.35s ease;
          transform: perspective(800px) rotateX(3deg) rotateY(-1.5deg);
          box-shadow: 0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
          animation: fadeSlideUp 0.5s ease forwards;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }
        .card3d-t::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
        }
        .card3d-t:hover {
          transform: perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(20px) translateY(-8px);
          box-shadow: 0 36px 72px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
        }
        .card3d-income-t  { border-top: 2px solid rgba(34,197,94,0.6); }
        .card3d-expense-t { border-top: 2px solid rgba(239,68,68,0.6); }
        .card3d-balance-t { border-top: 2px solid rgba(99,102,241,0.6); }

        .table3d {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 12px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(6px);
        }
        .table3d:hover {
          box-shadow: 0 24px 48px rgba(0,0,0,0.5);
        }

        .form3d {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.4);
          backdrop-filter: blur(6px);
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .card3d-t {
            transform: none !important;
          }
          .card3d-t:hover {
            transform: translateY(-4px) !important;
          }
          .table3d {
            transform: none !important;
          }
          .form-grid-mobile {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          .form-grid-mobile input,
          .form-grid-mobile select,
          .form-grid-mobile button {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .filters-mobile {
            flex-direction: column !important;
          }
          .filters-mobile input,
          .filters-mobile select {
            min-width: unset !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* MAPA FUNDO */}
      <div style={{
        position: "fixed", inset: 0,
        backgroundImage: `url(${worldMap})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: isMobile ? "600px" : "1100px",
        opacity: 0.06,
        pointerEvents: "none",
        zIndex: 0
      }} />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{
        flex: 1,
        padding: isMobile ? "72px 16px 40px" : "40px",
        overflow: "auto",
        position: "relative",
        zIndex: 1
      }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src={logoGif} alt="logo" style={{
              width: isMobile ? 44 : 60,
              height: isMobile ? 44 : 60,
              objectFit: "contain",
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))"
            }} />
            <div>
              <h1 style={{
                fontSize: isMobile ? "22px" : "28px",
                fontWeight: 700, margin: 0, letterSpacing: "-0.5px"
              }}>Transações</h1>
              <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
                {filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              border: "none", color: "white",
              padding: isMobile ? "10px 16px" : "12px 20px",
              borderRadius: "10px", cursor: "pointer",
              fontSize: "14px", fontWeight: "600",
              boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
              whiteSpace: "nowrap"
            }}
          >
            {showForm ? "✕ Fechar" : "+ Nova Transação"}
          </button>
        </div>

        {/* FORMULÁRIO */}
        {showForm && (
          <div className="form3d">
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 20px 0", color: "white" }}>
              ➕ Nova Transação
            </h3>
            <form
              onSubmit={handleNewSubmit}
              className={isMobile ? "form-grid-mobile" : ""}
              style={isMobile ? {} : {
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                gap: "16px", alignItems: "start"
              }}
            >
              <div style={fieldGroup}>
                <label style={modalLabel}>Descrição</label>
                <input type="text" placeholder="Ex: Salário, Aluguel..."
                  value={newForm.description}
                  onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  style={modalInput} required />
              </div>
              <div style={fieldGroup}>
                <label style={modalLabel}>Valor (R$)</label>
                <input type="number" step="0.01" placeholder="0,00"
                  value={newForm.amount}
                  onChange={e => setNewForm({ ...newForm, amount: e.target.value })}
                  style={modalInput} required />
              </div>
              <div style={fieldGroup}>
                <label style={modalLabel}>Tipo</label>
                <select value={newForm.type}
                  onChange={e => setNewForm({ ...newForm, type: e.target.value })}
                  style={modalInput}>
                  <option value="income">Entrada</option>
                  <option value="expense">Saída</option>
                </select>
              </div>
              <div style={fieldGroup}>
                <label style={modalLabel}>Categoria</label>
                <input type="text" placeholder="Ex: Alimentação"
                  value={newForm.category}
                  onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                  style={modalInput} />
              </div>
              <div style={fieldGroup}>
                <label style={modalLabel}>Data</label>
                <input type="date" value={newForm.date}
                  onChange={e => setNewForm({ ...newForm, date: e.target.value })}
                  style={modalInput} required />
              </div>
              <div style={{ display: "flex", alignItems: isMobile ? "stretch" : "flex-end" }}>
                <button type="submit" style={{
                  ...saveBtn,
                  width: isMobile ? "100%" : "auto"
                }}>Salvar</button>
              </div>
            </form>
          </div>
        )}

        {/* CARDS 3D */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
          gap: 16,
          marginBottom: 28
        }}>
          <div className="card3d-t card3d-income-t">
            <div style={cardIcon}>📈</div>
            <span style={cardLabel}>Total Entradas</span>
            <h2 style={{ color:"#22c55e", margin:"8px 0 4px", fontSize: isMobile?20:22, fontWeight:700 }}>
              {fmt(totalIncome)}
            </h2>
            <span style={cardSub}>{filtered.filter(t=>t.type==="income").length} entradas</span>
          </div>

          <div className="card3d-t card3d-expense-t">
            <div style={cardIcon}>📉</div>
            <span style={cardLabel}>Total Saídas</span>
            <h2 style={{ color:"#ef4444", margin:"8px 0 4px", fontSize: isMobile?20:22, fontWeight:700 }}>
              {fmt(totalExpense)}
            </h2>
            <span style={cardSub}>{filtered.filter(t=>t.type==="expense").length} saídas</span>
          </div>

          <div className="card3d-t card3d-balance-t">
            <div style={cardIcon}>💰</div>
            <span style={cardLabel}>Saldo do Período</span>
            <h2 style={{ color: totalBalance>=0?"#22c55e":"#ef4444", margin:"8px 0 4px", fontSize: isMobile?20:22, fontWeight:700 }}>
              {fmt(totalBalance)}
            </h2>
            <span style={cardSub}>{filtered.length} transações no total</span>
          </div>
        </div>

        {/* FILTROS */}
        <div className={isMobile ? "filters-mobile" : ""}
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
            alignItems: "center"
          }}
        >
          <input
            type="text" placeholder="🔍 Buscar descrição ou categoria..."
            value={searchText} onChange={e => setSearchText(e.target.value)}
            style={{ ...inputStyle, minWidth: isMobile ? "unset" : "200px", width: isMobile ? "100%" : "auto" }}
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ ...inputStyle, minWidth: isMobile ? "unset" : "160px", width: isMobile ? "100%" : "auto" }}>
            <option value="">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            style={{ ...inputStyle, minWidth: isMobile ? "unset" : "160px", width: isMobile ? "100%" : "auto" }}>
            <option value="">Todos os meses</option>
            {["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
              "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
            ].map((m, i) => (
              <option key={i} value={String(i+1).padStart(2,"0")}>{m}</option>
            ))}
          </select>
          {(searchText || filterType || filterMonth) && (
            <button onClick={() => { setSearchText(""); setFilterType(""); setFilterMonth(""); }}
              style={{ ...clearBtn, width: isMobile ? "100%" : "auto" }}>
              ✕ Limpar filtros
            </button>
          )}
        </div>

        {/* TABELA */}
        <div className="table3d">
          {loading ? (
            <div style={emptyState}>Carregando transações...</div>
          ) : filtered.length === 0 ? (
            <div style={emptyState}>Nenhuma transação encontrada.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "600px" : "unset" }}>
              <thead>
                <tr>
                  <th style={th} onClick={() => handleSort("date")}>Data {sortIcon("date")}</th>
                  <th style={th} onClick={() => handleSort("description")}>Descrição {sortIcon("description")}</th>
                  {!isMobile && <th style={th} onClick={() => handleSort("category")}>Categoria {sortIcon("category")}</th>}
                  <th style={th} onClick={() => handleSort("type")}>Tipo {sortIcon("type")}</th>
                  <th style={{ ...th, textAlign: "right" }} onClick={() => handleSort("amount")}>Valor {sortIcon("amount")}</th>
                  <th style={{ ...th, textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, index) => (
                  <tr
                    key={t.id}
                    style={{ transition: "background 0.15s", background: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                  >
                    <td style={td}>{fmtDate(t.date)}</td>
                    <td style={{ ...td, maxWidth: isMobile ? "120px" : "none", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {t.description}
                    </td>
                    {!isMobile && (
                      <td style={td}>
                        <span style={categoryBadge}>{t.category || "—"}</span>
                      </td>
                    )}
                    <td style={td}>
                      <span style={{
                        padding: "3px 8px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                        background: t.type === "income" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        color: t.type === "income" ? "#22c55e" : "#ef4444",
                        border: `1px solid ${t.type === "income" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                        whiteSpace: "nowrap"
                      }}>
                        {t.type === "income" ? "↑" : "↓"}{!isMobile && (t.type === "income" ? " Entrada" : " Saída")}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>
                      <span style={{ color: t.type === "income" ? "#22c55e" : "#ef4444", whiteSpace: "nowrap" }}>
                        {t.type === "expense" ? "-" : "+"}{fmt(t.amount)}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                        <button onClick={() => openEdit(t)} style={editBtn} title="Editar">✏️</button>
                        <button onClick={() => deleteTransaction(t.id)} style={deleteBtn} title="Excluir">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* MODAL EDIÇÃO */}
      {editingTransaction && (
        <div style={modalOverlay} onClick={closeEdit}>
          <div style={{
            ...modalBox,
            width: isMobile ? "92%" : "100%",
            padding: isMobile ? "24px 20px" : "32px",
            maxHeight: "90vh",
            overflowY: "auto"
          }} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>✏️ Editar Transação</h3>
              <button onClick={closeEdit} style={modalCloseBtn}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={fieldGroup}>
                <label style={modalLabel}>Descrição</label>
                <input type="text" value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  style={modalInput} />
              </div>
              <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Valor (R$)</label>
                  <input type="number" step="0.01" value={editForm.amount}
                    onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                    style={modalInput} />
                </div>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Tipo</label>
                  <select value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    style={modalInput}>
                    <option value="income">Entrada</option>
                    <option value="expense">Saída</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16, flexDirection: isMobile ? "column" : "row" }}>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Categoria</label>
                  <input type="text" value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    style={modalInput} />
                </div>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Data</label>
                  <input type="date" value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    style={modalInput} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28, flexDirection: isMobile ? "column" : "row" }}>
              <button onClick={closeEdit} style={{ ...cancelBtn, width: isMobile ? "100%" : "auto" }}>Cancelar</button>
              <button onClick={saveEdit} style={{ ...saveBtn, width: isMobile ? "100%" : "auto" }}>Salvar alterações</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// =========================
// ESTILOS
// =========================

const cardIcon = { fontSize: 20, marginBottom: 6 };
const cardLabel = { fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 };
const cardSub = { fontSize: 12, color: "#475569", marginTop: 2, display: "block" };

const inputStyle = {
  background: "#020617", color: "#fff",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "10px 14px", borderRadius: "8px",
  fontSize: "14px", outline: "none",
  colorScheme: "dark"
};

const clearBtn = {
  background: "rgba(239,68,68,0.15)", color: "#ef4444",
  border: "1px solid rgba(239,68,68,0.3)",
  padding: "10px 16px", borderRadius: "8px",
  cursor: "pointer", fontSize: "13px"
};

const th = {
  padding: "14px 16px", textAlign: "left",
  fontSize: "12px", fontWeight: "600", color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.5px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  cursor: "pointer", userSelect: "none", whiteSpace: "nowrap"
};

const td = {
  padding: "12px 16px", fontSize: "13px",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
  whiteSpace: "nowrap"
};

const categoryBadge = {
  background: "rgba(255,255,255,0.08)",
  padding: "3px 10px", borderRadius: "20px", fontSize: "12px"
};

const editBtn = {
  background: "rgba(59,130,246,0.1)",
  border: "1px solid rgba(59,130,246,0.2)",
  borderRadius: "6px", padding: "6px 10px",
  cursor: "pointer", fontSize: "14px"
};

const deleteBtn = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.2)",
  borderRadius: "6px", padding: "6px 10px",
  cursor: "pointer", fontSize: "14px"
};

const emptyState = { padding: "60px", textAlign: "center", color: "#64748b", fontSize: "15px" };

const modalOverlay = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center",
  justifyContent: "center", zIndex: 1000
};

const modalBox = {
  background: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "16px", maxWidth: "520px",
  boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
};

const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" };
const modalTitle = { fontSize: "18px", fontWeight: "700", margin: 0 };
const modalCloseBtn = { background: "rgba(255,255,255,0.08)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" };
const fieldGroup = { display: "flex", flexDirection: "column", gap: "8px", flex: 1 };
const modalLabel = { fontSize: "13px", fontWeight: "500", color: "#94a3b8" };
const modalInput = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", colorScheme: "dark" };
const cancelBtn = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" };
const saveBtn = { background: "linear-gradient(135deg, #4f46e5, #6366f1)", border: "none", color: "white", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" };

export default Transactions;