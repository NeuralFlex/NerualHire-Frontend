import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import JobList from "./components/JobList";
import JobDetail from "./components/JobDetail";
import ApplyForm from "./components/ApplyForm";
import AdminLogin from "./components/AdminLogin";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import CandidatesPipeline from "./components/CandidatesPipeline";
import CreateJobPage from "./components/create-job";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public pages */}
          <Route path="/" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/apply" element={<ApplyForm />} />
          <Route path="/candidates" element={<CandidatesPipeline />} />

          {/* Admin pages */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-job"
            element={
              <PrivateRoute>
                <CreateJobPage />
              </PrivateRoute>
            }
          />
          
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
