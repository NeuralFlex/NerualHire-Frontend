import React, { useEffect, useState, useMemo } from "react";
// Ensure correct imports from the API file
import { fetchApplications, updateApplicationStage } from "../api/api"; 
import HeaderBar from "./HeaderBar"; 
import PipelineTabs from "./PipelineTabs";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";

// Define the expected base URL for the local Django API and media files.
// This is necessary because the frontend context (the canvas) may not be running
// on the same origin as your Django server.
// NOTE: If your Django server runs on a different port, update this value!
const DJANGO_BASE_URL = "http://127.0.0.1:8000";

const PIPELINE_STAGES = ["applied", "screening", "interview"];
const ALL_STAGES = [...PIPELINE_STAGES, "hired", "rejected"];

const stageLabels = {
 applied: "Applied",
 screening: "Phone Screen", 
 interview: "Interview",
 hired: "Offer / Hired",
 rejected: "Disqualified", 
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
    // Defensive check
    if (!localStorage.getItem("access_token")) {
        console.warn("Authentication token missing. Cannot load applications.");
        setLoading(false);
        return;
    }
    
  try {
   const data = await fetchApplications();

   // --- CRITICAL MAPPING SECTION ---
   const normalizedData = data.map((djangoApp) => {
        // 1. Resume Link Correction
        let fullResumeLink = djangoApp.candidate?.resume;
        if (fullResumeLink && !fullResumeLink.startsWith('http')) {
            // Prepend the Django server address to the relative path
            fullResumeLink = `${DJANGO_BASE_URL}${fullResumeLink}`;
        }
        
        return {
            // Core Application Fields
            id: djangoApp.id, 
            stage: djangoApp.stage.toLowerCase(), 
            // 2. Job Title: This mapping is correct. If still missing, the API data is the issue.
            job_title: djangoApp.job_title || 'N/A Job Title (Check API)', 

            // Candidate Info 
            candidate_name: djangoApp.candidate_name,
            candidate_email: djangoApp.candidate_email,
            
            // Nested Candidate Info 
            phone: djangoApp.candidate?.phone, // Use optional chaining for safety
            resume_link: fullResumeLink, // Use the corrected full URL
            
            // Default/Missing Fields
            source: 'Job Portal / Direct', 
            location: 'Remote', 
        };
   });
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

  // Helper to update the state after API call
  const updateLocalStage = (appId, newStage) => {
    setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a))
    );
    // Deselect if the candidate moves off the current view
    if (selectedCandidate && activeStage === selectedCandidate.stage && activeStage !== newStage) {
        setSelectedCandidate(null); 
    }
  }

 const moveToNextStage = async (app) => {
  const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
  
  // Determine the next stage (Handles Disqualified separately)
  let nextStage;
  if (app.stage === 'rejected') {
    nextStage = 'rejected'; 
  } else if (currentIndex > -1 && currentIndex < PIPELINE_STAGES.length - 1) {
    nextStage = PIPELINE_STAGES[currentIndex + 1]; 
  } else {
    return; 
  }

  try {
   await updateApplicationStage(app.id, nextStage);
      updateLocalStage(app.id, nextStage);
  } catch (err) {
   console.error("Failed to move to next stage:", err);
  }
 };
  const moveToPreviousStage = async (app) => {
  const currentIndex = PIPELINE_STAGES.indexOf(app.stage);

    // Cannot move back if at the first stage or is a final stage (hired/rejected)
  if (currentIndex <= 0) return;
    
    // Determine the previous stage
  const previousStage = PIPELINE_STAGES[currentIndex - 1];

  try {
   await updateApplicationStage(app.id, previousStage);
      updateLocalStage(app.id, previousStage);
  } catch (err) {
   console.error("Failed to move to previous stage:", err);
  }
 };
  // --- END NEW LOGIC ---

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
  
  // Determine if moving back is possible
  const canMoveBack = useMemo(() => {
    if (!selectedCandidate) return false;
    const currentIndex = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
    return currentIndex > 0;
  }, [selectedCandidate]);


 if (loading) return <div className="text-center py-10">Loading...</div>;

 // --- Workable UI Structure ---
 return (
  <div className="min-h-screen bg-gray-50">
   
   {/* 1. Header Section - Dynamically show the selected job title */}
   <HeaderBar 
     jobTitle={selectedCandidate ? selectedCandidate.job_title : "Candidate Pipeline"}
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
              onMoveToPreviousStage={moveToPreviousStage}
       nextStageLabel={nextStageLabel}
              canMoveBack={canMoveBack}
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
