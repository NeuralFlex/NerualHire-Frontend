import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Grab token from localStorage on page load
const token = localStorage.getItem("access_token");
if (token) {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Set token dynamically after login
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete API.defaults.headers.common["Authorization"];
  }
};

// Login function
export const login = async (email, password) => {
  const { data } = await API.post("token/", { email, password });

  const { access, refresh, role } = data;

  // Store tokens + role
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("role", role);

  API.defaults.headers.common["Authorization"] = `Bearer ${access}`;

  return data;
};

// Fetch user info from localStorage
export const fetchUser = async () => {
  const role = localStorage.getItem("role");
  return { role }; // can expand with more info if needed
};

// Fetch jobs
export const fetchJobs = async () => {
  const { data } = await API.get("jobs/");
  return data;
};

// Fetch single job
export const fetchJob = async (id) => {
  const { data } = await API.get(`jobs/${id}/`);
  return data;
};

// Fetch applications
export const fetchApplications = async () => {
  const { data } = await API.get("applications/");
  return data;
};

// Update application stage
export const updateApplicationStage = async (id, stage) => {
  const { data } = await API.patch(`applications/${id}/`, { stage });
  return data;
};

// Apply for a job
export const applyJob = async (id, formData) => {
  const { data } = await API.post(`jobs/${id}/apply/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export default API;
