/*const API_URL = "http://localhost:3000"; // cambia a tu backend

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => null);
}
*/

// src/utils/api.js
//const API_URL = "http://api.eduarduino.cl"; // backend en tu máquina

//const API_URL = "http://localhost:3000"; // Para desarrollo local
//const API_URL = "https://walks-flexibility-handle-local.trycloudflare.com"; // Para desarrollo local ironhost
//const API_URL = "https://backend-lock-iot.onrender.com"; // Backend en Render
const API_URL = "https://api-lockiot.ironhost.cl"; // Backend en ironhost

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => null);
}
