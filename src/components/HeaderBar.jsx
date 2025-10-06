// src/components/HeaderBar.jsx
import React from 'react';
import { FaPencilAlt, FaChevronDown } from 'react-icons/fa';

const HeaderBar = ({ jobTitle, location, totalCandidates }) => {
    return (
        <div className="flex justify-between items-center p-6 bg-white border-b">
            
            {/* Left: Job Title and Location */}
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                    {jobTitle}
                    <button className="ml-3 p-1 text-gray-400 hover:text-gray-600">
                        <FaPencilAlt size={16} />
                    </button>
                </h1>
                <span className="text-md text-gray-500 border-l pl-4 hidden sm:block">
                    {location}
                </span>
                
                {/* Display total count inline for context */}
                <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hidden md:block">
                    Total Candidates: {totalCandidates}
                </span>
            </div>

            {/* Right: Add Candidates Button */}
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition">
                Add candidates
                <FaChevronDown className="ml-2" size={10} />
            </button>
        </div>
    );
};

export default HeaderBar;