import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 flex flex-col hover:shadow-xl transition-all border border-gray-100 group">
      
      {/* Job Header */}
      <div className="flex justify-between items-start mb-4">
        <h5 className="text-xl font-semibold text-gray-800">{job.title}</h5>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            job.is_open
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {job.is_open ? "Open" : "Closed"}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-4">
        {job.description || "No description provided."}
      </p>

      {/* Location & Type */}
      <div className="flex justify-between text-gray-500 text-sm mb-6">
        <p>
          <span className="font-semibold text-[#D64948]">Location:</span>{" "}
          {job.location || "Not specified"}
        </p>
        <p>
          <span className="font-semibold text-[#D64948]">Type:</span>{" "}
          {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-auto flex flex-wrap gap-3">
        <Link
          to={`/jobs/${job.id}`}
          className="flex-1 text-center bg-[#D64948] text-white px-4 py-2.5 rounded-xl font-medium hover:bg-[#b73837] transition-all shadow-md group-hover:shadow-lg"
        >
          View Details
        </Link>

        {job.is_open ? (
          <Link
            to={`/jobs/${job.id}/apply`}
            className="flex-1 text-center bg-white text-[#D64948] px-4 py-2.5 rounded-xl font-medium border border-[#D64948] hover:bg-[#D64948] hover:text-white transition-all shadow-sm group-hover:shadow-md"
          >
            Apply
          </Link>
        ) : (
          <div className="flex-1 text-center bg-gray-50 text-gray-400 px-4 py-2.5 rounded-xl font-medium border border-gray-200 cursor-not-allowed">
            Applications Closed
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
