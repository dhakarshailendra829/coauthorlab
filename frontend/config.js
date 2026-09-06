// config.js — tells the frontend where the API lives.
//
// OPTION A (recommended, simplest): the backend serves this frontend itself
// (SERVE_FRONTEND=true). In that case the API is on the SAME origin as the
// page, so leave this as an empty string.
//
// OPTION B: frontend and backend are hosted separately (e.g. frontend on
// Netlify, backend on Render). Set the full backend URL instead, e.g.:
//   window.COAUTHORLAB_API_BASE = "https://coauthorlab-api.onrender.com";
window.COAUTHORLAB_API_BASE = window.COAUTHORLAB_API_BASE || "";
