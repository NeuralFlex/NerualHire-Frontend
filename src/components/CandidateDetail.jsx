import React, { useMemo } from "react";
import {
  FaArrowRight,
  FaTags,
  FaPhoneAlt,
  FaBan,
  FaArrowLeft,
  FaEnvelope,
} from "react-icons/fa";

const CandidateDetail = ({
  candidate,
  onMoveToNextStage,
  onMoveToPreviousStage,
  nextStageLabel,
  prevStageLabel,
  onDisqualify,
  setActiveStage,
  onRestoreCandidate,
  isUpdating, // <-- 1. Accept the isUpdating prop
}) => {
  const initials = useMemo(() => {
    if (!candidate || !candidate.candidate_name) return "UN";
    return candidate.candidate_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [candidate]);

  const canMoveForward =
    candidate &&
    candidate.stage !== "hired" &&
    candidate.stage !== "rejected" &&
    nextStageLabel;

  const canMoveBack =
    candidate &&
    candidate.stage !== "applied" &&
    candidate.stage !== "rejected" &&
    prevStageLabel;

  if (!candidate)
    return (
      <div className="text-center p-10 text-gray-500">
        Select a candidate to view details.
      </div>
    );

  const resumeUrl = candidate.resume_link?.startsWith("http")
    ? candidate.resume_link
    : `http://127.0.0.1:8000${candidate.resume_link}`;
  const isPdf = resumeUrl?.toLowerCase().endsWith(".pdf");

  // Helper class for consistent button styling and disabling
  const buttonClass = "flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-md transition duration-150 disabled:opacity-70 disabled:cursor-wait";

  // Replaced window.confirm with a console message placeholder (as alerts/confirms are forbidden)
  const handleDisqualifyClick = () => {
    console.log("Confirmation: Disqualifying candidate.");
    onDisqualify(candidate); 
  };
  
  const handleRestoreClick = () => {
    console.log("Confirmation: Restoring candidate.");
    onRestoreCandidate(candidate);
  };
  
  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex justify-end items-center bg-white p-4 rounded-lg border shadow-sm sticky top-0 z-10">
        <div className="flex space-x-3">
          {candidate.stage === "rejected" ? (
            // Restore Candidate Button
            <button
              className={`${buttonClass} bg-[#D64948] text-white hover:bg-[#b53d3d]`}
              onClick={handleRestoreClick}
              disabled={isUpdating} // 2. Disable during update
            >
              <FaArrowLeft className={`mr-2 ${isUpdating ? 'opacity-0' : 'opacity-100'}`} />
              {isUpdating ? "Restoring..." : "Restore Candidate"} {/* 3. Change text */}
            </button>
          ) : (
            <>
              {/* Disqualify Button */}
              <button
                className={`${buttonClass} text-[#D64948] border border-[#D64948] bg-white hover:bg-[#FCEAEA] shadow-sm`}
                onClick={handleDisqualifyClick}
                disabled={isUpdating} // 2. Disable during update
              >
                <FaBan className={`mr-2 ${isUpdating ? 'opacity-0' : 'opacity-100'}`} />
                {isUpdating ? "Processing..." : "Disqualify"} {/* 3. Change text */}
              </button>

              {/* Move Back Button */}
              {canMoveBack && (
                <button
                  className={`${buttonClass} bg-gray-200 text-gray-800 hover:bg-gray-300`}
                  onClick={() => onMoveToPreviousStage(candidate)}
                  disabled={isUpdating} // 2. Disable during update
                >
                  <FaArrowLeft className={`mr-2 ${isUpdating ? 'opacity-0' : 'opacity-100'}`} />
                  {isUpdating ? "Moving Back..." : `Move to ${prevStageLabel}`} {/* 3. Change text */}
                </button>
              )}

              {/* Move Forward Button */}
              {canMoveForward && (
                <button
                  className={`${buttonClass} bg-[#D64948] text-white hover:bg-[#b53d3d]`}
                  onClick={() => onMoveToNextStage(candidate)}
                  disabled={isUpdating} // 2. Disable during update
                >
                  <FaArrowRight className={`mr-2 ${isUpdating ? 'opacity-0' : 'opacity-100'}`} />
                  {isUpdating ? "Moving Ahead..." : `Move to ${nextStageLabel}`} {/* 3. Change text */}
                </button>
              )}
            </>
          )}
        </div>
      </div>


      {/* Candidate Info */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-start">
          <div className="w-16 h-16 rounded-full bg-[#FCEAEA] mr-4 flex items-center justify-center text-[#D64948] text-2xl font-semibold">
            {initials}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {candidate.candidate_name}
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              {candidate.job_title || "No Job Title"}
            </p>
            <p className="text-sm text-gray-500 flex items-center">
              <FaEnvelope className="mr-1 text-xs" /> {candidate.candidate_email}
              {candidate.phone && (
                <>
                  <span className="mx-2 text-gray-300">|</span>
                  <FaPhoneAlt className="mr-1 text-xs" /> {candidate.phone}
                </>
              )}
            </p>
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <FaTags className="mr-2 text-[#D64948]" />
              {candidate.location || "Location Not Specified"}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Section */}
      <div className="bg-white rounded-lg border shadow-sm">
        <h3 className="p-4 border-b font-semibold text-lg text-gray-700">
          Resume & Application Details
        </h3>

        <div className="p-4 h-[700px] w-full flex justify-center items-center">
          {candidate.resume_link ? (
            isPdf ? (
              <iframe
                src={resumeUrl}
                title={`${candidate.candidate_name}'s Resume`}
                className="w-full h-full border border-gray-300 rounded-lg"
              />
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Resume preview not supported for this file type.
                </p>
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#D64948] text-white px-4 py-2 rounded-lg shadow hover:bg-[#b53d3d]"
                >
                  Download Resume
                </a>
              </div>
            )
          ) : (
            <div className="bg-red-50 p-4 border border-dashed border-red-300 text-center text-red-700 h-full flex items-center justify-center rounded-lg">
              Resume link is missing for this candidate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;