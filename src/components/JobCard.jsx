import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col hover:shadow-lg transition border border-gray-100">
      {/* Job Title */}
      <h5 className="text-lg font-semibold text-gray-800 mb-2">
        {job.title}
      </h5>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-3">
        {job.description && job.description.length > 120
          ? job.description.substring(0, 120) + "..."
          : job.description}
      </p>

      {/* Location */}
      <p className="text-gray-500 text-sm mb-4">
        <span className="font-semibold text-[#D64948]">Location:</span>{" "}
        {job.location || "Not specified"}
      </p>

      {/* Buttons */}
      <div className="mt-auto flex gap-3">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center bg-[#D64948] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#b73837] transition"
        >
          View Details
        </Link>
        <Link
          to={`/jobs/${job.id}/apply`}
          className="flex-1 text-center bg-gray-100 text-[#D64948] px-4 py-2.5 rounded-lg font-medium border border-[#D64948] hover:bg-[#D64948] hover:text-white transition"
        >
          Apply
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
