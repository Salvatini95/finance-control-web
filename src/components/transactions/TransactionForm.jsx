function TransactionForm({
editingId,
handleSubmit,
description,setDescription,
amount,setAmount,
type,setType,
category,setCategory,
date,setDate,
form,
inputStyle,
card
}){

return(

<div style={card}>

<h3>{editingId?"Editar":"Nova"} Transação</h3>

<form onSubmit={handleSubmit} style={form}>

<input style={inputStyle} placeholder="Descrição" value={description} onChange={e=>setDescription(e.target.value)}/>

<input style={inputStyle} type="number" placeholder="Valor" value={amount} onChange={e=>setAmount(e.target.value)}/>

<select style={inputStyle} value={type} onChange={e=>setType(e.target.value)}>
<option value="income">Entrada</option>
<option value="expense">Saída</option>
</select>

<input style={inputStyle} placeholder="Categoria" value={category} onChange={e=>setCategory(e.target.value)}/>

<input style={inputStyle} type="date" value={date} onChange={e=>setDate(e.target.value)}/>

<button>Salvar</button>

</form>

</div>

)

}

export default TransactionForm