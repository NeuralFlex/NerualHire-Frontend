import React from 'react';
import { FaPencilAlt, FaChevronDown } from 'react-icons/fa';

const HeaderBar = ({ jobTitle, location, totalCandidates }) => {
  return (
    <div className="flex justify-between items-center p-6 bg-white border-b border-gray-200 shadow-sm">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-[#3F4040] flex items-center">
            {jobTitle}
            <button className="ml-2 p-1 text-gray-400 hover:text-[#D64948] transition-colors">
              <FaPencilAlt size={16} />
            </button>
          </h1>
        </div>

        {location && (
          <span className="text-gray-500 text-sm sm:text-md border-l pl-4 mt-1 sm:mt-0">
            {location}
          </span>
        )}

        {typeof totalCandidates === "number" && (
          <span className="ml-0 sm:ml-4 mt-1 sm:mt-0 px-3 py-1 bg-[#FDEDEA] text-[#D64948] text-sm font-medium rounded-full">
            Total Candidates: {totalCandidates}
          </span>
        )}
      </div>

      <button className="flex items-center px-4 py-2 bg-[#D64948] text-white font-medium rounded-lg shadow-md hover:bg-[#b73837] transition">
        Add Candidates
        <FaChevronDown className="ml-2" size={12} />
      </button>
    </div>
  );
};

export default HeaderBar;
