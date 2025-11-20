import React, { useEffect, useState } from "react";
import { fetchJobs } from "../api/api";
import { useNavigate } from "react-router-dom";


const KpiCard = ({ title, value, icon, colorClass = 'text-[#C23D3D]' }) => (
  <div className="bg-white shadow-xl rounded-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-2xl">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className={`text-5xl font-bold mt-1 ${colorClass} tracking-tight`}>{value}</p>
      </div>
      {/* Icon uses a subtle background color */}
      <span className={`p-3 rounded-full bg-opacity-10 ${colorClass.replace('text', 'bg')} bg-opacity-10`}>
        {icon}
      </span>
    </div>
  </div>
);

/**
 * 2. REFINED Skeleton Loader Component
 * - Uses subtle gray shades for a smoother animation.
 */
const JobCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-2 bg-gray-200 rounded w-5/6 mb-5"></div>
    <div className="h-2 bg-gray-300 rounded w-1/3 mt-4 mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-2/5"></div>
  </div>
);

// --- END: REFINED UI Helper Components ---

const Dashboard = () => {
  // ... (State and API functions remain unchanged) ...
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



  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    // ... (delete logic)
  };

  const handleToggleStatus = async (jobId, isOpen) => {
    // ... (toggle logic)
  };

  // --- LOADING STATE (Now using refined Skeleton Loader) ---
  if (loading)
    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JobCardSkeleton /><JobCardSkeleton /><JobCardSkeleton />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <JobCardSkeleton /><JobCardSkeleton />
        </div>
      </div>
    );
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="space-y-12">

      {/* --- 1. REFINED KPI WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total Jobs Posted"
          value={jobs.length}
          colorClass="text-[#C23D3D]" // Decent Red
        />
        <KpiCard
          title="Active Job Openings"
          value={jobs.filter(j => j.is_open).length}
          colorClass="text-green-600" // Clean Green
        />
      </div>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Job Management
          </h2>
          {/* Action Button Polish */}
          <button
            onClick={() => navigate("/create-job")}
            className="bg-[#C23D3D] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition duration-300 shadow-md hover:bg-[#a13131] hover:shadow-lg"
          >
            + Create Job
          </button>
        </div>

        {jobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {jobs.map((job) => {
              const progressPercentage = job.total_candidates
                ? Math.round((job.candidates_in_review / job.total_candidates) * 100)
                : 0;

              return (
                <div
                  key={job.id}
                  // Card Hover is now more pronounced and smooth
                  className="bg-white rounded-xl border border-gray-100 shadow-md transition duration-300 hover:shadow-xl hover:translate-y-[-2px] p-6"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-[#C23D3D]">
                      {job.title}
                    </h3>
                    {/* Status Tag Polish */}
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold border ${job.is_open
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                      {job.is_open ? "Open" : "Closed"}
                    </span>
                  </div>

                  <p className="text-gray-600 line-clamp-2 leading-relaxed">
                    {job.description?.substring(0, 100)}...
                  </p>
                  <p className="text-sm text-gray-500 mt-3 font-medium">
                    Location: {job.location || "N/A"}
                  </p>

                  <div className="mt-6 flex gap-3 flex-wrap border-t pt-4 border-gray-100">
                    {/* Buttons: Added more distinct hover/focus states */}
                    <button
                      onClick={() => navigate("/candidates", { state: { jobId: job.id } })}
                      className="bg-[#C23D3D] px-4 py-2 text-white rounded-lg text-sm font-medium transition duration-150 hover:bg-[#a13131] hover:shadow-md"
                    >
                      View Candidates
                    </button>

                    <button
                      onClick={() => handleToggleStatus(job.id, job.is_open)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ${job.is_open
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    >
                      {job.is_open ? "Close Job" : "Reopen Job"}
                    </button>
                    <button
                      onClick={() => navigate(`/edit-job/${job.id}`)}
                      className="text-blue-700 px-4 py-2 rounded-lg text-sm font-medium border border-blue-200 hover:bg-blue-50 transition duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-red-700 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 hover:bg-red-50 transition duration-150"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 italic">There are no active jobs to manage.</p>
            <button
              onClick={() => navigate("/create-job")}
              className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Create Your First Job
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;