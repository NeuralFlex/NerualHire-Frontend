import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const JobCard = ({ job, refreshJobs, isAdmin = true }) => {
  // DELETE job
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/jobs/${job.id}/`);
      alert("Job deleted successfully.");
      refreshJobs(); // Refresh job list
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job.");
    }
  };

  // CLOSE job
  const handleClose = async () => {
    if (!window.confirm("Mark this job as closed?")) return;
    try {
      await axios.post(`http://127.0.0.1:8000/api/jobs/${job.id}/close_job/`);
      alert("Job marked as closed.");
      refreshJobs();
    } catch (error) {
      console.error("Error closing job:", error);
      alert("Failed to close job.");
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col hover:shadow-lg transition border border-gray-100">
      {/* Job Title */}
      <h5 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h5>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-3">
        {job.description && job.description.length > 120
          ? job.description.substring(0, 120) + "..."
          : job.description}
      </p>

      {/* Location */}
      <p className="text-gray-500 text-sm mb-3">
        <span className="font-semibold text-[#D64948]">Location:</span>{" "}
        {job.location || "Not specified"}
      </p>

      {/* Job Status */}
      <p
        className={`text-sm mb-4 font-medium ${
          job.is_open ? "text-green-600" : "text-red-600"
        }`}
      >
        {job.is_open ? "Open for applications" : "Closed"}
      </p>

      {/* Buttons */}
      <div className="mt-auto flex flex-wrap gap-3">
        {/* View Details */}
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center bg-[#D64948] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#b73837] transition"
        >
          View Details
        </Link>

        {/* Apply or Closed Notice */}
        {job.is_open ? (
          <Link
            to={`/jobs/${job.id}/apply`}
            className="flex-1 text-center bg-gray-100 text-[#D64948] px-4 py-2.5 rounded-lg font-medium border border-[#D64948] hover:bg-[#D64948] hover:text-white transition"
          >
            Apply
          </Link>
        ) : (
          <div className="flex-1 text-center bg-red-50 text-[#D64948] border border-[#D64948]/20 px-4 py-2.5 rounded-lg font-medium cursor-not-allowed">
           Closed
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
