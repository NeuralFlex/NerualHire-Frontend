import React, { useEffect, useState } from "react";
import {
  fetchJobs,
  fetchApplications,
  updateApplicationStage,
} from "../api/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
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
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

        <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-6">
          <p className="text-sm text-gray-500">Interviews Scheduled</p>
          <p className="text-3xl font-bold text-[#D64948] mt-2">
            {applications.filter((a) => a.stage === "interview").length}
          </p>
        </div>
      </div>

      {/* ====== Recent Job Postings ====== */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Job Postings
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
            {jobs.slice(0, 4).map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-transform hover:scale-[1.01] p-6"
              >
                <h3 className="text-lg font-bold text-[#D64948]">
                  {job.title}
                </h3>
                <p className="text-gray-600 mt-2 line-clamp-2">
                  {job.description?.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-500 mt-3">
                  Location: {job.location}
                </p>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() =>
                      navigate("/candidates", { state: { jobId: job.id } })
                    }
                    className="bg-[#D64948] px-4 py-2 text-white rounded-lg text-sm hover:bg-[#b63a39]"
                  >
                    View Candidates
                  </button>

                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No job postings yet.</p>
        )}
      </section>

      {/* ====== Recent Candidates Section ====== */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Recent Candidates
        </h2>
        {applications.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 font-medium">Candidate</th>
                  <th className="px-6 py-3 font-medium">Job</th>
                  <th className="px-6 py-3 font-medium">Stage</th>
                  <th className="px-6 py-3 font-medium">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr
                    key={app.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {app.candidate?.full_name || app.candidate_name}
                    </td>
                    <td className="px-6 py-4">{app.job_title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          app.stage === "interview"
                            ? "bg-indigo-100 text-indigo-700"
                            : app.stage === "offered"
                            ? "bg-green-100 text-green-700"
                            : app.stage === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {app.stage.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(app.applied_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No candidates have applied yet.</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
