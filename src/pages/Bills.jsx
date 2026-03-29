import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import logoGif from "../assets/video.gif";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");

// =========================
// HELPERS
// =========================

function fmt(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function isOverdue(due_date, status) {
  if (status === "paid") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(due_date + "T00:00:00");
  return due < today;
}

// =========================
// COMPONENTE PRINCIPAL
// =========================

export default function Bills() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "payable",
    status: "pending",
    due_date: "",
    paid_date: "",
    category: "",
    notes: "",
  });

  const navigate = useNavigate();

  // =========================
  // FETCH
  // =========================

  async function fetchBills() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/bills`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }
      const data = await res.json();
      setBills(Array.isArray(data) ? data : []);
    } catch {
      showToast("Erro ao carregar contas.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBills(); }, []);

  // =========================
  // TOAST
  // =========================

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // =========================
  // MODAL
  // =========================

  function openCreate() {
    setEditingBill(null);
    setForm({
      description: "",
      amount: "",
      type: "payable",
      status: "pending",
      due_date: "",
      paid_date: "",
      category: "",
      notes: "",
    });
    setModalOpen(true);
  }

  function openEdit(bill) {
    setEditingBill(bill);
    setForm({
      description: bill.description || "",
      amount: bill.amount || "",
      type: bill.type || "payable",
      status: bill.status || "pending",
      due_date: bill.due_date || "",
      paid_date: bill.paid_date || "",
      category: bill.category || "",
      notes: bill.notes || "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBill(null);
  }

  // =========================
  // SUBMIT
  // =========================

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    const url = editingBill ? `${API}/bills/${editingBill.id}` : `${API}/bills`;
    const method = editingBill ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(editingBill ? "Conta atualizada!" : "Conta criada com sucesso!");
        closeModal();
        fetchBills();
      } else {
        const err = await res.json();
        showToast(err.msg || "Erro ao salvar.", "error");
      }
    } catch {
      showToast("Erro de conexão.", "error");
    }
  }

  // =========================
  // PAGAR
  // =========================

  async function handlePay(bill) {
    try {
      const res = await fetch(`${API}/bills/${bill.id}/pay`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        showToast("Conta marcada como paga! ✅");
        fetchBills();
      } else {
        showToast("Erro ao marcar como paga.", "error");
      }
    } catch {
      showToast("Erro de conexão.", "error");
    }
  }

  // =========================
  // DELETAR
  // =========================

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/bills/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        showToast("Conta removida.");
        setDeleteConfirm(null);
        fetchBills();
      } else {
        showToast("Erro ao remover.", "error");
      }
    } catch {
      showToast("Erro de conexão.", "error");
    }
  }

  // =========================
  // FILTROS + CÁLCULOS
  // =========================

  const filtered = bills.filter((b) => {
    const typeOk = filter === "all" || b.type === filter;
    const realStatus = b.status !== "paid" && isOverdue(b.due_date, b.status) ? "overdue" : b.status;
    const statusOk = statusFilter === "all" || realStatus === statusFilter;
    return typeOk && statusOk;
  });

  const totalPayable = bills
    .filter((b) => b.type === "payable" && b.status !== "paid")
    .reduce((s, b) => s + b.amount, 0);

  const totalPaid = bills
    .filter((b) => b.type === "payable" && b.status === "paid")
    .reduce((s, b) => s + b.amount, 0);

  const totalReceivable = bills
    .filter((b) => b.type === "receivable" && b.status !== "paid")
    .reduce((s, b) => s + b.amount, 0);

  const totalReceived = bills
    .filter((b) => b.type === "receivable" && b.status === "paid")
    .reduce((s, b) => s + b.amount, 0);

  const totalOverdue = bills
    .filter((b) => isOverdue(b.due_date, b.status))
    .reduce((s, b) => s + b.amount, 0);

  // =========================
  // RENDER
  // =========================

  return (
    <div style={styles.root}>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={styles.main}>

        {/* HEADER COM LOGO */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <img src={logoGif} alt="logo" style={styles.logo} />
            <div>
              <h1 style={styles.title}>Contas</h1>
              <p style={styles.subtitle}>Gerencie suas contas a pagar e a receber</p>
            </div>
          </div>
          <button style={styles.btnPrimary} onClick={openCreate}>
            + Nova Conta
          </button>
        </div>

        {/* CARDS — A PAGAR */}
        <p style={styles.sectionLabel}>📤 Contas a Pagar</p>
        <div style={styles.cardsRow}>
          <SummaryCard
            label="A Pagar"
            value={fmt(totalPayable)}
            icon="📤"
            color="#ef4444"
            bg="rgba(239,68,68,0.08)"
            border="rgba(239,68,68,0.2)"
          />
          <SummaryCard
            label="Pagas"
            value={fmt(totalPaid)}
            icon="✅"
            color="#22c55e"
            bg="rgba(34,197,94,0.08)"
            border="rgba(34,197,94,0.2)"
          />
          <SummaryCard
            label="Vencidas"
            value={fmt(totalOverdue)}
            icon="⚠️"
            color="#f59e0b"
            bg="rgba(245,158,11,0.08)"
            border="rgba(245,158,11,0.2)"
          />
        </div>

        {/* CARDS — A RECEBER */}
        <p style={styles.sectionLabel}>📥 Contas a Receber</p>
        <div style={styles.cardsRow}>
          <SummaryCard
            label="A Receber"
            value={fmt(totalReceivable)}
            icon="📥"
            color="#3b82f6"
            bg="rgba(59,130,246,0.08)"
            border="rgba(59,130,246,0.2)"
          />
          <SummaryCard
            label="Recebidas"
            value={fmt(totalReceived)}
            icon="💰"
            color="#22c55e"
            bg="rgba(34,197,94,0.08)"
            border="rgba(34,197,94,0.2)"
          />
        </div>

        {/* FILTROS */}
        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Tipo:</span>
            {["all", "payable", "receivable"].map((f) => (
              <button
                key={f}
                style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Todos" : f === "payable" ? "A Pagar" : "A Receber"}
              </button>
            ))}
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Status:</span>
            {["all", "pending", "paid", "overdue"].map((s) => (
              <button
                key={s}
                style={{ ...styles.filterBtn, ...(statusFilter === s ? styles.filterBtnActive : {}) }}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "Todos" : s === "pending" ? "Pendente" : s === "paid" ? "Pago" : "Vencido"}
              </button>
            ))}
          </div>
        </div>

        {/* TABELA */}
        <div style={styles.tableCard}>
          {loading ? (
            <div style={styles.empty}>Carregando...</div>
          ) : filtered.length === 0 ? (
            <div style={styles.empty}>
              <span style={{ fontSize: "2rem" }}>📭</span>
              <p>Nenhuma conta encontrada</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Descrição", "Tipo", "Valor", "Vencimento", "Status", "Categoria", "Ações"].map((h) => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => {
                  const overdue = isOverdue(bill.due_date, bill.status);
                  const realStatus = bill.status !== "paid" && overdue ? "overdue" : bill.status;
                  return (
                    <tr
                      key={bill.id}
                      style={styles.tr}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={styles.td}>
                        <div style={styles.descCell}>
                          <span style={styles.descText}>{bill.description}</span>
                          {bill.notes && <span style={styles.noteText}>{bill.notes}</span>}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: bill.type === "payable" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                          color: bill.type === "payable" ? "#ef4444" : "#22c55e",
                        }}>
                          {bill.type === "payable" ? "📤 A Pagar" : "📥 A Receber"}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{fmt(bill.amount)}</td>
                      <td style={{ ...styles.td, color: overdue ? "#f59e0b" : "inherit" }}>
                        {fmtDate(bill.due_date)}
                        {overdue && <span style={{ marginLeft: 4, fontSize: "0.7rem" }}>⚠️</span>}
                      </td>
                      <td style={styles.td}><StatusBadge status={realStatus} /></td>
                      <td style={{ ...styles.td, color: "#94a3b8" }}>{bill.category || "—"}</td>
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          {bill.status !== "paid" && (
                            <button style={styles.btnAction} title="Marcar como paga" onClick={() => handlePay(bill)}>✅</button>
                          )}
                          <button style={styles.btnAction} title="Editar" onClick={() => openEdit(bill)}>✏️</button>
                          <button style={{ ...styles.btnAction, ...styles.btnDanger }} title="Excluir" onClick={() => setDeleteConfirm(bill)}>🗑️</button>
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

      {/* MODAL — CRIAR / EDITAR */}
      {modalOpen && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingBill ? "✏️ Editar Conta" : "➕ Nova Conta"}
              </h2>
              <button style={styles.btnClose} onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>

                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Descrição *</label>
                  <input
                    style={styles.input}
                    type="text"
                    required
                    placeholder="Ex: Conta de luz"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Valor *</label>
                  <input
                    style={styles.input}
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0,00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Tipo *</label>
                  <select
                    style={styles.select}
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="payable">A Pagar</option>
                    <option value="receivable">A Receber</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Vencimento *</label>
                  <input
                    style={styles.input}
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Data Pagamento</label>
                  <input
                    style={styles.input}
                    type="date"
                    value={form.paid_date}
                    onChange={(e) => setForm({ ...form, paid_date: e.target.value })}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Categoria</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Ex: Moradia, Alimentação..."
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Observações</label>
                  <textarea
                    style={{ ...styles.input, resize: "vertical", minHeight: 70 }}
                    placeholder="Informações adicionais..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    onFocus={e => e.target.style.borderColor = "rgba(99,102,241,0.6)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                  />
                </div>

              </div>

              <div style={styles.modalFooter}>
                <button type="button" style={styles.btnSecondary} onClick={closeModal}>Cancelar</button>
                <button type="submit" style={styles.btnPrimary}>
                  {editingBill ? "Salvar Alterações" : "Criar Conta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL — CONFIRMAR DELETE */}
      {deleteConfirm && (
        <div style={styles.overlay} onClick={() => setDeleteConfirm(null)}>
          <div style={{ ...styles.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ ...styles.modalTitle, color: "#ef4444" }}>Excluir Conta</h2>
              <button style={styles.btnClose} onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <p style={{ color: "#94a3b8", marginBottom: 24 }}>
              Tem certeza que deseja excluir{" "}
              <strong style={{ color: "#fff" }}>"{deleteConfirm.description}"</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div style={styles.modalFooter}>
              <button style={styles.btnSecondary} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button
                style={{ ...styles.btnPrimary, background: "#ef4444", boxShadow: "none" }}
                onClick={() => handleDelete(deleteConfirm.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ ...styles.toast, background: toast.type === "error" ? "#ef4444" : "#22c55e" }}>
          {toast.msg}
        </div>
      )}

    </div>
  );
}

// =========================
// SUBCOMPONENTES
// =========================

function SummaryCard({ label, value, icon, color, bg, border }) {
  return (
    <div style={{
      borderRadius: 14,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: bg,
      border: `1px solid ${border}`,
      backdropFilter: "blur(10px)",
    }}>
      <div style={{ fontSize: "1.6rem" }}>{icon}</div>
      <div>
        <div style={{ color: "#94a3b8", fontSize: "0.78rem", marginBottom: 2 }}>{label}</div>
        <div style={{ color, fontWeight: 700, fontSize: "1.15rem" }}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { label: "Pendente", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    paid:    { label: "Pago",     color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
    overdue: { label: "Vencido",  color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: "0.75rem",
      fontWeight: 600,
      color: s.color,
      background: s.bg,
      border: `1px solid ${s.color}44`,
    }}>
      {s.label}
    </span>
  );
}

// =========================
// ESTILOS
// =========================

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#020617",
    color: "#fff",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  main: { flex: 1, padding: "32px 36px", overflowY: "auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    width: 90,          // ← era 60, agora 90
    height: 90,
    objectFit: "contain",
    filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 700,
    margin: 0,
    background: "linear-gradient(90deg, #fff, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { color: "#64748b", margin: "4px 0 0", fontSize: "0.9rem" },
  sectionLabel: {
    color: "#64748b",
    fontSize: "0.82rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 12px 0",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 20px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
    boxShadow: "0 4px 15px rgba(59,130,246,0.3)",
  },
  btnSecondary: {
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 20px",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  filtersRow: { display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 20 },
  filterGroup: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  filterLabel: { color: "#64748b", fontSize: "0.82rem", fontWeight: 600 },
  filterBtn: {
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "6px 14px",
    fontSize: "0.82rem",
    cursor: "pointer",
    colorScheme: "dark",
  },
  filterBtnActive: {
    background: "rgba(59,130,246,0.2)",
    color: "#60a5fa",
    border: "1px solid rgba(59,130,246,0.4)",
  },
  tableCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" },
  th: {
    textAlign: "left",
    padding: "14px 18px",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "rgba(255,255,255,0.02)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" },
  td: { padding: "14px 18px", verticalAlign: "middle" },
  descCell: { display: "flex", flexDirection: "column", gap: 2 },
  descText: { fontWeight: 500, color: "#e2e8f0" },
  noteText: { fontSize: "0.75rem", color: "#64748b" },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  actions: { display: "flex", gap: 6 },
  btnAction: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "5px 9px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  btnDanger: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: 12,
    color: "#475569",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 18,
    padding: 32,
    width: "100%",
    maxWidth: 620,
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { margin: 0, fontSize: "1.2rem", fontWeight: 700 },
  btnClose: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "white",
    width: 32,
    height: 32,
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
  },
  form: { display: "flex", flexDirection: "column", gap: 0 },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 24,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { color: "#94a3b8", fontSize: "0.8rem", fontWeight: 600 },
  // ← inputs: fundo preto, letra branca
  input: {
    background: "#000000",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#ffffff",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    colorScheme: "dark",
  },
  // ← selects: fundo preto, letra branca (Tipo e Status)
  select: {
    background: "#000000",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#ffffff",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    colorScheme: "dark",
    cursor: "pointer",
    appearance: "auto",
  },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 12 },
  toast: {
    position: "fixed",
    bottom: 28,
    right: 28,
    color: "#fff",
    padding: "12px 22px",
    borderRadius: 12,
    fontWeight: 600,
    fontSize: "0.9rem",
    zIndex: 9999,
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
  },
};
