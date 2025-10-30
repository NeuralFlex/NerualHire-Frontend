import React, { useEffect, useMemo, useState, useCallback } from "react";
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

// Adjust to match your backend page size if you want the same page counts
const PAGE_SIZE = 25;

// Fetch all applications across server pages (optionally filtered by job)
async function fetchAllApplications(jobId = null) {
  let url = `${API_URL}applications/`;
  if (jobId != null) {
    const params = new URLSearchParams({ job: jobId });
    url = `${API_URL}applications/?${params.toString()}`;
  }
  let all = [];
  while (url) {
    const data = await fetchApplications(url);
    const results = data.results || data;
    all = all.concat(results);
    url = data.next;
  }
  return all;
}

export default function CandidatesPipeline() {
  const location = useLocation();
  const jobId = location.state?.jobId != null ? Number(location.state.jobId) : null;

  const [allApplications, setAllApplications] = useState([]); // single source of truth (all pages)
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("applied");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [jobTitle, setJobTitle] = useState("Candidate Pipeline");

  // client-side pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Load everything once (and when job changes)
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);

        const [jobsData, appsRaw] = await Promise.all([
          fetch(`${DJANGO_BASE_URL}/api/jobs/`).then((res) => res.json()),
          fetchAllApplications(jobId),
        ]);

        const jobTitleMap = {};
        (jobsData.results || jobsData).forEach((job) => {
          jobTitleMap[job.id] = job.title;
        });

        if (jobId != null && jobTitleMap[jobId]) {
          setJobTitle(jobTitleMap[jobId]);
        }

        const normalized = (appsRaw || []).map((app) => {
          const candidate = app.candidate || {};
          const jobField = app.job;
          let title = "Unknown Job";
          let id = null;

          if (typeof jobField === "object" && jobField !== null) {
            title = jobField.title || "Unknown Job";
            id = jobField.id ?? null;
          } else {
            id = jobField != null ? Number(jobField) : null;
            if (id != null && jobTitleMap[id]) title = jobTitleMap[id];
          }

          let resumeLink = candidate.resume;
          if (resumeLink && !resumeLink.startsWith("http")) {
            resumeLink = `${DJANGO_BASE_URL}${resumeLink}`;
          }

          return {
            id: app.id,
            stage: app.stage?.toLowerCase() || "applied",
            job_id: id,
            job_title: title,
            candidate_name: candidate.full_name || "N/A",
            candidate_email: candidate.email || "N/A",
            phone: candidate.phone || "N/A",
            resume_link: resumeLink || "",
            applied_at: app.applied_at || "",
            raw: app, // keep raw if you ever need it
          };
        });

        if (!cancelled) {
          setAllApplications(normalized);
          // Reset page and selection for the active stage
          setCurrentPage(1);
          const firstInStage = getSortedStageList(normalized, activeStage, jobId)[0] || null;
          setSelectedCandidate(firstInStage);
        }
      } catch (err) {
        console.error("Error loading applications:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [jobId]); // reload if job changes

  // Helpers
  const sortByAppliedAtDesc = (a, b) => {
    const ta = a.applied_at ? Date.parse(a.applied_at) : 0;
    const tb = b.applied_at ? Date.parse(b.applied_at) : 0;
    if (tb !== ta) return tb - ta;
    // fallback: newest id first
    return (b.id || 0) - (a.id || 0);
  };

  const getSortedStageList = (apps, stage, job) => {
    return apps
      .filter((a) => (job != null ? a.job_id === job : true))
      .filter((a) => a.stage === stage)
      .sort(sortByAppliedAtDesc);
  };

  // Derived lists
  const appsForJob = useMemo(() => {
    return jobId != null ? allApplications.filter((a) => a.job_id === jobId) : allApplications;
  }, [allApplications, jobId]);

  const stageList = useMemo(() => {
    return getSortedStageList(allApplications, activeStage, jobId);
  }, [allApplications, activeStage, jobId]);

  const totalPages = Math.max(1, Math.ceil(stageList.length / PAGE_SIZE));
  const pagedCandidates = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return stageList.slice(start, start + PAGE_SIZE);
  }, [stageList, currentPage]);

  // Keep selection valid when page/stage changes
  useEffect(() => {
    if (!selectedCandidate) {
      setSelectedCandidate(pagedCandidates[0] || null);
      return;
    }
    const stillVisible = pagedCandidates.some((c) => c.id === selectedCandidate.id);
    if (!stillVisible) {
      // keep the same candidate if still in stage (but different page); otherwise select first in page
      const existsInStage = stageList.some((c) => c.id === selectedCandidate.id);
      if (!existsInStage) {
        setSelectedCandidate(pagedCandidates[0] || null);
      }
    }
  }, [pagedCandidates, stageList, selectedCandidate]);

  const handleSetActiveStage = useCallback(
    (stage) => {
      setActiveStage(stage);
      setCurrentPage(1);
      const firstInStage = getSortedStageList(allApplications, stage, jobId)[0] || null;
      setSelectedCandidate(firstInStage);
    },
    [allApplications, jobId]
  );

  const jumpToCandidatePageInStage = (candidateId, stage, updatedAll) => {
    const list = getSortedStageList(updatedAll, stage, jobId);
    const idx = list.findIndex((c) => c.id === candidateId);
    const page = idx === -1 ? 1 : Math.floor(idx / PAGE_SIZE) + 1;
    setActiveStage(stage);
    setCurrentPage(page);
    const updatedCand = updatedAll.find((a) => a.id === candidateId) || null;
    setSelectedCandidate(updatedCand);
  };

  const patchStageLocally = (id, newStage) => {
    return allApplications.map((a) => (a.id === id ? { ...a, stage: newStage } : a));
  };

  const moveToNextStage = async (app) => {
    const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
    if (currentIndex === -1 || currentIndex >= PIPELINE_STAGES.length - 1) return;
    const nextStage = PIPELINE_STAGES[currentIndex + 1];

    try {
      await updateApplicationStage(app.id, nextStage);
      const updatedAll = patchStageLocally(app.id, nextStage);
      setAllApplications(updatedAll);
      jumpToCandidatePageInStage(app.id, nextStage, updatedAll);
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
      const updatedAll = patchStageLocally(app.id, prevStage);
      setAllApplications(updatedAll);
      jumpToCandidatePageInStage(app.id, prevStage, updatedAll);
    } catch (err) {
      console.error("Failed to move stage:", err);
    }
  };

  const handleDisqualify = async (candidate) => {
    try {
      await updateApplicationStage(candidate.id, "rejected");
      const updatedAll = patchStageLocally(candidate.id, "rejected");
      setAllApplications(updatedAll);
      // jump to the rejected tab and correct page for this candidate
      jumpToCandidatePageInStage(candidate.id, "rejected", updatedAll);
    } catch (err) {
      console.error("Failed to disqualify candidate:", err);
    }
  };

  const handleRestoreCandidate = async (candidate) => {
    try {
      await updateApplicationStage(candidate.id, "applied");
      const updatedAll = patchStageLocally(candidate.id, "applied");
      setAllApplications(updatedAll);
      // jump to applied tab and correct page for this candidate
      jumpToCandidatePageInStage(candidate.id, "applied", updatedAll);
    } catch (err) {
      console.error("Failed to restore candidate:", err);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar
        jobTitle={jobTitle}
        location="Remote - Pakistan"
        totalCandidates={appsForJob.length}
      />

      <PipelineTabs
        stages={PIPELINE_STAGES}
        stageLabels={stageLabels}
        applications={appsForJob} // used for counts by stage
        activeStage={activeStage}
        setActiveStage={handleSetActiveStage}
      />

      <div className="flex max-w-full">
        {/* Left Pane */}
        <div className="w-[380px] border-r bg-white min-h-[calc(100vh-140px)] shadow-md overflow-y-auto">
          <CandidateList
            candidates={pagedCandidates} // client-side paginated candidates for active stage
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
          />

          <div className="flex items-center justify-between p-3 border-t bg-gray-50">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className={`px-3 py-1 text-sm rounded-md border ${
                currentPage > 1
                  ? "border-gray-300 hover:bg-gray-100"
                  : "border-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Previous
            </button>

            <span className="text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className={`px-3 py-1 text-sm rounded-md border ${
                currentPage < totalPages
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
              nextStageLabel={
                (() => {
                  const idx = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
                  return idx === -1 || idx === PIPELINE_STAGES.length - 1
                    ? null
                    : stageLabels[PIPELINE_STAGES[idx + 1]];
                })()
              }
              prevStageLabel={
                (() => {
                  const idx = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
                  return idx <= 0 ? null : stageLabels[PIPELINE_STAGES[idx - 1]];
                })()
              }
              onDisqualify={handleDisqualify}
              setActiveStage={handleSetActiveStage}
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