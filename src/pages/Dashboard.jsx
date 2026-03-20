import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Filters from "../components/filters/Filters";
import CategoryChart from "../components/charts/CategoryChart";
import MonthlyChart from "../components/charts/MonthlyChart";
import BalanceChart from "../components/charts/BalanceChart";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionList from "../components/transactions/TransactionList";

import worldMap from "../assets/world-map.svg";

const API_URL = import.meta.env.VITE_API_URL;

function Dashboard(){

const [transactions,setTransactions]=useState([]);
const [filtered,setFiltered]=useState([]);
const [loading,setLoading]=useState(true);

const [description,setDescription]=useState("");
const [amount,setAmount]=useState("");
const [type,setType]=useState("income");
const [category,setCategory]=useState("");
const [date,setDate]=useState("");

const [editingId,setEditingId]=useState(null);

const [filterYear,setFilterYear]=useState("");
const [filterMonth,setFilterMonth]=useState("");
const [filterType,setFilterType]=useState("");

const [sidebarOpen,setSidebarOpen]=useState(false);

const token = localStorage.getItem("token");


// =========================
// BUSCAR TRANSAÇÕES
// =========================

const fetchTransactions = async ()=>{

if(!token) return;

setLoading(true);

try{

const res = await fetch(
`${API_URL}/transactions`,
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

if(res.status === 401){
localStorage.removeItem("token");
window.location.href = "/";
return;
}

const data = await res.json();

if(Array.isArray(data)){
setTransactions(data);
setFiltered(data);
}else{
setTransactions([]);
setFiltered([]);
}

}catch(err){
console.log("Erro ao buscar transações",err);
setTransactions([]);
setFiltered([]);
}

setLoading(false);
};

useEffect(()=>{
fetchTransactions();
},[token]);


// =========================
// FILTROS
// =========================

useEffect(()=>{

let result = Array.isArray(transactions) ? [...transactions] : [];

if(filterYear){
result = result.filter(t=>t.date?.startsWith(filterYear));
}

if(filterMonth){
result = result.filter(t=>t.date?.substring(5,7)===filterMonth);
}

if(filterType){
result = result.filter(t=>t.type===filterType);
}

setFiltered(result);

},[filterYear,filterMonth,filterType,transactions]);

const clearFilters=()=>{
setFilterYear("");
setFilterMonth("");
setFilterType("");
setFiltered(transactions);
};


// =========================
// SALVAR / EDITAR
// =========================

const handleSubmit = async (e) => {

e.preventDefault();

if(!description || !amount || !category || !date){
alert("Preencha todos os campos!");
return;
}

const parsedAmount = Number(amount);

if(isNaN(parsedAmount)){
alert("Valor inválido!");
return;
}

const body = {
description,
amount: parsedAmount,
type,
category,
date
};

try{

const url = editingId
? `${API_URL}/transactions/${editingId}`
: `${API_URL}/transactions`;

const method = editingId ? "PUT" : "POST";

const res = await fetch(url,{
method,
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body: JSON.stringify(body)
});

const data = await res.json();

if(!res.ok){
alert(data.msg || "Erro ao salvar");
return;
}

}catch(err){
console.log("Erro ao salvar", err);
alert("Erro de conexão com servidor");
}

setDescription("");
setAmount("");
setCategory("");
setDate("");
setEditingId(null);

fetchTransactions();
};


// =========================
// EDITAR
// =========================

const editTransaction=(t)=>{
setEditingId(t.id);
setDescription(t.description);
setAmount(t.amount);
setType(t.type);
setCategory(t.category);
setDate(t.date);
};


// =========================
// DELETE
// =========================

const deleteTransaction = async(id)=>{

try{

await fetch(
`${API_URL}/transactions/${id}`,
{
method:"DELETE",
headers:{Authorization:`Bearer ${token}`}
}
);

}catch(err){
console.log("Erro ao deletar",err);
}

fetchTransactions();

};


// =========================
// CALCULOS
// =========================

const income = filtered
.filter(t=>t.type==="income")
.reduce((a,b)=>a+b.amount,0);

const expense = filtered
.filter(t=>t.type==="expense")
.reduce((a,b)=>a+b.amount,0);

const balance = income - expense;


// =========================
// GRAFICOS
// =========================

const categoryMap={};

filtered.forEach(t=>{
const cat = t.category || "Outros";
if(!categoryMap[cat]) categoryMap[cat]=0;
categoryMap[cat]+=t.amount;
});

const chartData = Object.keys(categoryMap).map(cat=>({
name:cat,
value:categoryMap[cat]
}));

const monthMap={};

filtered.forEach(t=>{
if(!t.date) return;
const m=t.date.substring(0,7);
if(!monthMap[m])
monthMap[m]={month:m,income:0,expense:0};
if(t.type==="income")
monthMap[m].income+=t.amount;
else
monthMap[m].expense+=t.amount;
});

const monthlyData = Object.values(monthMap);

let runningBalance = 0;

const balanceData = [...filtered]
.sort((a,b)=> new Date(a.date)-new Date(b.date))
.map(t=>{
runningBalance += t.type==="income" ? t.amount : -t.amount;
return {date:t.date,balance:runningBalance};
});


// =========================
// UI
// =========================

if(loading){
return <h2 style={{color:"white",padding:"20px"}}>Carregando...</h2>
}

return(

<div style={container}>

<Sidebar
sidebarOpen={sidebarOpen}
setSidebarOpen={setSidebarOpen}
/>

<div style={main}>

<h1>Painel Financeiro</h1>

<Filters
filterYear={filterYear}
setFilterYear={setFilterYear}
filterMonth={filterMonth}
setFilterMonth={setFilterMonth}
filterType={filterType}
setFilterType={setFilterType}
clearFilters={clearFilters}
inputStyle={inputStyle}
/>

<div style={cards}>

<div style={card}>
Entradas
<h2 style={{color:"#00ff88"}}>R$ {income}</h2>
</div>

<div style={card}>
Saídas
<h2 style={{color:"#ff4d4d"}}>- R$ {expense}</h2>
</div>

<div style={card}>
Saldo
<h2>R$ {balance}</h2>
</div>

</div>

<TransactionForm
editingId={editingId}
handleSubmit={handleSubmit}
description={description}
setDescription={setDescription}
amount={amount}
setAmount={setAmount}
type={type}
setType={setType}
category={category}
setCategory={setCategory}
date={date}
setDate={setDate}
form={form}
inputStyle={inputStyle}
card={card}
/>

<div style={charts}>
<CategoryChart chartData={chartData} card={card} />
<MonthlyChart monthlyData={monthlyData} card={card} />
<BalanceChart data={balanceData} card={card} />
</div>

<div id="transactions">
<TransactionList
filtered={filtered}
editTransaction={editTransaction}
deleteTransaction={deleteTransaction}
row={row}
editBtn={editBtn}
deleteBtn={deleteBtn}
card={card}
/>
</div>

</div>

</div>

);

}


// =========================
// ESTILOS
// =========================

const container={
display:"flex",
background:"#020617",
color:"white",
minHeight:"100vh",
backgroundImage:`url(${worldMap})`,
backgroundRepeat:"no-repeat",
backgroundPosition:"center",
backgroundSize:"1200px"
};

const main={flex:1,padding:"40px"};

const cards={
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr",
gap:"20px"
};

const charts={
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"20px",
marginTop:"20px"
};

const card={
background:"rgba(255,255,255,0.05)",
padding:"20px",
borderRadius:"10px",
marginTop:"20px"
};

const form={
display:"grid",
gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto",
gap:"10px"
};

const inputStyle={
background:"#000",
color:"#fff",
border:"1px solid #334155",
padding:"8px",
borderRadius:"6px"
};

const row={
display:"grid",
gridTemplateColumns:"2fr 1fr 1fr 1fr auto auto",
gap:"10px",
padding:"10px",
borderBottom:"1px solid #333"
};

const editBtn={
background:"#2564eb56",
border:"none",
padding:"6px 10px",
borderRadius:"6px",
color:"white",
cursor:"pointer"
};

const deleteBtn={
background:"#dc2626",
border:"none",
padding:"6px 10px",
borderRadius:"6px",
color:"white",
cursor:"pointer"
};

export default Dashboard;