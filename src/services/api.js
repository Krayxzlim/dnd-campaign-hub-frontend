import { supabase, configurationError } from "./supabase";
const BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

async function request(method, path, body) {
  if (!supabase) throw new Error(configurationError);
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error("Iniciá sesión para continuar.");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `Error HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  me: () => request("GET", "/auth/me"),

  // campañas
  getCampaigns: () => request("GET", "/campaigns"),
  getCampaign: (id) => request("GET", `/campaigns/${id}`),
  createCampaign: (data) => request("POST", "/campaigns", data),
  updateCampaign: (id, data) => request("PUT", `/campaigns/${id}`, data),
  deleteCampaign: (id) => request("DELETE", `/campaigns/${id}`),
  addPlayer: (campaignId, playerId) =>
    request("POST", `/campaigns/${campaignId}/players`, { playerId }),
  removePlayer: (campaignId, playerId) =>
    request("DELETE", `/campaigns/${campaignId}/players/${playerId}`),

  // misiones
  getMissions: (campaignId) =>
    request("GET", `/missions${campaignId ? `?campaignId=${campaignId}` : ""}`),
  createMission: (data) => request("POST", "/missions", data),
  updateMission: (id, data) => request("PUT", `/missions/${id}`, data),
  deleteMission: (id) => request("DELETE", `/missions/${id}`),
  assignMission: (id, playerId) =>
    request("POST", `/missions/${id}/assign`, { playerId }),
  acceptMission: (id) => request("POST", `/missions/${id}/accept`),
  completeMission: (id) => request("POST", `/missions/${id}/complete`),

  // encuentros
  getEncounters: (campaignId) =>
    request(
      "GET",
      `/encounters${campaignId ? `?campaignId=${campaignId}` : ""}`,
    ),
  getEncounter: (id) => request("GET", `/encounters/${id}`),
  createEncounter: (data) => request("POST", "/encounters", data),
  updateEncounter: (id, data) => request("PUT", `/encounters/${id}`, data),
  startEncounter: (id) => request("POST", `/encounters/${id}/start`),
  applyDamage: (id, data) => request("PATCH", `/encounters/${id}/damage`, data),
  nextRound: (id) => request("POST", `/encounters/${id}/nextround`),
  endEncounter: (id) => request("POST", `/encounters/${id}/end`),
  deleteEncounter: (id) => request("DELETE", `/encounters/${id}`),

  // mosntruos
  getMonsters: () => request("GET", "/monsters"),
  // Busca monstruos con filtros opcionales (nombre, tipo, CR). Solo
  // agrega los params que vengan con valor, para no mandar ?search=&type=
  // vacios al backend.
  searchMonsters: ({ search, type, cr, page } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (cr) params.set("cr", cr);
    if (page) params.set("page", page);
    const qs = params.toString();
    return request("GET", `/monsters${qs ? `?${qs}` : ""}`);
  },
  // Detalle completo de un monstruo puntual (atributos, habilidades,
  // acciones, acciones legendarias) para el modal de ficha.
  getMonsterDetail: (slug) => request("GET", `/monsters/${slug}`),
  createMonster: (data) => request("POST", "/monsters", data),
  deleteMonster: (id) => request("DELETE", `/monsters/${id}`),

  // usuarios
  getUsers: () => request("GET", "/users"),
  getPlayers: (email) =>
    request("GET", `/users/players?email=${encodeURIComponent(email)}`),
  getCharacters: (campaignId) =>
    request(
      "GET",
      `/characters${campaignId ? `?campaignId=${campaignId}` : ""}`,
    ),
};
