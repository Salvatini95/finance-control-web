# 💻 Finance Control — Web

Interface web do sistema de controle financeiro pessoal desenvolvido em React.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)

> 🔗 Backend: [finance-control-api](https://github.com/Salvatini95/finance-control-api)

---

## 📸 Telas

> Login, Dashboard, Analytics e Transações

<!-- Adicione prints aqui depois -->

---

## ✨ Funcionalidades

- 🔐 Tela de login e cadastro com animação de números financeiros
- 📊 Dashboard com gráficos de saldo, categorias e entradas vs saídas
- 📋 Página de transações estilo planilha com filtros e ordenação
- ✏️ Edição e exclusão de transações via modal
- 📈 Página de Analytics com gráficos avançados
- 🧭 Sidebar retrátil com navegação entre páginas
- 📱 Compatível com rede local (acesso via celular e outros PCs)

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| React 18 | Interface |
| React Router DOM | Navegação entre páginas |
| Recharts | Gráficos interativos |
| Tailwind CSS | Estilização |
| Vite | Bundler e servidor de desenvolvimento |

---

## 📁 Estrutura
```
src/
├── components/
│   ├── charts/          # BalanceChart, CategoryChart, MonthlyChart, HeatmapChart
│   ├── filters/         # Filtros reutilizáveis
│   ├── layout/          # Sidebar
│   └── transactions/    # TransactionForm, TransactionList
├── pages/
│   ├── Dashboard.jsx    # Painel principal com gráficos
│   ├── Analytics.jsx    # Análises avançadas
│   ├── Transactions.jsx # Planilha de transações
│   └── Login.jsx        # Login e cadastro
└── services/
    └── api.js           # Funções de comunicação com o backend
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Backend rodando ([finance-control-api](https://github.com/Salvatini95/finance-control-api))

### Instalação
```bash
# Clone o repositório
git clone https://github.com/Salvatini95/finance-control-web.git

# Entre na pasta
cd finance-control-web

# Instale as dependências
npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:
```
VITE_API_URL=http://localhost:5000/api
```

> Para acesso em rede local, substitua `localhost` pelo IP da máquina que roda o backend.

### Execução
```bash
npm run dev
```

> Acesse em: `http://localhost:5173`

---

## 🔒 Autenticação

- Login e cadastro integrados com JWT
- Token salvo no `localStorage`
- Rotas protegidas com `ProtectedRoute`
- Redirecionamento automático para login se token inválido

---

## 🗺️ Próximos passos

- [ ] Página de perfil do usuário
- [ ] Exportar relatórios em PDF
- [ ] Filtros avançados por período
- [ ] Deploy em produção (Vercel)
- [ ] Tema claro/escuro

---

## 👨‍💻 Autor

Desenvolvido por **Guilherme Salvatini**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin)](https://www.linkedin.com/in/guilherme-salvatini-623326361/)
[![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/Salvatini95)