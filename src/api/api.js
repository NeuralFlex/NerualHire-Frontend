import axios from "axios";


const BASE_URL = process.env.REACT_APP_API_URL;

const API = axios.create({
  baseURL: BASE_URL,
});


const initialToken = localStorage.getItem("access_token");
if (initialToken) {
  API.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}


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
  window.location.href = "/admin"; 
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


export const fetchJobs = async () => {
  const { data } = await axios.get(`${BASE_URL}jobs/`);
  return data;
};

export const fetchJob = async (id) => {
  const { data } = await axios.get(`${BASE_URL}jobs/${id}/`);
  return data;
};


export const fetchApplications = async () => {
  const { data } = await API.get("applications/");
  return data.results || data; 
};

export const updateApplicationStage = async (id, stage) => {
  const { data } = await API.patch(`applications/${id}/`, { stage });
  return data;
};


export const applyJob = async (id, formData) => {
  const { data } = await axios.post(`${BASE_URL}jobs/${id}/apply/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default API;
