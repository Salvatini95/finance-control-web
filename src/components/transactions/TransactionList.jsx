function TransactionList({
filtered,
editTransaction,
deleteTransaction,
row,
editBtn,
deleteBtn,
card
}){

return(

<div style={card}>

<h3>Transações</h3>

{filtered.map(t=>(

<div key={t.id} style={row}>

<span>{t.description}</span>
<span>{t.category}</span>
<span>{t.date}</span>

<span style={{color:t.type==="income"?"#00ff88":"#ff4d4d"}}>
{t.type==="expense"?"-":"+"} R$ {t.amount}
</span>

<button style={editBtn} onClick={()=>editTransaction(t)}>Editar</button>

<button style={deleteBtn} onClick={()=>deleteTransaction(t.id)}>Excluir</button>

</div>

))}

</div>

)

}

export default TransactionList