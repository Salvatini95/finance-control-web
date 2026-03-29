import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Filters from "../components/filters/Filters";
import CategoryChart from "../components/charts/CategoryChart";
import MonthlyChart from "../components/charts/MonthlyChart";
import BalanceChart from "../components/charts/BalanceChart";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";

import worldMap from "../assets/world-map.svg";
import logoGif from "../assets/video.gif";
import topoDashboard from "../assets/topodashboard.jpg";

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts";

const API_URL = "http://localhost:5000/api";

function fmt(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL"
  }).format(value || 0);
}

// Hook para detectar tamanho da tela
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

function Dashboard() {

  const isMobile = useIsMobile();

  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
        setFiltered(data);
      } else {
        setTransactions([]);
        setFiltered([]);
      }
    } catch (err) {
      console.log("Erro ao buscar transações", err);
      setTransactions([]);
      setFiltered([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTransactions(); }, [token]);

  useEffect(() => {
    let result = Array.isArray(transactions) ? [...transactions] : [];
    if (filterYear) result = result.filter(t => t.date?.startsWith(filterYear));
    if (filterMonth) result = result.filter(t => t.date?.substring(5, 7) === filterMonth);
    if (filterType) result = result.filter(t => t.type === filterType);
    setFiltered(result);
  }, [filterYear, filterMonth, filterType, transactions]);

  const clearFilters = () => {
    setFilterYear("");
    setFilterMonth("");
    setFilterType("");
    setFiltered(transactions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
      alert("Preencha todos os campos!");
      return;
    }
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) { alert("Valor inválido!"); return; }
    const body = { description, amount: parsedAmount, type, category, date };
    try {
      const url = editingId ? `${API_URL}/transactions/${editingId}` : `${API_URL}/transactions`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { alert(data.msg || "Erro ao salvar"); return; }
    } catch (err) {
      alert("Erro de conexão com servidor");
    }
    setDescription(""); setAmount(""); setCategory(""); setDate(""); setEditingId(null);
    fetchTransactions();
  };

  const editTransaction = (t) => {
    setEditingId(t.id); setDescription(t.description);
    setAmount(t.amount); setType(t.type);
    setCategory(t.category); setDate(t.date);
  };

  const deleteTransaction = async (id) => {
    try {
      await fetch(`${API_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) { console.log("Erro ao deletar", err); }
    fetchTransactions();
  };

  const income  = filtered.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = filtered.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = income - expense;

  const categoryMap = {};
  filtered.forEach(t => {
    const cat = t.category || "Outros";
    if (!categoryMap[cat]) categoryMap[cat] = 0;
    categoryMap[cat] += t.amount;
  });
  const chartData = Object.keys(categoryMap).map(cat => ({ name: cat, value: categoryMap[cat] }));

  const monthMap = {};
  filtered.forEach(t => {
    if (!t.date) return;
    const m = t.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0 };
    if (t.type === "income") monthMap[m].income += t.amount;
    else monthMap[m].expense += t.amount;
  });
  const monthlyData = Object.values(monthMap);

  let runningBalance = 0;
  const balanceData = [...filtered]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(t => {
      runningBalance += t.type === "income" ? t.amount : -t.amount;
      return { date: t.date, balance: runningBalance };
    });

  const categoryMapFull = {};
  filtered.forEach(t => {
    const cat = t.category || "Outros";
    if (!categoryMapFull[cat]) categoryMapFull[cat] = { category: cat, Entradas: 0, Saídas: 0 };
    if (t.type === "income") categoryMapFull[cat].Entradas += t.amount;
    else categoryMapFull[cat].Saídas += t.amount;
  });
  const radarData = Object.values(categoryMapFull).slice(0, 7);

  if (loading) {
    return <h2 style={{ color: "white", padding: "20px" }}>Carregando...</h2>;
  }

  // Estilos responsivos
  const contentPadding = isMobile ? "16px 16px 0" : "32px 40px 0";
  const heroHeight = isMobile ? "280px" : "420px";
  const logoSize = isMobile ? "120px" : "220px";
  const titleSize = isMobile ? "22px" : "28px";
  const cardsColumns = isMobile ? "1fr" : "1fr 1fr 1fr";
  const chartsColumns = isMobile ? "1fr" : "1fr 1fr";
  const formColumns = isMobile
    ? "1fr"
    : "2fr 1fr 1fr 1fr 1fr auto";
  const rowColumns = isMobile
    ? "1fr 1fr auto auto"
    : "2fr 1fr 1fr 1fr auto auto";

  return (
    <div style={{
      display: "flex",
      background: "#020617",
      color: "white",
      minHeight: "100vh",
      backgroundImage: `url(${worldMap})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundSize: isMobile ? "600px" : "1200px",
    }}>

      <style>{`
        .card3d {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 22px 18px 16px;
          cursor: default;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform: perspective(700px) rotateX(5deg) rotateY(-3deg);
          box-shadow: 0 24px 48px rgba(0,0,0,0.55), 0 6px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07);
        }
        .card3d:hover {
          transform: perspective(700px) rotateX(0deg) rotateY(0deg) translateY(-8px);
          box-shadow: 0 36px 72px rgba(0,0,0,0.65), 0 12px 24px rgba(0,0,0,0.4);
        }
        .card3d-income  { border-top: 2px solid #22c55e; }
        .card3d-expense { border-top: 2px solid #ef4444; }
        .card3d-balance { border-top: 2px solid #6366f1; }
        .chart3d {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform: perspective(900px) rotateX(3deg) rotateY(-1.5deg);
          box-shadow: 0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .chart3d:hover {
          transform: perspective(900px) rotateX(0deg) rotateY(0deg) translateY(-5px);
          box-shadow: 0 28px 56px rgba(0,0,0,0.55);
        }
        .section-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #475569;
          margin: 0 0 14px 2px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-label::after {
          content: "";
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        /* ── MOBILE TWEAKS ── */
        @media (max-width: 768px) {
          .card3d {
            transform: none !important;
          }
          .card3d:hover {
            transform: translateY(-4px) !important;
          }
          .chart3d {
            transform: none !important;
          }
          .chart3d:hover {
            transform: translateY(-3px) !important;
          }
          /* Tabela scroll horizontal */
          .table-scroll {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          /* Formulário empilhado */
          .form-mobile {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          .form-mobile input,
          .form-mobile select,
          .form-mobile button {
            width: 100% !important;
          }
        }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{ flex: 1, overflowY: "auto" }}>

        {/* HERO */}
        <div style={{
          position: "relative",
          height: heroHeight,
          backgroundImage: `url(${topoDashboard})`,
          backgroundSize: "cover",
          backgroundPosition: "center 39%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(180deg, rgba(2,6,23,0.2) 0%, rgba(2,6,23,0.5) 60%, rgba(2,6,23,1) 100%)`,
          }} />
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10,
            paddingTop: isMobile ? 48 : 0
          }}>
            <img src={logoGif} alt="Finance Control" style={{
              width: logoSize, height: logoSize,
              objectFit: "contain",
              filter: "drop-shadow(0 0 20px rgba(255,255,255,0.5))"
            }} />
            <h1 style={{
              fontSize: titleSize, fontWeight: 700,
              margin: 0, letterSpacing: "1.5px",
              color: "white", textShadow: "0 2px 20px rgba(0,0,0,0.9)",
              textAlign: "center"
            }}>Painel Financeiro</h1>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              margin: 0, fontSize: 13, letterSpacing: "0.5px"
            }}>Visão completa das suas finanças</p>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div style={{ padding: contentPadding }}>

          {/* FILTROS */}
          <div style={{ marginBottom: 28 }}>
            <Filters
              filterYear={filterYear} setFilterYear={setFilterYear}
              filterMonth={filterMonth} setFilterMonth={setFilterMonth}
              filterType={filterType} setFilterType={setFilterType}
              clearFilters={clearFilters} inputStyle={inputStyle}
            />
          </div>

          {/* CARDS */}
          <div style={{ marginBottom: 28 }}>
            <p className="section-label">📊 Resumo Financeiro</p>
            <div style={{
              display: "grid",
              gridTemplateColumns: cardsColumns,
              gap: 16
            }}>

              <div className="card3d card3d-income">
                <div style={cardIcon}>📈</div>
                <div style={cardLabel}>Entradas</div>
                <h2 style={{ color:"#22c55e", margin:"8px 0 4px", fontSize: isMobile?20:24, fontWeight:700 }}>
                  {fmt(income)}
                </h2>
                <div style={cardSub}>{filtered.filter(t=>t.type==="income").length} transações</div>
                <div style={{ height:4, borderRadius:4, overflow:"hidden", background:"rgba(34,197,94,0.12)", marginTop:8 }}>
                  <div style={{ height:"100%", borderRadius:4, width: income>0?"100%":"0%", background:"#22c55e", transition:"width 0.6s" }} />
                </div>
              </div>

              <div className="card3d card3d-expense">
                <div style={cardIcon}>📉</div>
                <div style={cardLabel}>Saídas</div>
                <h2 style={{ color:"#ef4444", margin:"8px 0 4px", fontSize: isMobile?20:24, fontWeight:700 }}>
                  - {fmt(expense)}
                </h2>
                <div style={cardSub}>{filtered.filter(t=>t.type==="expense").length} transações</div>
                <div style={{ height:4, borderRadius:4, overflow:"hidden", background:"rgba(239,68,68,0.12)", marginTop:8 }}>
                  <div style={{ height:"100%", borderRadius:4, width: income>0?`${Math.min((expense/income)*100,100)}%`:"0%", background:"#ef4444", transition:"width 0.6s" }} />
                </div>
              </div>

              <div className="card3d card3d-balance">
                <div style={cardIcon}>💰</div>
                <div style={cardLabel}>Saldo Atual</div>
                <h2 style={{ color: balance>=0?"#22c55e":"#ef4444", margin:"8px 0 4px", fontSize: isMobile?20:24, fontWeight:700 }}>
                  {fmt(balance)}
                </h2>
                <div style={cardSub}>{filtered.length} transações no total</div>
                <div style={{ height:4, borderRadius:4, overflow:"hidden", background:"rgba(99,102,241,0.12)", marginTop:8 }}>
                  <div style={{ height:"100%", borderRadius:4, width: income>0?`${Math.min((Math.max(balance,0)/income)*100,100)}%`:"0%", background:"#6366f1", transition:"width 0.6s" }} />
                </div>
              </div>

            </div>
          </div>

          {/* FORMULÁRIO */}
          <div style={{ marginBottom: 28 }}>
            <p className="section-label">✏️ {editingId ? "Editar Transação" : "Nova Transação"}</p>
            <div className="section-card">
              <TransactionForm
                editingId={editingId}
                handleSubmit={handleSubmit}
                description={description} setDescription={setDescription}
                amount={amount} setAmount={setAmount}
                type={type} setType={setType}
                category={category} setCategory={setCategory}
                date={date} setDate={setDate}
                form={{ display:"grid", gridTemplateColumns: formColumns, gap:"10px" }}
                inputStyle={inputStyle}
                card={cardTransparent}
              />
            </div>
          </div>

          {/* GRÁFICOS */}
          <div style={{ marginBottom: 28 }}>
            <p className="section-label">📈 Análise Gráfica</p>
            <div style={{
              display: "grid",
              gridTemplateColumns: chartsColumns,
              gap: 16
            }}>

              <div className="chart3d">
                <CategoryChart chartData={chartData} card={cardTransparent} />
              </div>

              <div className="chart3d">
                <MonthlyChart monthlyData={monthlyData} card={cardTransparent} />
              </div>

              <div className="chart3d" style={isMobile ? { gridColumn: "1" } : {}}>
                <BalanceChart data={balanceData} card={cardTransparent} />
              </div>

              <div className="chart3d" style={isMobile ? { gridColumn: "1" } : {}}>
                <h3 style={chartTitle}>🕸️ Radar por Categoria</h3>
                {radarData.length === 0 ? (
                  <p style={{ color:"#64748b", textAlign:"center", paddingTop:40 }}>
                    Sem dados suficientes
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="category" stroke="#64748b" tick={{ fontSize:10, fill:"#94a3b8" }} />
                      <Radar name="Entradas" dataKey="Entradas" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                      <Radar name="Saídas" dataKey="Saídas" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                      <Legend />
                      <Tooltip
                        contentStyle={{ background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8 }}
                        formatter={(v) => [fmt(v)]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>
          </div>

          {/* TRANSAÇÕES */}
          <div style={{ marginBottom: 28 }}>
            <p className="section-label">🧾 Histórico de Transações</p>
            <div className="section-card table-scroll">
              <TransactionList
                filtered={filtered}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                row={{
                  display: "grid",
                  gridTemplateColumns: rowColumns,
                  gap: "8px",
                  padding: "10px",
                  borderBottom: "1px solid #1e293b",
                }}
                editBtn={editBtn}
                deleteBtn={deleteBtn}
                card={cardTransparent}
              />
            </div>
          </div>

          <div style={{ height: 48 }} />

        </div>
      </div>
    </div>
  );
}

// =========================
// ESTILOS
// =========================

const cardIcon = { fontSize: 20, marginBottom: 6 };
const cardLabel = { fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 700 };
const cardSub = { fontSize: 12, color: "#475569", marginBottom: 4 };
const chartTitle = { fontSize: 14, fontWeight: 600, margin: "0 0 16px 0", color: "#e2e8f0" };
const cardTransparent = { background: "transparent", border: "none", padding: 0, borderRadius: 0, marginTop: 0 };

const inputStyle = {
  background: "#000", color: "#fff",
  border: "1px solid #334155",
  padding: "8px", borderRadius: "6px",
  colorScheme: "dark",
};

const editBtn = {
  background: "#2564eb56", border: "none",
  padding: "6px 10px", borderRadius: "6px",
  color: "white", cursor: "pointer",
};

const deleteBtn = {
  background: "#dc2626", border: "none",
  padding: "6px 10px", borderRadius: "6px",
  color: "white", cursor: "pointer",
};

export default Dashboard; 