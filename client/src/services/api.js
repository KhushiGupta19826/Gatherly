// Normalize base API URL to ensure it points to the API root without trailing slash
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const cleanApiUrl = rawApiUrl.replace(/\/+$/, "");
const API_URL = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;

const TOKEN_KEY = "focuscircle_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

let onUnauthorizedCallback = null;

export function setOnUnauthorized(cb) {
  onUnauthorizedCallback = cb;
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    setToken(null);
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new Error(data?.message || "Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request("/auth/me"),
};

export const goalsApi = {
  list: () => request("/goals"),
  create: (payload) =>
    request("/goals", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    request(`/goals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  remove: (id) =>
    request(`/goals/${id}`, {
      method: "DELETE",
    }),
};

export const roomsApi = {
  list: () => request("/rooms"),
  create: (payload) =>
    request("/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  join: (code) =>
    request("/rooms/join", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
  get: (id) => request(`/rooms/${id}`),
};

export const sessionsApi = {
  start: (roomId) =>
    request("/sessions/start", {
      method: "POST",
      body: JSON.stringify({ roomId }),
    }),
  end: (id) =>
    request(`/sessions/${id}/end`, {
      method: "PATCH",
    }),
  byRoom: (roomId) => request(`/sessions/room/${roomId}`),
};

export const checkinsApi = {
  join: (sessionId) =>
    request("/checkins/join", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
  submit: (payload) =>
    request("/checkins/submit", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  leave: (sessionId) =>
    request("/checkins/leave", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
  participants: (sessionId) => request(`/checkins/session/${sessionId}`),
};

export const analyticsApi = {
  me: () => request("/analytics/me"),
};
