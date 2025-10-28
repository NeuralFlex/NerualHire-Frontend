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

  // ✅ Improved bullet rendering
  const renderBullets = (text) => {
    return text
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "")
      .map((line, index) => (
        <li key={index} className="mb-1 leading-relaxed">
          {line.trim().replace(/^[-•\s]*/, "")}
        </li>
      ));
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 flex justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full space-y-6">
        {/* Job Header */}
        <div>
          <h2 className="text-3xl font-bold text-[#D64948] mb-2">
            {job.title}
          </h2>
          <p
            className={`text-sm font-medium ${
              job.is_open ? "text-green-600" : "text-red-600"
            }`}
          >
            {job.is_open ? "Open for applications" : "Applications Closed"}
          </p>
        </div>

        {/* Job Details */}
        <div className="space-y-5 text-gray-700">
          {job.description && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Description</h4>
              <p className="whitespace-pre-line leading-relaxed">
                {job.description}
              </p>
            </div>
          )}

          {job.requirements && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Requirements</h4>
              <ul className="list-disc list-inside text-gray-700">
                {renderBullets(job.requirements)}
              </ul>
            </div>
          )}

          {job.responsibilities && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">
                Responsibilities
              </h4>
              <ul className="list-disc list-inside text-gray-700">
                {renderBullets(job.responsibilities)}
              </ul>
            </div>
          )}

          {job.benefits && (
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Benefits</h4>
              <ul className="list-disc list-inside text-gray-700">
                {renderBullets(job.benefits)}
              </ul>
            </div>
          )}

          {job.location && (
            <p>
              <span className="font-semibold text-[#D64948]">Location:</span>{" "}
              {job.location}
            </p>
          )}

          {job.type && (
            <p>
              <span className="font-semibold text-[#D64948]">Job Type:</span>{" "}
              {job.type.replace("-", " ")}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-center"
          >
            ← Back to Jobs
          </Link>

          {job.is_open ? (
            <Link
              to={`/jobs/${job.id}/apply`}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#D64948] text-white font-semibold hover:bg-[#b63a39] transition text-center"
            >
              Apply Now
            </Link>
          ) : (
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 text-gray-500 font-semibold cursor-not-allowed text-center"
            >
              Applications Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
