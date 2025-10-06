import axios from "axios";

const API = axios.create({
 baseURL: "http://127.0.0.1:8000/api/",

});


const initialToken = localStorage.getItem("access_token");
if (initialToken) {
    API.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;
}



API.interceptors.request.use((config) => {
 const token = localStorage.getItem("access_token");
 if (token && !config.headers.Authorization) {
  // Only set if not already present
  config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
}, (error) => Promise.reject(error));


// **********************************************
// 3. Authentication Helpers
// **********************************************
// Manual helper to set/remove token (use after login / logout)
export const setAuthToken = (token) => {
 if (token) {
  localStorage.setItem("access_token", token);
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
 } else {
  localStorage.removeItem("access_token");
  delete API.defaults.headers.common["Authorization"];
 }
};

// Login helper (call from AdminLogin)
export const login = async (username, password) => {
 const { data } = await API.post("token/", { username, password });
 const { access, refresh, role } = data;

 // store tokens & role
 localStorage.setItem("access_token", access);
 localStorage.setItem("refresh_token", refresh);
 localStorage.setItem("role", role ? role.toLowerCase() : "");

 // set default header immediately (This line is correct)
 API.defaults.headers.common["Authorization"] = `Bearer ${access}`;

 return data;
};

// Simple fetchUser helper
export const fetchUser = async () => {
 const role = (localStorage.getItem("role") || "").toLowerCase();
 return { role };
};


// **********************************************
// 4. API Endpoints (Data structure fixes remain correct)
// **********************************************

// Jobs
export const fetchJobs = async () => {
 const { data } = await API.get("jobs/");
 return data; // Assuming this endpoint returns an array directly
};
export const fetchJob = async (id) => {
 const { data } = await API.get(`jobs/${id}/`);
 return data;
};

// Applications (admin)
export const fetchApplications = async () => {
 const { data } = await API.get("applications/");
 return data.results; // CORRECT: Returns the array inside 'results'
};

export const updateApplicationStage = async (id, stage) => {
 const { data } = await API.patch(`applications/${id}/`, { stage });
 return data;
};

export const applyJob = async (id, formData) => {
 const { data } = await API.post(`jobs/${id}/apply/`, formData, {
 headers: { "Content-Type": "multipart/form-data" },
 });
 return data;
};

export default API;