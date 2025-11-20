import React, { useEffect, useState } from "react";
import { fetchJobs } from "../api/api";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// --- START: NEW UI Helper Components ---

// 1. KPI Card Component (for data visualization)
const KpiCard = ({ title, value, icon, colorClass = 'text-red-600' }) => (
  <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-6 transition-all duration-300 hover:shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={`text-4xl font-extrabold mt-1 ${colorClass}`}>{value}</p>
      </div>
      {/* Placeholder Icon (replace with a real icon from an icon library later) */}
      <span className={`p-2 rounded-full bg-opacity-10 ${colorClass.replace('text', 'bg')} bg-opacity-20`}>
        {icon}
      </span>
    </div>
  </div>
);

// Placeholder Icons (simple letters for now, install lucide-react or similar later)
const JobIcon = <span className="text-xl font-bold">J</span>;
const CandidateIcon = <span className="text-xl font-bold">C</span>;


// 2. Skeleton Loader Component (for better UX during loading)
const JobCardSkeleton = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-5/6 mb-5"></div>
        <div className="h-2 bg-gray-300 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-300 rounded w-2/5"></div>
    </div>
);

// --- END: NEW UI Helper Components ---

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
            // MOCK DATA: Adding candidates count for the progress bar later
            const mockedJobs = (jobsData.results || jobsData || []).map(job => ({
                ...job,
                // Assume these come from the API in a real scenario
                total_candidates: Math.floor(Math.random() * 20) + 5, 
                candidates_in_review: Math.floor(Math.random() * 5) + 1, 
            }));
            setJobs(mockedJobs);
        } catch (err) {
            console.error(err);
            setError("Failed to load jobs.");
        } finally {
            setLoading(false);
        }
    };
    
    // Total candidates pipeline count
    const totalCandidates = jobs.reduce((sum, job) => sum + (job.total_candidates || 0), 0);

    // ... (handleDelete and handleToggleStatus functions remain unchanged)

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


    // --- ENHANCEMENT 3: Skeleton Loader Implementation ---
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
            
            {/* --- ENHANCEMENT 1: Enhanced KPI Widgets Row --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Total Jobs Posted (Existing data, new look) */}
                <KpiCard
                    title="Total Jobs Posted"
                    value={jobs.length}
                    icon={JobIcon}
                    colorClass="text-[#D64948]"
                />
                {/* 2. Candidates in Pipeline (New, important metric) */}
                <KpiCard
                    title="Total Candidates"
                    value={totalCandidates}
                    icon={CandidateIcon}
                    colorClass="text-blue-600"
                />
                {/* 3. Open Jobs Count (New metric) */}
                <KpiCard
                    title="Active Job Openings"
                    value={jobs.filter(j => j.is_open).length}
                    icon={JobIcon}
                    colorClass="text-green-600"
                />
            </div>

            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Job Management
                    </h2>
                    <button
                        onClick={() => navigate("/create-job")}
                        className="bg-[#D64948] text-white px-5 py-2 rounded-lg text-sm transition duration-300 hover:bg-[#b63a39] hover:shadow-lg"
                    >
                        + Create Job
                    </button>
                </div>

                {jobs.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {jobs.map((job) => {
                            // Calculate progress for the new widget
                            const progressPercentage = job.total_candidates 
                                ? Math.round((job.candidates_in_review / job.total_candidates) * 100)
                                : 0;
                            
                            return (
                                <div
                                    key={job.id}
                                    // ANIMATION: Job Card Hover Scale and Shadow
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm transition duration-300 hover:shadow-xl hover:scale-[1.01] p-6"
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
                                    
                                    {/* --- ENHANCEMENT 2: Job Card Progress Widget --- */}
                                    <div className="mt-3 mb-4">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span className="font-semibold">{job.candidates_in_review || 0}</span>
                                            <span>of {job.total_candidates || 0} Total Applications</span>
                                        </div>
                                        {/* Simple Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                            <div 
                                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    {/* ----------------------------------------------- */}


                                    <p className="text-gray-600 line-clamp-2">
                                        {job.description?.substring(0, 100)}...
                                    </p>
                                    <p className="text-sm text-gray-500 mt-3">
                                        Location: {job.location || "N/A"}
                                    </p>

                                    <div className="mt-5 flex gap-3 flex-wrap">
                                        {/* Buttons remain mostly the same, ensuring transition class is present */}
                                        <button
                                            onClick={() => navigate("/candidates", { state: { jobId: job.id } })}
                                            className="bg-[#D64948] px-4 py-2 text-white rounded-lg text-sm transition duration-150 hover:bg-[#b63a39]"
                                        >
                                            View Candidates
                                        </button>

                                        <button
                                            onClick={() => handleToggleStatus(job.id, job.is_open)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                                                job.is_open
                                                    ? "bg-gray-400 text-white hover:bg-gray-500" 
                                                    : "bg-green-600 text-white hover:bg-green-700" // Reopen uses a more positive color
                                            }`}
                                        >
                                            {job.is_open ? "Close Job" : "Reopen Job"}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/edit-job/${job.id}`)}
                                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm transition duration-150 hover:bg-blue-200"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition duration-150 hover:bg-gray-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">No jobs available.</p>
                )}
            </section>
        </div>
    );
};

export default Dashboard;