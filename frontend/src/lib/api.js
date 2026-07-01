import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"}/api`;

const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

const stored = localStorage.getItem("access_token");
// Keep a Bearer-token fallback for browsers that block third-party cookies.
if (stored) api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("access_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete api.defaults.headers.common["Authorization"];
  }
}

export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry || original.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (!refreshPromise) {
      refreshPromise = api.post("/auth/refresh").finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const { data } = await refreshPromise;
      setAuthToken(data.access_token);
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    } catch (refreshError) {
      setAuthToken(null);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
