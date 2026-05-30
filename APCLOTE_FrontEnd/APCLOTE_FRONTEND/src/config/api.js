const getDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(hostname);

    return isLocalHost ? "http://localhost:9898" : "https://backend.apclote.in";
  }

  return "http://localhost:9898";
};

const normalizeBaseUrl = (value) => String(value || getDefaultBaseUrl()).replace(/\/+$/, "");

const normalizePath = (path = "") => {
  const safePath = String(path).trim();
  return safePath ? (safePath.startsWith("/") ? safePath : `/${safePath}`) : "";
};

export const BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
export const API_URL = `${BASE_URL}/api`;

export const buildUrl = (path = "") => `${BASE_URL}${normalizePath(path)}`;
export const buildApiUrl = (path = "") => `${API_URL}${normalizePath(path)}`;
