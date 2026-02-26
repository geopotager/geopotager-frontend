import { API_URL } from "../constants";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
    throw new Error("Non autorisé");
  }

  return response;
}

export async function login(email: string, password: string) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Erreur login");
  }

  return response.json();
}

export async function getGardens() {
  const response = await apiFetch("/api/gardens");

  if (!response.ok) {
    throw new Error("Erreur récupération jardins");
  }

  return response.json();
}

export async function updateGarden(id: string, data: any) {
  const response = await apiFetch(`/api/gardens/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erreur mise à jour jardin");
  }

  return response.json();
}

export async function createGarden(data: any) {
  const response = await apiFetch("/api/gardens", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Erreur création jardin");
  }

  return response.json();
}