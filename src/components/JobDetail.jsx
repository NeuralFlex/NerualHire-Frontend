import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchJob } from "../api/api";

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await fetchJob(id);
        setJob(data);
      } catch (err) {
        console.error("Failed to fetch job:", err);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D64948] border-t-transparent"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-500">
        Job not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-[#D64948] mb-4">{job.title}</h2>
        <p className="text-gray-600 leading-relaxed mb-6">{job.description}</p>

        <div className="space-y-4 mb-6">
          <p className="text-gray-700">
            <span className="font-semibold text-[#D64948]">Location:</span>{" "}
            {job.location}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-[#D64948]">Requirements:</span>{" "}
            {job.requirements}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold text-[#D64948]">Benefits:</span>{" "}
            {job.benefits}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            ← Back to Jobs
          </Link>
          <Link
            to={`/jobs/${job.id}/apply`}
            className="px-6 py-3 rounded-lg bg-[#D64948] text-white font-semibold hover:bg-[#b63a39] transition"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
