import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

const API = axios.create({
  baseURL: BASE_URL,
});

// **********************************************
// 1. Initialize Authorization if token exists
// **********************************************
const initialToken = localStorage.getItem("access_token");
if (initialToken) {
  API.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}

// **********************************************
// 2. Request Interceptor — always attach token
// **********************************************
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// **********************************************
// 3. Response Interceptor — Auto Refresh Expired Token
// **********************************************
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait if a refresh is already happening
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return API(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        console.warn("No refresh token found, logging out.");
        logoutUser();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshToken,
        });
        const newAccess = data.access;

        localStorage.setItem("access_token", newAccess);
        API.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;

        processQueue(null, newAccess);
        isRefreshing = false;

        // Retry original request with new token
        originalRequest.headers["Authorization"] = "Bearer " + newAccess;
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

// **********************************************
// 4. Authentication Helpers
// **********************************************
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete API.defaults.headers.common["Authorization"];
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("role");
  delete API.defaults.headers.common["Authorization"];
  window.location.href = "/login"; // redirect to login page
};

// Login helper (used in AdminLogin)
export const login = async (username, password) => {
  const { data } = await API.post("token/", { username, password });
  const { access, refresh, role } = data;

  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("role", role ? role.toLowerCase() : "");

  API.defaults.headers.common["Authorization"] = `Bearer ${access}`;

  return data;
};

// Fetch user role
export const fetchUser = async () => {
  const role = (localStorage.getItem("role") || "").toLowerCase();
  return { role };
};

// **********************************************
// 5. Job Endpoints (Public Read Access)
// **********************************************
export const fetchJobs = async () => {
  // Public endpoint — no auth needed
  const { data } = await axios.get(`${BASE_URL}jobs/`);
  return data;
};

export const fetchJob = async (id) => {
  const { data } = await axios.get(`${BASE_URL}jobs/${id}/`);
  return data;
};

// **********************************************
// 6. Application Endpoints (Admin only)
// **********************************************
export const fetchApplications = async () => {
  const { data } = await API.get("applications/");
  return data.results || data; // handle both paginated & non-paginated
};

export const updateApplicationStage = async (id, stage) => {
  const { data } = await API.patch(`applications/${id}/`, { stage });
  return data;
};

// **********************************************
// 7. Candidate Job Application (Public)
// **********************************************
export const applyJob = async (id, formData) => {
  const { data } = await axios.post(`${BASE_URL}jobs/${id}/apply/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default API;
