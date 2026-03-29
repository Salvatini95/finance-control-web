import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import logoGif from "../assets/video.gif";
import worldMap from "../assets/world-map.svg";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";

const API_URL = "http://localhost:5000/api";
const COLORS = ["#6366f1","#22c55e","#f59e0b","#ef4444","#3b82f6","#a855f7","#ec4899","#14b8a6"];

function fmt(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
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

export default function Analytics() {

  const isMobile = useIsMobile();
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!token) { navigate("/"); return; }
    setLoading(true);
    try {
      const [resT, resB] = await Promise.all([
        fetch(`${API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/bills`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (resT.status === 401 || resT.status === 422) {
        localStorage.removeItem("token"); navigate("/"); return;
      }
      const dataT = await resT.json();
      const dataB = await resB.json();
      setTransactions(Array.isArray(dataT) ? dataT : []);
      setBills(Array.isArray(dataB) ? dataB : []);
    } catch (err) { console.log("Erro:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [token]);

  const safe = Array.isArray(transactions) ? transactions : [];
  const filtered = safe.filter(t => {
    const yearOk = !filterYear || t.date?.startsWith(filterYear);
    const monthOk = !filterMonth || t.date?.substring(5, 7) === filterMonth;
    return yearOk && monthOk;
  });
  const years = [...new Set(safe.map(t => t.date?.substring(0, 4)).filter(Boolean))].sort();

  let running = 0;
  const balanceData = [...filtered]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(t => {
      running += t.type === "income" ? t.amount : -t.amount;
      return { date: t.date, balance: running };
    });

  const monthMap = {};
  filtered.forEach(t => {
    if (!t.date) return;
    const m = t.date.substring(0, 7);
    if (!monthMap[m]) monthMap[m] = { month: m, income: 0, expense: 0, balance: 0 };
    if (t.type === "income") monthMap[m].income += t.amount;
    else monthMap[m].expense += t.amount;
    monthMap[m].balance = monthMap[m].income - monthMap[m].expense;
  });
  const monthlyData = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

  const categoryMap = {};
  filtered.forEach(t => {
    const cat = t.category || "Outros";
    if (!categoryMap[cat]) categoryMap[cat] = { name: cat, income: 0, expense: 0, total: 0 };
    if (t.type === "income") categoryMap[cat].income += t.amount;
    else categoryMap[cat].expense += t.amount;
    categoryMap[cat].total += t.amount;
  });
  const categoryData = Object.values(categoryMap).sort((a, b) => b.total - a.total);

  const totalIncome  = filtered.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const totalBalance = totalIncome - totalExpense;
  const avgIncome  = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
  const avgExpense = monthlyData.length > 0 ? totalExpense / monthlyData.length : 0;

  const pieData = [
    { name: "Entradas", value: totalIncome },
    { name: "Saídas", value: totalExpense }
  ];

  const top5Expense = Object.values(categoryMap)
    .filter(c => c.expense > 0)
    .sort((a, b) => b.expense - a.expense)
    .slice(0, 5)
    .map(c => ({ category: c.name, value: c.expense }));

  const safeBills = Array.isArray(bills) ? bills : [];
  const billsChartData = [
    { name: "A Pagar",   value: safeBills.filter(b => b.type==="payable"    && b.status!=="paid").reduce((a,b)=>a+b.amount,0), color:"#ef4444" },
    { name: "A Receber", value: safeBills.filter(b => b.type==="receivable" && b.status!=="paid").reduce((a,b)=>a+b.amount,0), color:"#3b82f6" },
    { name: "Pagas",     value: safeBills.filter(b => b.type==="payable"    && b.status==="paid").reduce((a,b)=>a+b.amount,0), color:"#22c55e" },
    { name: "Recebidas", value: safeBills.filter(b => b.type==="receivable" && b.status==="paid").reduce((a,b)=>a+b.amount,0), color:"#6366f1" },
    { name: "Vencidas",  value: safeBills.filter(b => { if(b.status==="paid") return false; const t=new Date(); t.setHours(0,0,0,0); return new Date(b.due_date+"T00:00:00")<t; }).reduce((a,b)=>a+b.amount,0), color:"#f59e0b" },
  ];

  const radarData = categoryData.slice(0, 6).map(c => ({
    category: c.name, Entradas: c.income, Saídas: c.expense,
  }));

  const tooltipStyle = { background:"#0f172a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8 };
  const chartH = isMobile ? 200 : 280;

  if (loading) return <h2 style={{ color:"white", padding:"20px" }}>Carregando...</h2>;

  return (
    <div style={{ display:"flex", background:"#020617", color:"white", minHeight:"100vh", fontFamily:"'Inter',sans-serif", position:"relative" }}>

      <style>{`
        .chart3d-a {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform: perspective(1000px) rotateX(1deg);
          box-shadow: 0 12px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(6px);
        }
        .chart3d-a:hover {
          transform: perspective(1000px) rotateX(0deg) translateY(-5px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.5);
        }
        .card3d-a {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          transform: perspective(700px) rotateX(4deg) rotateY(-2deg);
          box-shadow: 0 14px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }
        .card3d-a::before {
          content:'';
          position:absolute;
          top:0;left:0;right:0;
          height:1px;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent);
        }
        .card3d-a:hover {
          transform: perspective(700px) rotateX(0deg) rotateY(0deg) translateY(-8px);
          box-shadow: 0 28px 56px rgba(0,0,0,0.55);
        }
        @media (max-width: 768px) {
          .chart3d-a { transform: none !important; }
          .chart3d-a:hover { transform: translateY(-3px) !important; }
          .card3d-a { transform: none !important; }
          .card3d-a:hover { transform: translateY(-4px) !important; }
        }
      `}</style>

      {/* MAPA FUNDO */}
      <div style={{
        position:"fixed", inset:0,
        backgroundImage:`url(${worldMap})`,
        backgroundRepeat:"no-repeat",
        backgroundPosition:"center",
        backgroundSize: isMobile ? "600px" : "1100px",
        opacity:0.06, pointerEvents:"none", zIndex:0
      }} />

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div style={{
        flex:1,
        padding: isMobile ? "72px 16px 40px" : "40px",
        overflowY:"auto",
        position:"relative",
        zIndex:1
      }}>

        {/* HEADER */}
        <div style={{
          display:"flex", justifyContent:"space-between",
          alignItems: isMobile ? "flex-start" : "center",
          marginBottom:28, flexWrap:"wrap", gap:16,
          flexDirection: isMobile ? "column" : "row"
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <img src={logoGif} alt="logo" style={{
              width: isMobile?44:60, height: isMobile?44:60,
              objectFit:"contain",
              filter:"drop-shadow(0 0 10px rgba(255,255,255,0.3))"
            }} />
            <div>
              <h1 style={{
                fontSize: isMobile?"22px":"1.75rem", fontWeight:700, margin:0,
                background:"linear-gradient(90deg,#fff,#94a3b8)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
              }}>Analytics</h1>
              <p style={{ color:"#64748b", margin:"4px 0 0", fontSize:"0.85rem" }}>
                Análise detalhada das suas finanças
              </p>
            </div>
          </div>

          {/* FILTROS */}
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", width: isMobile?"100%":"auto" }}>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              style={{ ...selectStyle, flex: isMobile?1:"auto" }}>
              <option value="">Todos os anos</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              style={{ ...selectStyle, flex: isMobile?1:"auto" }}>
              <option value="">Todos os meses</option>
              {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m,i) => (
                <option key={m} value={m}>
                  {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"][i]}
                </option>
              ))}
            </select>
            {(filterYear || filterMonth) && (
              <button onClick={() => { setFilterYear(""); setFilterMonth(""); }} style={clearBtn}>
                ✕ Limpar
              </button>
            )}
          </div>
        </div>

        {/* CARDS RESUMO */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit,minmax(160px,1fr))",
          gap:14, marginBottom:28
        }}>
          {[
            { label:"Total Entradas",       value:fmt(totalIncome),  color:"#22c55e", border:"#22c55e" },
            { label:"Total Saídas",         value:fmt(totalExpense), color:"#ef4444", border:"#ef4444" },
            { label:"Saldo",                value:fmt(totalBalance), color:totalBalance>=0?"#22c55e":"#ef4444", border:"#6366f1" },
            { label:"Média Entrada/Mês",    value:fmt(avgIncome),    color:"#f59e0b", border:"#f59e0b" },
            { label:"Média Saída/Mês",      value:fmt(avgExpense),   color:"#3b82f6", border:"#3b82f6" },
            { label:"Total Transações",     value:filtered.length,   color:"#a855f7", border:"#a855f7" },
          ].map((c,i) => (
            <div key={i} className="card3d-a" style={{ borderLeft:`3px solid ${c.border}` }}>
              <span style={{ fontSize:10, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" }}>
                {c.label}
              </span>
              <span style={{ fontSize: isMobile?16:20, fontWeight:700, color:c.color }}>
                {c.value}
              </span>
            </div>
          ))}
        </div>

        {/* GRÁFICO 1 — Saldo Acumulado */}
        <div className="chart3d-a">
          <h3 style={chartTitle}>📈 Evolução do Saldo</h3>
          <ResponsiveContainer width="100%" height={chartH}>
            <AreaChart data={balanceData}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize:10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize:10 }} tickFormatter={v=>fmt(v)} width={isMobile?60:80} />
              <Tooltip contentStyle={tooltipStyle} formatter={v=>[fmt(v),"Saldo"]} />
              <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} fill="url(#balGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO 2 — Mensal */}
        <div className="chart3d-a">
          <h3 style={chartTitle}>📊 Entradas vs Saídas por Mês</h3>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize:10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize:10 }} tickFormatter={v=>fmt(v)} width={isMobile?60:80} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v,name)=>[fmt(v), name==="income"?"Entradas":name==="expense"?"Saídas":"Saldo"]} />
              <Legend formatter={v=>v==="income"?"Entradas":v==="expense"?"Saídas":"Saldo"} />
              <Bar dataKey="income"  fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="balance" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO 3+4 — Pizza + Top5 */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap:20, marginBottom:0
        }}>
          <div className="chart3d-a">
            <h3 style={chartTitle}>🥧 Distribuição Geral</h3>
            <ResponsiveContainer width="100%" height={isMobile?200:260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  outerRadius={isMobile?70:90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={v=>[fmt(v)]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart3d-a">
            <h3 style={chartTitle}>🔴 Top 5 Categorias de Despesa</h3>
            <ResponsiveContainer width="100%" height={isMobile?200:260}>
              <BarChart data={top5Expense} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize:10 }} tickFormatter={v=>fmt(v)} />
                <YAxis type="category" dataKey="category" stroke="#64748b" tick={{ fontSize:10 }} width={isMobile?70:90} />
                <Tooltip contentStyle={tooltipStyle} formatter={v=>[fmt(v),"Despesa"]} />
                <Bar dataKey="value" radius={[0,4,4,0]}>
                  {top5Expense.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 5 — Categorias */}
        <div className="chart3d-a" style={{ marginTop:20 }}>
          <h3 style={chartTitle}>📂 Entradas e Saídas por Categoria</h3>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
            <button onClick={() => setActiveCategory(null)}
              style={{ ...filterBtn, ...(activeCategory===null?filterBtnActive:{}) }}>
              Todas
            </button>
            {categoryData.map(c => (
              <button key={c.name}
                onClick={() => setActiveCategory(c.name===activeCategory?null:c.name)}
                style={{ ...filterBtn, ...(activeCategory===c.name?filterBtnActive:{}) }}>
                {c.name}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={activeCategory ? categoryData.filter(c=>c.name===activeCategory) : categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize:10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize:10 }} tickFormatter={v=>fmt(v)} width={isMobile?60:80} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v,name)=>[fmt(v), name==="income"?"Entradas":"Saídas"]} />
              <Legend formatter={v=>v==="income"?"Entradas":"Saídas"} />
              <Bar dataKey="income"  fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* GRÁFICO 6 — Radar */}
        {radarData.length > 0 && (
          <div className="chart3d-a">
            <h3 style={chartTitle}>🕸️ Radar por Categoria</h3>
            <ResponsiveContainer width="100%" height={isMobile?220:300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="category" stroke="#64748b" tick={{ fontSize:isMobile?9:11 }} />
                <Radar name="Entradas" dataKey="Entradas" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
                <Radar name="Saídas" dataKey="Saídas" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <Legend />
                <Tooltip contentStyle={tooltipStyle} formatter={v=>[fmt(v)]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* GRÁFICO 7 — Contas */}
        <div className="chart3d-a">
          <h3 style={chartTitle}>📄 Situação das Contas</h3>
          <ResponsiveContainer width="100%" height={isMobile?200:260}>
            <BarChart data={billsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize:isMobile?9:11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize:10 }} tickFormatter={v=>fmt(v)} width={isMobile?60:80} />
              <Tooltip contentStyle={tooltipStyle} formatter={v=>[fmt(v)]} />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {billsChartData.map((entry,i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:12 }}>
            {billsChartData.map(b => (
              <div key={b.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:b.color }} />
                <span style={{ color:"#94a3b8", fontSize:12 }}>
                  {b.name}: <strong style={{ color:"#fff" }}>{fmt(b.value)}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// =========================
// ESTILOS
// =========================

const selectStyle = {
  background:"#020617", color:"#fff",
  border:"1px solid rgba(255,255,255,0.1)",
  padding:"8px 14px", borderRadius:8,
  fontSize:13, outline:"none", colorScheme:"dark"
};

const clearBtn = {
  background:"rgba(239,68,68,0.15)", color:"#ef4444",
  border:"1px solid rgba(239,68,68,0.3)",
  padding:"8px 14px", borderRadius:8,
  cursor:"pointer", fontSize:13
};

const chartTitle = {
  fontSize:14, fontWeight:600,
  margin:"0 0 16px 0", color:"#e2e8f0"
};

const filterBtn = {
  background:"rgba(255,255,255,0.04)", color:"#94a3b8",
  border:"1px solid rgba(255,255,255,0.08)",
  borderRadius:8, padding:"5px 12px",
  fontSize:12, cursor:"pointer"
};

const filterBtnActive = {
  background:"rgba(99,102,241,0.2)", color:"#818cf8",
  border:"1px solid rgba(99,102,241,0.4)"
};