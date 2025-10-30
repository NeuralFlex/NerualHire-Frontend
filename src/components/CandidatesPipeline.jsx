import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchApplications, updateApplicationStage } from "../api/api";
import HeaderBar from "./HeaderBar";
import PipelineTabs from "./PipelineTabs";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";
import { useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const DJANGO_BASE_URL = API_URL.replace("/api/", "");

const PIPELINE_STAGES = ["applied", "screening", "interview", "hired", "rejected"];

const stageLabels = {
  applied: "Applied",
  screening: "Phone Screen",
  interview: "Interview",
  hired: "Offer / Hired",
  rejected: "Disqualified",
};

//  Helper function to fetch all pages of applications (for global stage counts)
async function fetchAllApplicationsForCount() {
  let url = `${API_URL}applications/`;
  let allData = [];

  while (url) {
    const data = await fetchApplications(url);
    const results = data.results || data;
    allData = [...allData, ...results];
    url = data.next; // next page URL if available
  }
  return allData;
}

export default function CandidatesPipeline() {
  const location = useLocation();
  const jobId = location.state?.jobId;

  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]); // for global counts
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("applied");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [jobTitle, setJobTitle] = useState("Candidate Pipeline");

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);


const loadApplications = useCallback(async (url = null) => {
  try {
    setLoading(true);
    const [appsData, jobsData] = await Promise.all([
      fetchApplications(url),
      fetch(`${DJANGO_BASE_URL}/api/jobs/`).then((res) => res.json()),
    ]);

    // Handle pagination URLs
    setNextPage(appsData.next);
    setPrevPage(appsData.previous);

    const jobTitleMap = {};
    (jobsData.results || jobsData).forEach((job) => {
      jobTitleMap[job.id] = job.title;
    });

    if (jobId && jobTitleMap[jobId]) {
      setJobTitle(jobTitleMap[jobId]);
    }

    const normalizedData = (appsData.results || appsData)
      .map((app) => {
        const candidate = app.candidate || {};
        const jobField = app.job;
        let jobTitle = "Unknown Job";
        let jobID = null;

        if (typeof jobField === "object" && jobField !== null) {
          jobTitle = jobField.title || "Unknown Job";
          jobID = jobField.id || null;
        } else {
          jobID = jobField;
          if (jobField && jobTitleMap[jobField]) {
            jobTitle = jobTitleMap[jobField];
          }
        }

        let resumeLink = candidate.resume;
        if (resumeLink && !resumeLink.startsWith("http")) {
          resumeLink = `${DJANGO_BASE_URL}${resumeLink}`;
        }

        return {
          id: app.id,
          stage: app.stage?.toLowerCase() || "applied",
          job_id: jobID,
          job_title: jobTitle,
          candidate_name: candidate.full_name || "N/A",
          candidate_email: candidate.email || "N/A",
          phone: candidate.phone || "N/A",
          resume_link: resumeLink || "",
          applied_at: app.applied_at || "",
        };
      })
      .filter((app) => (jobId ? app.job_id === jobId : true));

    setApplications(normalizedData);

    const initialCandidates = normalizedData.filter(
      (a) => a.stage === activeStage
    );
    setSelectedCandidate(initialCandidates[0] || null);
  } catch (error) {
    console.error("Error fetching applications:", error);
  } finally {
    setLoading(false);
  }
}, [activeStage, jobId]);

 //  Load global applications once for accurate counts
  useEffect(() => {
    fetchAllApplicationsForCount().then((data) => {
      const normalized = data.map((app) => ({
        id: app.id,
        stage: app.stage?.toLowerCase() || "applied",
        job: app.job,
      }));
      setAllApplications(normalized);
    });
  }, []);

useEffect(() => {
  loadApplications();
}, [jobId]);

// When stage changes, just update the selected candidate locally
useEffect(() => {
  const filtered = applications.filter((a) => a.stage === activeStage);
  setSelectedCandidate(filtered[0] || null);
}, [activeStage, applications]);

  const moveToNextStage = async (app) => {
    const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
    if (currentIndex === -1 || currentIndex >= PIPELINE_STAGES.length - 1) return;
    const nextStage = PIPELINE_STAGES[currentIndex + 1];
    try {
      await updateApplicationStage(app.id, nextStage);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, stage: nextStage } : a))
      );

      setAllApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, stage: nextStage } : a))
      ); // ✅ update global list

      setActiveStage(nextStage);
      setSelectedCandidate(null);
    } catch (err) {
      console.error("Failed to move stage:", err);
    }
  };

  const moveToPreviousStage = async (app) => {
    const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
    if (currentIndex <= 0) return;

    const prevStage = PIPELINE_STAGES[currentIndex - 1];
    try {
      await updateApplicationStage(app.id, prevStage);
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, stage: prevStage } : a))
      );

      setActiveStage(prevStage);
      setSelectedCandidate(null);
    } catch (err) {
      console.error("Failed to move stage:", err);
    }
  };

  const handleDisqualify = async (candidate) => {
    try {
      await updateApplicationStage(candidate.id, "rejected");
      setApplications((prev) =>
        prev.map((a) =>
          a.id === candidate.id ? { ...a, stage: "rejected" } : a
        )
      );
      setSelectedCandidate(null);
    } catch (err) {
      console.error("Failed to disqualify candidate:", err);
    }
  };

  const handleRestoreCandidate = async (candidate) => {
  try {
    await updateApplicationStage(candidate.id, "applied"); 
    setApplications((prev) =>
      prev.map((a) =>
        a.id === candidate.id ? { ...a, stage: "applied" } : a
      )
    );
    setSelectedCandidate(null);
  } catch (err) {
    console.error("Failed to restore candidate:", err);
  }
};

  const candidatesInActiveStage = useMemo(() => {
    return applications.filter((a) => a.stage === activeStage);
  }, [applications, activeStage]);

  const nextStageLabel = useMemo(() => {
    if (!selectedCandidate) return null;
    const currentIndex = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
    if (currentIndex === -1 || currentIndex === PIPELINE_STAGES.length - 1)
      return null;
    return stageLabels[PIPELINE_STAGES[currentIndex + 1]];
  }, [selectedCandidate]);

  const prevStageLabel = useMemo(() => {
    if (!selectedCandidate) return null;
    const currentIndex = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
    if (currentIndex <= 0) return null;
    return stageLabels[PIPELINE_STAGES[currentIndex - 1]];
  }, [selectedCandidate]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar
        jobTitle={jobTitle}
        location="Remote - Pakistan"
        totalCandidates={allApplications.length}
      />

      <PipelineTabs
        stages={PIPELINE_STAGES}
        stageLabels={stageLabels}
        applications={allApplications}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
      />

<div className="flex max-w-full">
        {/* Left Pane */}
        <div className="w-[380px] border-r bg-white min-h-[calc(100vh-140px)] shadow-md overflow-y-auto">
          <CandidateList
            candidates={candidatesInActiveStage}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
          />

          <div className="flex justify-between p-3 border-t bg-gray-50">
            <button
              onClick={() => loadApplications(prevPage)}
              disabled={!prevPage || loading}
              className={`px-3 py-1 text-sm rounded-md border ${
                prevPage
                  ? "border-gray-300 hover:bg-gray-100"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => loadApplications(nextPage)}
              disabled={!nextPage || loading}
              className={`px-3 py-1 text-sm rounded-md border ${
                nextPage
                  ? "border-[#D64948] text-[#D64948] hover:bg-[#D64948] hover:text-white"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 p-6">
          {selectedCandidate ? (
            <CandidateDetail
              candidate={selectedCandidate}
              onMoveToNextStage={moveToNextStage}
              onMoveToPreviousStage={moveToPreviousStage}
              nextStageLabel={nextStageLabel}
              prevStageLabel={prevStageLabel}
              onDisqualify={handleDisqualify}
              setActiveStage={setActiveStage}
              onRestoreCandidate={handleRestoreCandidate}
            />
          ) : (
            <div className="text-center p-10 text-gray-500">
              Select a candidate from the{" "}
              <strong>{stageLabels[activeStage]}</strong> list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}