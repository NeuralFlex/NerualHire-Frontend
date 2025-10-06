import React from 'react';
import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import CandidateListItem from './CandidateListItem';

const CandidateList = ({ candidates, selectedCandidate, onSelectCandidate }) => {

    const qualifiedCount = candidates.length; 
    const disqualifiedCount = 0; 

    return (
        <div className="h-full flex flex-col">
            
            {/* Qualified / Disqualified Toggles */}
            <div className="flex border-b text-sm font-medium text-center text-gray-500">
                {/* Active Tab: Qualified */}
                <button className="flex-1 py-3 text-indigo-600 border-b-2 border-indigo-600 bg-gray-50 transition duration-150">
                    Qualified ({qualifiedCount})
                </button>
                {/* Inactive Tab: Disqualified (Logic for switching tabs is complex and deferred) */}
                <button className="flex-1 py-3 hover:text-gray-700 transition duration-150">
                    Disqualified ({disqualifiedCount})
                </button>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="p-4 border-b flex items-center space-x-2">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Search by name, skills, tags and more..."
                        className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
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
                        />
                    ))
                ) : (
                    <p className="p-6 text-center text-gray-500 text-sm">No qualified candidates in this stage.</p>
                )}
            </div>
        </div>
    );
};

export default CandidateList;