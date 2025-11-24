import React, { useEffect, useState } from "react";
import { fetchJobs } from "../api/api";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { Briefcase,CheckCircle,Clock4, } from "lucide-react";

const KpiCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white shadow-xl rounded-xl border border-gray-100 p-5 flex items-center transition gap-4 hover:shadow-2xl">
    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border">
      <Icon className='w-6 h-6 text-red-600'/>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase text-gray-600">{title}</p>
        <p className={`text-3xl font-bold mt-1 text-red-500`}>{value}</p>
      </div>
    </div>
);

const JobCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
    <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-2 bg-gray-200 rounded w-5/6 mb-5"></div>
    <div className="h-2 bg-gray-300 rounded w-1/3 mt-4 mb-4"></div>
    <div className="h-10 bg-gray-300 rounded w-1/2"></div>
  </div>
);

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingJobId, setupdatingJobId] = useState(null);
  const [search,setSearch]=useState("");
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
    try {
      await API.delete(`jobs/${jobId}/`);
      setJobs(jobs.filter((job) => job.id !== jobId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete job. Try again.");
    }
  };

  const handleToggleStatus = async (jobId, isOpen) => {
    const action = isOpen ? "close" : "reopen";
    if (!window.confirm(`Are you sure you want to ${action} this job?`)) return;

    setupdatingJobId(jobId);// loading state
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
    } finally {
      setupdatingJobId(null);//stop loading state
    }
  };

//Search Function
  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );


  if (loading)
    return (
      <div className="space-y-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      </div>
    );
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div className="space-y-12 p-6 min-h-screen bg-gray-50">

      {/* Page header */}
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-gray-900"> Dashboard Overview</h1>
      </header>

      {/* --- 1. REFINED KPI WIDGETS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total Jobs"
          value={jobs.length}
          icon={Briefcase}
        />
        <KpiCard
          title="Active Openings"
          value={jobs.filter(j => j.is_open).length}
          icon={Clock4}
        />
        <KpiCard
          title="Closed Jobs"
          value={jobs.filter(j => !j.is_open).length}
          icon={CheckCircle}
          />
      </div>

      {/* SEARCH + CREATE BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search Jobs by Title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 w-full md:w-96 border rounded-lg bg-white shadow-md focus:ring-2 focus:ring-[#C23D3D] outline-none"
        />

        <button
          onClick={() => navigate("/create-job")}
          className="bg-[#C23D3D] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:bg-[#a23131] transition"
        >
          + Create Job
        </button>
      </div>

      <section>
          <h2 className="text-2xl font-bold text-gray-800 ">
            Job Management
          </h2>
          

        {filteredJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6 mt-5">
            {filteredJobs.map((job) => {
              const isUpdating = updatingJobId === job.id;
              return (
                <div
                  key={job.id}
                  // Card Hover is now more pronounced and smooth
                  className="bg-white rounded-xl border-l-4 border-gray-100 shadow-md transition hover:shadow-xl p-5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-[#C23D3D]">
                      {job.title}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold border ${job.is_open
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                      {job.is_open ? "Open" : "Closed"}
                    </span>
                  </div>

                  <p className="text-gray-600 mt-3 line-clamp-2">
                    {job.description?.substring(0, 120)}...
                  </p>
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                    Location: {job.location || "N/A"}
                  </p>

                  <div className="mt-5 flex gap-3 flex-wrap border-t pt-4 border-gray-100">
                    {/* Buttons: Added more distinct hover/focus states */}
                    <button
                      onClick={() => navigate("/candidates", { state: { jobId: job.id } })}
                      className="bg-[#C23D3D] px-4 py-2 text-white rounded-lg text-sm hover:bg-[#a23131] transition"
                    >
                      View Candidates
                    </button>

                    <button
                      onClick={() => handleToggleStatus(job.id, job.is_open)}
                      disabled={isUpdating} //disable button while loading
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition
                        ${isUpdating
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : job.is_open
                            ? "bg-gray-400 text-white hover:bg-gray-700"
                            : "bg-gray-600 text-white hover:bg-gray-700"
                        }`}
                    >
                      {isUpdating ? (
                        <>
                          {job.is_open ? "Closing..." : "Reopening..."}
                        </>
                      ) : (
                        job.is_open ? "Close Job" : "Reopen Job"
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/edit-job/${job.id}`)}
                      className="text-blue-700 px-4 py-2 rounded-lg text-sm border border-blue-200 hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="text-red-700 px-4 py-2 rounded-lg text-sm border border-red-200 hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <p className="text-gray-500 font-medium">There are no active jobs to manage.</p>
            <button
              onClick={() => navigate("/create-job")}
              className="mt-4 bg-[#C23D3D] text-white px-5 py-2 rounded-lg text-sm hover:bg-[#a23131] transition"
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