import React from "react";
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 flex flex-col hover:shadow-lg transition">
      <h5 className="text-lg font-semibold text-gray-800 mb-2">
        {job.title}
      </h5>
      <p className="text-gray-600 text-sm mb-3">
        {job.description.length > 120
          ? job.description.substring(0, 120) + "..."
          : job.description}
      </p>
      <p className="text-gray-500 text-sm mb-4">
        <span className="font-semibold text-[#D64948]">Location:</span>{" "}
        {job.location}
      </p>
      <div className="mt-auto">
        <Link
          to={`/jobs/${job.id}`}
          className="block text-center bg-[#D64948] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#b63a39] transition"
        >
          View Details
        </Link>
        <Link
          to={`/jobs/${job.id}/apply`}
          className="flex-1 text-center bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
        >
          Apply
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
