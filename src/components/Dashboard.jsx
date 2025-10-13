// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Users, Briefcase, CalendarDays, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { fetchJobs, fetchApplications } from "../api/api"; 

export default function Dashboard() {
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [applicationsData, jobsData] = await Promise.all([
          fetchApplications(),
          fetchJobs(),
        ]);

        setRecentCandidates(
          (applicationsData.results || applicationsData).slice(0, 5)
        );
        setRecentJobs((jobsData.results || jobsData).slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const stats = [
    { label: "Active Jobs", value: recentJobs.length, icon: Briefcase },
    { label: "Total Applicants", value: recentCandidates.length, icon: Users },
    {
      label: "Interviews Scheduled",
      value: recentCandidates.filter((c) => c.stage === "Interview").length,
      icon: CalendarDays,
    },
    {
      label: "Pending Offers",
      value: recentCandidates.filter((c) => c.stage === "Offer").length,
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm p-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <a
          href="/create-job"
          className="bg-[#D64948] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b63c3b] transition"
        >
          + New Job
        </a>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, index) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center space-x-4"
            >
              <div className="bg-[#D64948]/10 p-3 rounded-xl">
                <s.icon className="text-[#D64948] w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-semibold">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Candidates */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Candidates</h2>
              <a href="/candidates" className="text-[#D64948] text-sm font-medium">
                View All
              </a>
            </div>
            <ul>
              {recentCandidates.length > 0 ? (
                recentCandidates.map((c) => (
                  <li
                    key={c.id}
                    className="px-5 py-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium">{c.candidate_name}</p>
                      <p className="text-sm text-gray-500">
                        {c.job_title} •{" "}
                        {new Date(c.applied_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">
                      {c.stage}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-center py-6 text-gray-500">No candidates found.</p>
              )}
            </ul>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Jobs</h2>
              <a href="/jobs" className="text-[#D64948] text-sm font-medium">
                View All
              </a>
            </div>
            <ul>
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="px-5 py-4 flex justify-between items-center border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {job.openings} Opening{job.openings > 1 ? "s" : ""}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-center py-6 text-gray-500">No jobs found.</p>
              )}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
