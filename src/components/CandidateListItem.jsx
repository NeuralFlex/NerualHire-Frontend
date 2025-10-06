// src/components/CandidateListItem.jsx
import React from 'react';
import { FaGlobe, FaLinkedinIn } from 'react-icons/fa'; 

const CandidateListItem = ({ candidate, isSelected, onClick }) => {
    
    // Fallback for initials
    const initials = candidate.candidate_name ? candidate.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2) : '??';

    // Mock data for display purposes (replace with actual backend fields if available)
    const mockScore = candidate.score || Math.floor(Math.random() * (99 - 50 + 1)) + 50; 
    const mockSource = candidate.source || 'Jobs by Workable';
    const mockTime = '5 days'; 

    return (
        <div
            onClick={onClick}
            // Conditional styling for selection, matching the Workable UI
            className={`
                flex items-start p-4 border-b cursor-pointer transition-all duration-150 relative
                ${isSelected 
                    ? 'bg-yellow-50 border-l-4 border-yellow-500' 
                    : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'
                }
            `}
        >
            {/* Checkbox */}
            <input type="checkbox" className="mr-3 mt-1 form-checkbox text-indigo-600 focus:ring-indigo-500" />
            
            {/* Avatar/Score */}
            <div className="relative mr-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                    {initials}
                </div>
                {/* Score Badge (The '80' circle) */}
                <span className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-indigo-600 leading-none h-5 w-5 flex items-center justify-center p-0.5">
                    {mockScore}
                </span>
            </div>

            {/* Candidate Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{candidate.candidate_name}</p>
                <p className="text-sm text-gray-500 flex items-center mt-0.5">
                    {/* Choose icon based on source name */}
                    {mockSource.includes('linkedin') ? <FaLinkedinIn className="mr-1" /> : <FaGlobe className="mr-1" />}
                    via {mockSource}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    {mockTime} ago
                </p>
            </div>
            
            {/* Small unread/new application indicator (optional) */}
            {candidate.isNew && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full" title="New Application"></div>}
        </div>
    );
};

export default CandidateListItem;