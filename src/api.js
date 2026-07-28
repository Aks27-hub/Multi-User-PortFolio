const API_BASE = "/api";

// Helper to attach authorization header
function getHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Helper to parse responses and handle errors
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  // Authentication
  async register(username, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(res);
  },

  async login(usernameOrEmail, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernameOrEmail, password }),
    });
    return handleResponse(res);
  },

  // Private Portfolio Profile CRUD
  async getProfile() {
    const res = await fetch(`${API_BASE}/portfolio/profile`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async upsertProfile(profile) {
    const res = await fetch(`${API_BASE}/portfolio/profile`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  // Private Portfolio Projects CRUD
  async getProjects() {
    const res = await fetch(`${API_BASE}/portfolio/projects`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createProject(project) {
    const res = await fetch(`${API_BASE}/portfolio/projects`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(project),
    });
    return handleResponse(res);
  },

  async deleteProject(id) {
    const res = await fetch(`${API_BASE}/portfolio/projects/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Private Portfolio Experience CRUD
  async getExperiences() {
    const res = await fetch(`${API_BASE}/portfolio/experiences`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createExperience(experience) {
    const res = await fetch(`${API_BASE}/portfolio/experiences`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(experience),
    });
    return handleResponse(res);
  },

  async deleteExperience(id) {
    const res = await fetch(`${API_BASE}/portfolio/experiences/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Public Endpoint
  async getPublicPortfolio(username) {
    const res = await fetch(`${API_BASE}/${username}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(res);
  }
};
