// app.js — thin client for the CoAuthorLab API
const CoAuthorLabAPI = (() => {
  const base = () => (window.COAUTHORLAB_API_BASE !== undefined ? window.COAUTHORLAB_API_BASE : "http://localhost:4000");

  async function request(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
      const token = localStorage.getItem("coauthorlab_token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(base() + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function saveSession(token, user) {
    localStorage.setItem("coauthorlab_token", token);
    localStorage.setItem("coauthorlab_user", JSON.stringify(user));
  }

  function currentUser() {
    try {
      return JSON.parse(localStorage.getItem("coauthorlab_user") || "null");
    } catch {
      return null;
    }
  }

  function signOut() {
    localStorage.removeItem("coauthorlab_token");
    localStorage.removeItem("coauthorlab_user");
  }

  return { request, saveSession, currentUser, signOut };
})();

// Reflect signed-in state in the header "Sign in" link across static pages.
document.addEventListener("DOMContentLoaded", () => {
  const signInLink = document.querySelector(".header-actions .sign-in");
  const user = CoAuthorLabAPI.currentUser();
  if (signInLink && user) {
    signInLink.textContent = user.name.split(" ")[0];
    signInLink.href = "workspace.html";
  }
});
