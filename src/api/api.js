import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

// Axios instance with baseURL
const API = axios.create({
  baseURL: BASE_URL,
});

// Helpers
const getAccessToken = () => localStorage.getItem("access_token");
const getRefreshToken = () => localStorage.getItem("refresh_token");

const setAuthHeader = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Initialize auth header if a token exists
const initialToken = getAccessToken();
if (initialToken) setAuthHeader(initialToken);

// REQUEST INTERCEPTOR: ensure Authorization header is present
API.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    config.headers = config.headers || {};
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token queue handling
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// RESPONSE INTERCEPTOR: auto-refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = "Bearer " + token;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn("No refresh token found, logging out.");
        logoutUser();
        return Promise.reject(error);
      }

      try {
        // Use plain axios for refresh (no interceptors)
        const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccess = data.access;
        localStorage.setItem("access_token", newAccess);
        setAuthHeader(newAccess);

        processQueue(null, newAccess);
        isRefreshing = false;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = "Bearer " + newAccess;
        return API(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        console.error("Token refresh failed:", err);
        logoutUser();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Public helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
    setAuthHeader(token);
  } else {
    localStorage.removeItem("access_token");
    setAuthHeader(null);
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  setAuthHeader(null);
  window.location.href = "/admin";
};

// Login helper
export const login = async (username, password) => {
  const { data } = await API.post("token/", { username, password });
  const { access, refresh, role } = data;

  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("role", role ? role.toLowerCase() : "");

  setAuthHeader(access);
  return data;
};

// Fetch user role (from localStorage)
export const fetchUser = async () => {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  return { role };
};

// Jobs
export const fetchJobs = async () => {
  const { data } = await API.get("jobs/");
  return data;
};

export const fetchJob = async (id) => {
  const { data } = await API.get(`jobs/${id}/`);
  return data;
};

// Applications
// - Accepts either a full "next/previous" URL string OR a params object
// - Params supported: { stage, job, page, page_size, search, ordering, ... }
export const fetchApplications = async (arg = null) => {
  if (typeof arg === "string" && arg) {
    // Absolute URL from Django's pagination ("next" / "previous")
    const { data } = await API.get(arg);
    return data;
  }
  const params = arg || {};
  const { data } = await API.get("applications/", { params });
  return data;
};

// Fetch all pages across server pagination (optionally filtered)
export const fetchAllApplications = async (params = {}) => {
  let url = `${BASE_URL}applications/`;
  const hasParams = params && Object.keys(params).length > 0;
  if (hasParams) {
    const usp = new URLSearchParams(params);
    url = `${BASE_URL}applications/?${usp.toString()}`;
  }

  let all = [];
  while (url) {
    const { data } = await API.get(url);
    const results = data.results || data;
    all = all.concat(results);
    url = data.next || null;
  }
  return all;
};

// Update a single application stage
export const updateApplicationStage = async (id, stage) => {
  const { data } = await API.patch(`applications/${id}/`, { stage });
  return data;
};

// Apply to a job (multipart)
export const applyJob = async (id, formData) => {
  const { data } = await API.post(`jobs/${id}/apply/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default API;