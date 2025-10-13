import React, { useEffect, useState } from "react";
import {
  fetchJobs,
  fetchApplications,
  updateApplicationStage,
} from "../api/api";
import { useNavigate } from "react-router-dom";

const stageColors = {
  applied: "bg-gray-100 text-gray-700",
  phone_screen: "bg-yellow-100 text-yellow-700",
  interview: "bg-indigo-100 text-indigo-700",
  offered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const jobsData = await fetchJobs();
        const appsData = await fetchApplications();

        setJobs(jobsData.results || jobsData || []);
        if (Array.isArray(appsData)) setApplications(appsData);
        else if (appsData.results) setApplications(appsData.results);
        else setApplications([]);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStageChange = async (appId, newStage) => {
    try {
      const updated = await updateApplicationStage(appId, newStage);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? updated : app))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update stage");
    }
  };

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div>
      {/* === Stats === */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Jobs</p>
          <p className="text-2xl font-bold text-[#D64948]">{jobs.length}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Total Applications</p>
          <p className="text-2xl font-bold text-[#D64948]">
            {applications.length}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm text-gray-500">Interviews Scheduled</p>
          <p className="text-2xl font-bold text-[#D64948]">
            {applications.filter((a) => a.stage === "interview").length}
          </p>
        </div>
      </div>

      {/* === Jobs === */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Jobs</h2>
          <button
            className="bg-[#D64948] text-white px-4 py-2 rounded-lg hover:bg-[#b63a39] transition"
            onClick={() => navigate("/create-job")}
          >
            + Create Job
          </button>
        </div>

        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:scale-[1.01] transition transform p-6"
              >
                <h3 className="text-lg font-bold text-[#D64948]">{job.title}</h3>
                <p className="text-gray-600 mt-2">
                  {job.description?.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-700 mt-3">📍 {job.location}</p>
                <div className="mt-4 flex gap-3">

                <button
                  onClick={() => navigate("/candidates", { state: { jobId: job.id } })}
                  className="bg-[#D64948] px-3 py-1 text-white rounded-lg text-sm hover:bg-[#b63a39]"
                >
                  View Applications
                </button>

                <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-300">
                  Delete
                </button>
            </div>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No jobs available.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
