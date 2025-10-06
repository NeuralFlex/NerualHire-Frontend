// src/components/CandidatesPipeline.jsx

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios"; // Assuming you use axios in your api.js or here
import { updateApplicationStage } from "../api/api"; // Assuming updateApplicationStage is defined here
import HeaderBar from "./HeaderBar"; 
import PipelineTabs from "./PipelineTabs";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";

const PIPELINE_STAGES = ["applied", "screening", "interview"];
const ALL_STAGES = [...PIPELINE_STAGES, "hired", "rejected"];

const stageLabels = {
  applied: "Applied",
  screening: "Phone Screen", 
  interview: "Interview",
  hired: "Offer / Hired",
  rejected: "Disqualified", 
};

// Assuming this function is in a separate api.js, but defined here for context
const fetchApplications = async () => {
    // You may need to replace this URL with your actual endpoint
    const response = await axios.get('http://127.0.0.1:8000/api/applications/'); 
    // We expect the list of applications under the 'results' key
    return response.data.results; 
};


export default function CandidatesPipeline() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("applied"); 
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // --- API and Data Logic ---
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await fetchApplications();

      // --- CRITICAL MAPPING SECTION ---
      // Map the Django data fields to the standardized structure the frontend components expect
      const normalizedData = data.map((djangoApp) => ({
        // Core Application Fields
        id: djangoApp.id, 
        stage: djangoApp.stage.toLowerCase(), 
        job_title: djangoApp.job_title,

        // Candidate Info (from top level)
        candidate_name: djangoApp.candidate_name,
        candidate_email: djangoApp.candidate_email,
        
        // Nested Candidate Info (from the 'candidate' object)
        phone: djangoApp.candidate.phone, 
        resume_link: djangoApp.candidate.resume, // Used for the iframe viewer
        
        // Default/Missing Fields
        source: 'Job Portal / Direct', 
        location: 'Remote', 
      }));
      // --- END CRITICAL MAPPING SECTION ---

      setApplications(normalizedData);

      // Set initial state for the list view
      const initialCandidates = normalizedData.filter(a => a.stage === activeStage);
      if (initialCandidates.length > 0) {
        setSelectedCandidate(initialCandidates[0]);
      }

    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const moveToNextStage = async (app) => {
    const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
    
    // Determine the next stage
    let nextStage;
    if (app.stage === 'rejected') {
        nextStage = 'rejected'; // If clicking Disqualify button
    } else if (currentIndex > -1 && currentIndex < PIPELINE_STAGES.length - 1) {
        nextStage = PIPELINE_STAGES[currentIndex + 1]; // Move forward in pipeline
    } else {
        return; // Cannot move if already hired/rejected or at the end
    }

    try {
      // NOTE: Your updateApplicationStage function needs to be updated to handle the new stage properly
      await updateApplicationStage(app.id, nextStage);
      
      // Update local state
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, stage: nextStage } : a))
      );
      
      // Deselect if the candidate moves off the current view
      if (activeStage === app.stage && activeStage !== nextStage) {
        setSelectedCandidate(null); 
      }
      
    } catch (err) {
      console.error("Failed to update stage:", err);
    }
  };

  // --- Filtering Logic for the List Component ---
  const candidatesInActiveStage = useMemo(() => {
    return applications.filter(a => a.stage === activeStage);
  }, [applications, activeStage]);

  // Determine the label for the 'Move' button in the detail pane
  const nextStageLabel = useMemo(() => {
    if (!selectedCandidate) return null;
    const currentIndex = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
    if (currentIndex === -1 || currentIndex === PIPELINE_STAGES.length - 1) return null;
    return stageLabels[PIPELINE_STAGES[currentIndex + 1]];
  }, [selectedCandidate]);


  if (loading) return <div className="text-center py-10">Loading...</div>;

  // --- Workable UI Structure ---
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 1. Header Section */}
      <HeaderBar 
          jobTitle="Computer Vision Engineer" 
          location="Remote - Pakistan" 
          totalCandidates={applications.length}
      />

      {/* 2. Pipeline Tabs */}
      <PipelineTabs 
        stages={ALL_STAGES}
        stageLabels={stageLabels}
        applications={applications}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
      />

      {/* 3. Main Content Area: Candidate List (Left) and Detail (Right) */}
      <div className="flex max-w-full">
        
        {/* Left Pane - Candidate List */}
        <div className="w-[380px] border-r bg-white min-h-[calc(100vh-140px)] shadow-md overflow-y-auto">
          <CandidateList 
            candidates={candidatesInActiveStage}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
          />
        </div>

        {/* Right Pane - Candidate Detail (Flexible width) */}
        <div className="flex-1 p-6">
          {selectedCandidate ? (
            <CandidateDetail 
              candidate={selectedCandidate}
              onMoveToNextStage={moveToNextStage} 
              nextStageLabel={nextStageLabel}
            />
          ) : (
            <div className="text-center p-10 text-gray-500">
              Select a candidate from the **{stageLabels[activeStage]}** list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}