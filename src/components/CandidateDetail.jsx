// src/components/CandidateDetail.jsx
import React, { useMemo } from 'react';
import { FaCalendarAlt, FaEnvelope, FaRegHeart, FaArrowRight, FaTags, FaPhoneAlt, FaBan } from 'react-icons/fa';

const CandidateDetail = ({ candidate, onMoveToNextStage, nextStageLabel }) => {
    
    // Calculates initials for the avatar
    const initials = useMemo(() => {
        if (!candidate || !candidate.candidate_name) return 'UN';
        return candidate.candidate_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }, [candidate]);

    // Checks if the candidate is in a stage that allows moving forward
    const canMoveForward = candidate && candidate.stage !== "hired" && candidate.stage !== "rejected" && nextStageLabel;
    
    if (!candidate) return <div className="text-center p-10 text-gray-500">Select a candidate to view details.</div>;

    return (
        <div className="space-y-6">
            
            {/* Top Action Buttons Bar (Sticky) */}
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm sticky top-0 z-10">
                
                <div className="flex space-x-3 text-xl text-gray-500">
                    <button className="p-2 hover:text-red-500 transition duration-150 rounded-full hover:bg-gray-100" title="Email Candidate"><FaEnvelope /></button>
                    <button className="p-2 hover:text-indigo-600 transition duration-150 rounded-full hover:bg-gray-100" title="Schedule Event"><FaCalendarAlt /></button>
                    <button className="p-2 hover:text-green-500 transition duration-150 rounded-full hover:bg-gray-100" title="Favorite"><FaRegHeart /></button>
                </div>

                {/* Stage Transition Buttons */}
                <div className="flex space-x-3">
                    {/* Disqualify/Reject Button */}
                    <button 
                        className="flex items-center px-4 py-2 text-sm text-red-600 border border-red-600 bg-white font-medium rounded-lg shadow-sm hover:bg-red-50 transition duration-150"
                        // Passes a mock candidate object with stage set to 'rejected'
                        onClick={() => onMoveToNextStage({ ...candidate, stage: 'rejected' })} 
                    >
                        <FaBan className="mr-2" />
                        Disqualify
                    </button>

                    {/* Move Forward Button */}
                    {canMoveForward && (
                        <button 
                            className="flex items-center px-4 py-2 text-sm bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition duration-150"
                            onClick={() => onMoveToNextStage(candidate)} // Moves to the next stage
                        >
                            <FaArrowRight className="mr-2" />
                            Move to {nextStageLabel}
                        </button>
                    )}
                </div>
            </div>
            
            {/* Candidate Profile Card */}
            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-start">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 mr-4 flex items-center justify-center text-indigo-700 text-2xl font-semibold">
                        {initials}
                    </div>
                    
                    {/* Info - Now using real candidate props */}
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{candidate.candidate_name}</h2>
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                            {candidate.job_title || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                            <FaEnvelope className="mr-1 text-xs" /> {candidate.candidate_email} 
                            {candidate.phone && <span className="mx-2 text-gray-300">|</span>}
                            {candidate.phone && <FaPhoneAlt className="mr-1 text-xs" />} {candidate.phone}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                            <FaTags className="mr-2 text-indigo-400" />
                            {candidate.location || 'Location Not Specified'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tabs Area: Resume, Activity, Notes */}
            <div className="bg-white rounded-lg border shadow-sm min-h-[500px]">
                <h3 className="p-4 border-b font-semibold text-lg text-gray-700">Resume & Application Details</h3>
                
                {/* Resume Viewer Section - Uses iframe for displaying PDF/DOCX from Django media */}
                <div className="p-4 h-[700px] w-full">
                    {candidate.resume_link ? (
                        <iframe 
                            // Resume link is assumed to be a direct URL to the file
                            src={candidate.resume_link}
                            title={`${candidate.candidate_name}'s Resume`}
                            className="w-full h-full border border-gray-300 rounded-lg"
                        >
                            <p>Your browser does not support iframes. You can download the resume <a href={candidate.resume_link} target="_blank" rel="noopener noreferrer">here</a>.</p>
                        </iframe>
                    ) : (
                        <div className="bg-red-50 p-4 border border-dashed border-red-300 text-center text-red-700 h-full flex items-center justify-center rounded-lg">
                            ⚠️ Resume link is missing for this candidate.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CandidateDetail;