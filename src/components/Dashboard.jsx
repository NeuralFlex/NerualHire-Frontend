import React, { useEffect, useState } from "react";
import {
  fetchJobs,
  fetchApplications,
  updateApplicationStage,
} from "../api/api";
import { useNavigate } from "react-router-dom";

const stageColors = {
  applied: "bg-gray-100 text-gray-700 dark:bg-gray-700 ",
  phone_screen: "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100",
  interview: "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100",
  offered: "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100",
  rejected: "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100",
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
    return <p className="text-center py-10 text-gray-500 dark:text-gray-400">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500 py-10">{error}</p>;

  return (
    <div>
      {/* === Stats === */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</p>
          <p className="text-2xl font-bold text-[#D64948]">{jobs.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Applications</p>
          <p className="text-2xl font-bold text-[#D64948]">{applications.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 shadow rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">Interviews Scheduled</p>
          <p className="text-2xl font-bold text-[#D64948]">
            {applications.filter((a) => a.stage === "interview").length}
          </p>
        </div>
      </div>

      {/* === Jobs === */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Jobs</h2>
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
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:scale-[1.01] transition transform p-6"
              >
                <h3 className="text-lg font-bold text-[#D64948]">{job.title}</h3>
                <p className="text-gray-600  mt-2">
                  {job.description?.substring(0, 100)}...
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-400 mt-3">📍 {job.location}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setSelectedJob(job.id)}
                    className="bg-[#D64948] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#b63a39]"
                  >
                    View Applications
                  </button>
                  <button className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No jobs available.</p>
        )}
      </section>

      {/* === Applications === */}
      {selectedJob && (
        <section>
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Applications for {jobs.find((j) => j.id === selectedJob)?.title || "Job"}
          </h2>
          <div className="overflow-x-auto rounded-xl shadow-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-[#D64948]/10 dark:bg-[#D64948]/20 text-gray-900 dark:text-white uppercase">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Update Stage</th>
                </tr>
              </thead>
              <tbody>
                {applications.filter((a) => a.job === selectedJob).length > 0 ? (
                  applications
                    .filter((a) => a.job === selectedJob)
                    .map((app, index) => (
                      <tr
                        key={app.id}
                        className={`border-b ${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50 dark:bg-gray-800"
                        } hover:bg-[#D64948]/5 transition`}
                      >
                        <td className="py-3 px-4 text-gray-900 ">
                          {app.candidate.full_name}
                        </td>
                        <td className="py-3 px-4 text-gray-700 ">
                          {app.candidate.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              stageColors[app.stage] ||
                              "bg-gray-100 text-gray-600 dark:bg-gray-700 "
                            }`}
                          >
                            {app.stage.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageChange(app.id, e.target.value)}
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#D64948] focus:outline-none bg-white dark:bg-gray-800 dark:text-white dark:border-gray-700"
                          >
                            <option value="applied">Applied</option>
                            <option value="phone_screen">Phone Screen</option>
                            <option value="interview">Interview</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-6 text-gray-500 dark:text-gray-400 italic"
                    >
                      No applications for this job.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
