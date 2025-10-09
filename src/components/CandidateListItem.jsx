// src/components/CandidateListItem.jsx
import React from 'react';
import { FaEnvelope, FaPhoneAlt, FaFileAlt } from 'react-icons/fa';

const CandidateListItem = ({ candidate, isSelected, onClick }) => {
  // Generate initials safely
  const initials = candidate.candidate_name
    ? candidate.candidate_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??';

  return (
    <div
      onClick={onClick}
      className={`flex items-start p-4 border-b cursor-pointer transition-all duration-150 relative ${
        isSelected
          ? 'bg-yellow-50 border-l-4 border-yellow-500'
          : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        className="mr-3 mt-1 form-checkbox text-indigo-600 focus:ring-indigo-500"
      />

      {/* Avatar */}
      <div className="relative mr-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
          {initials}
        </div>
      </div>

      {/* Candidate Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">
          {candidate.candidate_name || 'Unnamed Candidate'}
        </p>
        

        {/* Email */}
        {candidate.candidate_email && (
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <FaEnvelope className="mr-2 text-gray-400" />
            {candidate.candidate_email}
          </p>
        )}

        {/* Phone */}
        {candidate.phone && (
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <FaPhoneAlt className="mr-2 text-gray-400" />
            {candidate.phone}
          </p>
        )}

        {/* Resume Link */}
        {candidate.resume_link && (
          <a
            href={candidate.resume_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 flex items-center mt-1 hover:underline"
          >
            <FaFileAlt className="mr-2" />
            View Resume
          </a>
        )}
      </div>

      {/* Optional New Indicator */}
      {candidate.isNew && (
        <div
          className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full"
          title="New Application"
        ></div>
      )}
    </div>
  );
};

export default CandidateListItem;
