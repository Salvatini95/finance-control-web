const API_URL = "http://localhost:5000/api";

// =========================
// AUTH
// =========================

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function registerUser(email, password, name) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return response;
}

// =========================
// HELPER — TOKEN
// =========================

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// =========================
// TRANSAÇÕES
// =========================

export async function getTransactions() {
  const response = await fetch(`${API_URL}/transactions`, {
    headers: getAuthHeaders(),
  });
  return response;
}

export async function createTransaction(data) {
  const response = await fetch(`${API_URL}/transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response;
}

export async function updateTransaction(id, data) {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return response;
}

export async function deleteTransaction(id) {
  const response = await fetch(`${API_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return response;
}