import React from "react";
import { FaSearch, FaFilter, FaSortAmountDown } from "react-icons/fa";
import CandidateListItem from "./CandidateListItem";

const CandidateList = ({
  candidates,
  selectedCandidate,
  onSelectCandidate,
  isUpdatingStageId // 1. ACCEPT THE LOADING ID PROP
}) => {
  return (
    <div className="h-full flex flex-col bg-white border rounded-lg shadow-sm">
      {/* Search and Filter Bar */}
      <div className="p-4 border-b flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name, skills, tags and more..."
            className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-[#D64948] focus:border-[#D64948]"
          />
          <FaSearch
            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={14}
          />
        </div>
        <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100 transition">
          <FaFilter size={14} />
        </button>
        <button className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100 transition">
          <FaSortAmountDown size={14} />
        </button>
      </div>

      {/* The Actual List of Candidates */}
      <div className="flex-1 overflow-y-auto">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <CandidateListItem
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate && selectedCandidate.id === candidate.id}
              onClick={() => onSelectCandidate(candidate)}
              // 2. PASS THE CALCULATED isUpdating PROP DOWN
              isUpdating={isUpdatingStageId === candidate.id}
            />
          ))
        ) : (
          <p className="p-6 text-center text-gray-500 text-sm">
            No candidates found in this stage.
          </p>
        )}
      </div>
    </div>
  );
};

export default CandidateList;