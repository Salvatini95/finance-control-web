import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

function Transactions() {

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
    description: "",
    amount: "",
    type: "income",
    category: "",
    date: ""
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
      console.error("Erro ao buscar transações:", err);
      setTransactions([]);
      setFiltered([]);
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
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";
      if (sortField === "amount") { valA = Number(valA); valB = Number(valB); }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    setFiltered(result);
  }, [searchText, filterType, filterMonth, sortField, sortDir, transactions]);

  const deleteTransaction = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTransactions();
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  const openEdit = (t) => {
    setEditingTransaction(t);
    setEditForm({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category || "",
      date: t.date || ""
    });
  };

  const closeEdit = () => setEditingTransaction(null);

  const saveEdit = async () => {
    if (!editForm.description || !editForm.amount || !editForm.date) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/transactions/${editingTransaction.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description: editForm.description,
          amount: Number(editForm.amount),
          type: editForm.type,
          category: editForm.category,
          date: editForm.date
        })
      });
      if (res.ok) {
        closeEdit();
        fetchTransactions();
      } else {
        const data = await res.json();
        alert(data.msg || "Erro ao salvar");
      }
    } catch (err) {
      console.error("Erro ao editar:", err);
      alert("Erro de conexão com servidor");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortIcon = (field) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const totalIncome = filtered.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  const formatCurrency = (value) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div style={container}>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={main}>

        <div style={header}>
          <div>
            <h1 style={title}>Transações</h1>
            <p style={subtitle}>
              {filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div style={cardsRow}>
          <div style={summaryCard}>
            <span style={cardLabel}>Total Entradas</span>
            <span style={{ ...cardValue, color: "#22c55e" }}>{formatCurrency(totalIncome)}</span>
          </div>
          <div style={summaryCard}>
            <span style={cardLabel}>Total Saídas</span>
            <span style={{ ...cardValue, color: "#ef4444" }}>{formatCurrency(totalExpense)}</span>
          </div>
          <div style={summaryCard}>
            <span style={cardLabel}>Saldo do Período</span>
            <span style={{ ...cardValue, color: totalBalance >= 0 ? "#22c55e" : "#ef4444" }}>
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>

        <div style={filtersRow}>
          <input
            type="text"
            placeholder="🔍 Buscar por descrição ou categoria..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={inputStyle}
          />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={inputStyle}>
            <option value="">Todos os tipos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={inputStyle}>
            <option value="">Todos os meses</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
          {(searchText || filterType || filterMonth) && (
            <button onClick={() => { setSearchText(""); setFilterType(""); setFilterMonth(""); }} style={clearBtn}>
              ✕ Limpar filtros
            </button>
          )}
        </div>

        <div style={tableWrapper}>
          {loading ? (
            <div style={emptyState}>Carregando transações...</div>
          ) : filtered.length === 0 ? (
            <div style={emptyState}>Nenhuma transação encontrada.</div>
          ) : (
            <table style={table}>
              <thead>
                <tr>
                  <th style={th} onClick={() => handleSort("date")}>Data {sortIcon("date")}</th>
                  <th style={th} onClick={() => handleSort("description")}>Descrição {sortIcon("description")}</th>
                  <th style={th} onClick={() => handleSort("category")}>Categoria {sortIcon("category")}</th>
                  <th style={th} onClick={() => handleSort("type")}>Tipo {sortIcon("type")}</th>
                  <th style={{ ...th, textAlign: "right" }} onClick={() => handleSort("amount")}>Valor {sortIcon("amount")}</th>
                  <th style={{ ...th, textAlign: "center" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, index) => (
                  <tr
                    key={t.id}
                    style={{ ...tableRow, background: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = index % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"}
                  >
                    <td style={td}>{formatDate(t.date)}</td>
                    <td style={td}>{t.description}</td>
                    <td style={td}><span style={categoryBadge}>{t.category || "—"}</span></td>
                    <td style={td}>
                      <span style={{
                        ...typeBadge,
                        background: t.type === "income" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                        color: t.type === "income" ? "#22c55e" : "#ef4444",
                        border: `1px solid ${t.type === "income" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`
                      }}>
                        {t.type === "income" ? "↑ Entrada" : "↓ Saída"}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right", fontWeight: "600" }}>
                      <span style={{ color: t.type === "income" ? "#22c55e" : "#ef4444" }}>
                        {t.type === "expense" ? "- " : "+ "}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>
                      <div style={actionsCell}>
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

      {editingTransaction && (
        <div style={modalOverlay} onClick={closeEdit}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={modalHeader}>
              <h3 style={modalTitle}>✏️ Editar Transação</h3>
              <button onClick={closeEdit} style={modalCloseBtn}>✕</button>
            </div>
            <div style={modalBody}>
              <div style={fieldGroup}>
                <label style={modalLabel}>Descrição</label>
                <input type="text" value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  style={modalInput} placeholder="Descrição da transação" />
              </div>
              <div style={fieldRow}>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Valor (R$)</label>
                  <input type="number" step="0.01" value={editForm.amount}
                    onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                    style={modalInput} placeholder="0,00" />
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
              <div style={fieldRow}>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Categoria</label>
                  <input type="text" value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    style={modalInput} placeholder="Ex: Alimentação" />
                </div>
                <div style={fieldGroup}>
                  <label style={modalLabel}>Data</label>
                  <input type="date" value={editForm.date}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                    style={modalInput} />
                </div>
              </div>
            </div>
            <div style={modalFooter}>
              <button onClick={closeEdit} style={cancelBtn}>Cancelar</button>
              <button onClick={saveEdit} style={saveBtn}>Salvar alterações</button>
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

const container = { display: "flex", background: "#020617", color: "white", minHeight: "100vh", fontFamily: "'Inter', sans-serif" };
const main = { flex: 1, padding: "40px", overflow: "auto" };
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" };
const title = { fontSize: "28px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px" };
const subtitle = { color: "#64748b", fontSize: "14px", margin: "6px 0 0 0" };
const cardsRow = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" };
const summaryCard = { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px" };
const cardLabel = { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" };
const cardValue = { fontSize: "22px", fontWeight: "700" };
const filtersRow = { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" };
const inputStyle = { background: "#020617", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 14px", borderRadius: "8px", fontSize: "14px", outline: "none", minWidth: "200px", colorScheme: "dark" };
const clearBtn = { background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" };
const tableWrapper = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflow: "hidden" };
const table = { width: "100%", borderCollapse: "collapse" };
const th = { padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" };
const tableRow = { transition: "background 0.15s ease" };
const td = { padding: "14px 16px", fontSize: "14px", borderBottom: "1px solid rgba(255,255,255,0.04)", whiteSpace: "nowrap" };
const categoryBadge = { background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: "20px", fontSize: "12px" };
const typeBadge = { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" };
const actionsCell = { display: "flex", gap: "8px", justifyContent: "center", alignItems: "center" };
const editBtn = { background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" };
const deleteBtn = { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "6px", padding: "6px 10px", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" };
const emptyState = { padding: "60px", textAlign: "center", color: "#64748b", fontSize: "15px" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalBox = { background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", width: "100%", maxWidth: "520px", padding: "32px", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" };
const modalHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" };
const modalTitle = { fontSize: "18px", fontWeight: "700", margin: 0 };
const modalCloseBtn = { background: "rgba(255,255,255,0.08)", border: "none", color: "white", width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" };
const modalBody = { display: "flex", flexDirection: "column", gap: "20px" };
const fieldGroup = { display: "flex", flexDirection: "column", gap: "8px", flex: 1 };
const fieldRow = { display: "flex", gap: "16px" };
const modalLabel = { fontSize: "13px", fontWeight: "500", color: "#94a3b8" };
const modalInput = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "white", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", colorScheme: "dark" };
const modalFooter = { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "28px" };
const cancelBtn = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" };
const saveBtn = { background: "linear-gradient(135deg, #4f46e5, #6366f1)", border: "none", color: "white", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" };

export default Transactions;