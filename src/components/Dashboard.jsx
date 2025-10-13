import React, { useEffect, useState } from "react";
import { fetchJobs } from "../api/api";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobsData = await fetchJobs();
      setJobs(jobsData.results || jobsData || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await API.delete(`jobs/${jobId}/`);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete job. Try again.");
    }
  };

  // ✅ Close / Open job
  const handleToggleStatus = async (jobId, isOpen) => {
    try {
      const endpoint = isOpen ? `jobs/${jobId}/close/` : `jobs/${jobId}/open/`;
      await API.patch(endpoint);
      setJobs(
        jobs.map((job) =>
          job.id === jobId ? { ...job, is_open: !isOpen } : job
        )
      );
    } catch (err) {
      console.error("Failed to update job status:", err);
      alert("Failed to update job status.");
    }
  };

  if (loading)
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="space-y-12">
      {/* ====== Top Stats ====== */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Total Jobs Posted</p>
          <p className="text-3xl font-bold text-[#D64948] mt-2">
            {jobs.length}
          </p>
        </div>
      </div>

      {/* ====== Job Management Section ====== */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Job Management
          </h2>
          <button
            onClick={() => navigate("/create-job")}
            className="bg-[#D64948] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#b63a39] transition"
          >
            + Create Job
          </button>
        </div>

        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-transform hover:scale-[1.01] p-6"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-[#D64948]">
                    {job.title}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${
                      job.is_open
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {job.is_open ? "Open" : "Closed"}
                  </span>
                </div>

                <p className="text-gray-600 mt-2 line-clamp-2">
                  {job.description?.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  Location: {job.location || "N/A"}
                </p>

                <div className="mt-5 flex gap-3 flex-wrap">
                  <button
                    onClick={() =>
                      navigate("/candidates", { state: { jobId: job.id } })
                    }
                    className="bg-[#D64948] px-4 py-2 text-white rounded-lg text-sm hover:bg-[#b63a39]"
                  >
                    View Candidates
                  </button>

                  <button
                    onClick={() => handleToggleStatus(job.id, job.is_open)}
                    className={`${
                      job.is_open
                        ? "bg-black-300 text-white-700 hover:bg-gray-100"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    } px-4 py-2 rounded-lg text-sm transition`}
                  >
                    {job.is_open ? "Close Job" : "Reopen Job"}
                  </button>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
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
