import { useEffect, useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import BalanceChart from "../components/charts/BalanceChart";
import HeatmapChart from "../components/charts/HeatmapChart";

const API_URL = import.meta.env.VITE_API_URL;

function Analytics(){

const [transactions,setTransactions]=useState([]);
const [sidebarOpen,setSidebarOpen]=useState(false);
const [loading,setLoading]=useState(true);

const token = localStorage.getItem("token");


// =========================
// BUSCAR TRANSAÇÕES
// =========================

const fetchTransactions = async () => {

if(!token){
window.location.href = "/";
return;
}

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

if(res.status === 401 || res.status === 422){
localStorage.removeItem("token");
window.location.href = "/";
return;
}

const data = await res.json();

if(Array.isArray(data)){
setTransactions(data);
}else{
setTransactions([]);
}

}catch(err){
console.log("Erro ao buscar", err);
setTransactions([]);
}

setLoading(false);

};

useEffect(()=>{
fetchTransactions();
},[token]);


// =========================
// PROCESSAMENTO
// =========================

let running = 0;

const safeTransactions = Array.isArray(transactions) ? transactions : [];

const balanceData = [...safeTransactions]
.sort((a,b)=> new Date(a.date) - new Date(b.date))
.map(t=>{
running += t.type === "income" ? t.amount : -t.amount;
return{ date: t.date, balance: running };
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

<h1>Analytics Financeiro</h1>

<BalanceChart
data={balanceData}
card={card}
/>

<HeatmapChart
transactions={safeTransactions}
card={card}
/>

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
minHeight:"100vh"
};

const main={
flex:1,
padding:"40px"
};

const card={
background:"rgba(255,255,255,0.05)",
padding:"20px",
borderRadius:"10px",
marginTop:"20px"
};

export default Analytics;