import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchApplications, updateApplicationStage } from "../api/api";
import HeaderBar from "./HeaderBar";
import PipelineTabs from "./PipelineTabs";
import CandidateList from "./CandidateList";
import CandidateDetail from "./CandidateDetail";
import { useLocation } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "";
const DJANGO_BASE_URL = API_URL.replace("/api/", "") || "http://127.0.0.1:8000";

const PIPELINE_STAGES = ["applied", "screening", "interview", "hired", "rejected"];
const stageLabels = {
  applied: "Applied",
  screening: "Phone Screen",
  interview: "Interview",
  hired: "Offer / Hired",
  rejected: "Disqualified",
};

// Small helper to normalize an API application object into our shape
function normalizeApp(app, jobTitleMap = {}) {
  const candidate = app.candidate || {};
  let jobField = app.job;
  let jobID = typeof jobField === "object" && jobField !== null ? jobField.id : jobField;
  let jobTitle = (jobID && jobTitleMap[jobID]) || (typeof jobField === "object" ? jobField.title : "Unknown Job");

  let resumeLink = candidate.resume || "";
  if (resumeLink && !resumeLink.startsWith("http")) {
    resumeLink = `${DJANGO_BASE_URL}${resumeLink}`;
  }

  return {
    id: app.id,
    stage: (app.stage || "applied").toLowerCase(),
    job_id: jobID,
    job_title: jobTitle,
    candidate_name: candidate.full_name || "N/A",
    candidate_email: candidate.email || "N/A",
    phone: candidate.phone || "N/A",
    resume_link: resumeLink,
    applied_at: app.applied_at || "",
    // searchable text for local search if needed
    searchable_text: `${candidate.full_name || ""} ${candidate.email || ""} ${candidate.phone || ""} ${jobTitle || ""}`.toLowerCase(),
  };
}

export default function CandidatesPipeline() {
  const location = useLocation();
  const jobId = location.state?.jobId ?? null;

  // applications: all loaded application objects (appended as pages load)
  const [applications, setApplications] = useState([]);
  // allApplications: used only for accurate global counts (fetched once or periodically)
  const [allApplications, setAllApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState("applied");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [jobTitle, setJobTitle] = useState("Candidate Pipeline");

  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Load a single page (default: first page). IMPORTANT: we do NOT filter by stage here.
  const loadPage = useCallback(
    async (url = null) => {
      try {
        setLoading(true);

        // default to first page
        const endpoint = url || `${API_URL}applications/`;

        const [appsData, jobsData] = await Promise.all([
          fetchApplications(endpoint),
          fetch(`${DJANGO_BASE_URL}/api/jobs/`).then((res) => res.json()).catch(() => ({ results: [] })),
        ]);

        // map job titles
        const jobTitleMap = {};
        (jobsData.results || jobsData || []).forEach((job) => {
          if (job && job.id) jobTitleMap[job.id] = job.title;
        });

        const results = (appsData.results || appsData || []).map((a) => normalizeApp(a, jobTitleMap));

        // append new page results while removing duplicates by id (keep latest)
        setApplications((prev) => {
          const map = new Map();
          // first put previous apps
          prev.forEach((p) => map.set(p.id, p));
          // then overwrite/append with newly fetched results (so updated apps replace old)
          results.forEach((r) => map.set(r.id, r));
          // if jobId filter exists, keep only that job's entries in the "page store"
          const merged = Array.from(map.values()).filter((x) => (jobId ? x.job_id === jobId : true));
          // keep stable ordering by applied_at desc if available, else by id desc
          merged.sort((a, b) => (b.applied_at || b.id) > (a.applied_at || a.id) ? 1 : -1);
          return merged;
        });

        setNextPage(appsData.next ?? null);
        setPrevPage(appsData.previous ?? null);

        // if jobTitle wasn't set from location state, map it if possible
        if (jobId && jobsData && jobsData.results) {
          const found = jobsData.results.find((j) => j.id === jobId);
          if (found) setJobTitle(found.title);
        }
      } catch (err) {
        console.error("Error loading applications page:", err);
      } finally {
        setLoading(false);
      }
    },
    [jobId]
  );

  // Fetch all pages for counts (runs less frequently)
  const fetchAllForCounts = useCallback(
    async (jobIdArg = null) => {
      try {
        let url = `${API_URL}applications/${jobIdArg ? `?job=${jobIdArg}` : ""}`;
        let allData = [];
        while (url) {
          const data = await fetchApplications(url);
          const results = data.results || data;
          allData = [...allData, ...results];
          url = data.next;
        }
        const normalized = allData.map((a) => ({ id: a.id, stage: (a.stage || "applied").toLowerCase(), job: a.job }));
        setAllApplications(normalized);
      } catch (err) {
        console.error("Error fetching all applications for counts:", err);
      }
    },
    []
  );

  // initial load on mount or when jobId changes: clear previous page store and load first page
  useEffect(() => {
    setApplications([]); // clear page-store, we'll append pages back
    setNextPage(null);
    setPrevPage(null);
    setSelectedCandidate(null);
    // load first page
    loadPage(); // default URL will fetch first page
    // also refresh counts for tabs (job-scoped)
    fetchAllForCounts(jobId);
  }, [jobId, loadPage, fetchAllForCounts]);

  // Derived: candidates shown in left list = filter local page-store by activeStage
  const candidatesInActiveStage = useMemo(() => {
    return applications.filter((a) => a.stage === activeStage);
  }, [applications, activeStage]);

  // When the visible candidate list changes, pick the first candidate automatically
  useEffect(() => {
    if (candidatesInActiveStage.length > 0) {
      // preserve previously selectedCandidate if it still exists in the active list
      if (!selectedCandidate || !candidatesInActiveStage.some((c) => c.id === selectedCandidate.id)) {
        setSelectedCandidate(candidatesInActiveStage[0]);
      }
    } else {
      setSelectedCandidate(null);
    }
  }, [candidatesInActiveStage]); // eslint-disable-line

  // Helper to upsert a single normalized object into applications (page store) and allApplications
  const upsertAppLocal = useCallback((normalizedApp) => {
    setApplications((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      map.set(normalizedApp.id, normalizedApp);
      return Array.from(map.values());
    });
    setAllApplications((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      map.set(normalizedApp.id, { id: normalizedApp.id, stage: normalizedApp.stage, job: normalizedApp.job_id });
      return Array.from(map.values());
    });
  }, []);

  // Centralized stage-change handler — updates local stores so UI updates immediately without refetch
  const handleStageChangeLocal = useCallback(
    (appId, newStage, normalizedAppFromServer = null) => {
      // Update allApplications counts
      setAllApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, stage: newStage } : a)));

      // If we already have the candidate in applications, update it; otherwise if server returned the normalized app, insert it.
      setApplications((prev) => {
        const exists = prev.some((p) => p.id === appId);
        if (exists) {
          return prev.map((p) => (p.id === appId ? { ...p, stage: newStage } : p));
        } else if (normalizedAppFromServer) {
          // prepend into the local list if it belongs to the current job filter (or if no job filter)
          if (!jobId || normalizedAppFromServer.job_id === jobId) {
            return [normalizedAppFromServer, ...prev];
          }
        }
        return prev;
      });

      // If candidate moved INTO the current active stage, ensure it's selected/visible
      if (newStage === activeStage) {
        // if normalized provided push/select it; otherwise selection will update from applications useEffect
        if (normalizedAppFromServer) {
          upsertAppLocal({ ...normalizedAppFromServer, stage: newStage });
          setSelectedCandidate(normalizedAppFromServer);
        } else {
          // try to select it if present
          setSelectedCandidate((prevSelected) => {
            if (prevSelected?.id === appId) return prevSelected;
            const found = applications.find((a) => a.id === appId && a.stage === newStage);
            return found || prevSelected;
          });
        }
      } else {
        // If it moved OUT of the activeStage, remove it from the list so UI updates immediately
        setApplications((prev) => prev.filter((p) => p.id !== appId || p.stage === activeStage));
        // clear selection if it was the selected one
        setSelectedCandidate((sel) => (sel && sel.id === appId ? null : sel));
      }
    },
    [activeStage, jobId, applications, upsertAppLocal]
  );

  // API stage move functions — these call server then update local stores
  const moveToNextStage = async (app) => {
    const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
    if (currentIndex === -1 || currentIndex >= PIPELINE_STAGES.length - 1) return;
    const nextStage = PIPELINE_STAGES[currentIndex + 1];
    try {
      const data = await updateApplicationStage(app.id, nextStage);
      // server may return updated object — normalize and update local stores
      const normalized = normalizeApp(data || { ...app, stage: nextStage });
      handleStageChangeLocal(app.id, nextStage, normalized);
    } catch (err) {
      console.error("Failed to move stage:", err);
    }
  };

  const moveToPreviousStage = async (app) => {
    const currentIndex = PIPELINE_STAGES.indexOf(app.stage);
    if (currentIndex <= 0) return;
    const prevStage = PIPELINE_STAGES[currentIndex - 1];
    try {
      const data = await updateApplicationStage(app.id, prevStage);
      const normalized = normalizeApp(data || { ...app, stage: prevStage });
      handleStageChangeLocal(app.id, prevStage, normalized);
    } catch (err) {
      console.error("Failed to move stage:", err);
    }
  };

  const handleDisqualify = async (candidate) => {
    try {
      const data = await updateApplicationStage(candidate.id, "rejected");
      const normalized = normalizeApp(data || { ...candidate, stage: "rejected" });
      handleStageChangeLocal(candidate.id, "rejected", normalized);
    } catch (err) {
      console.error("Failed to disqualify candidate:", err);
    }
  };

  const handleRestoreCandidate = async (candidate) => {
    try {
      const data = await updateApplicationStage(candidate.id, "applied");
      const normalized = normalizeApp(data || { ...candidate, stage: "applied" });
      handleStageChangeLocal(candidate.id, "applied", normalized);
    } catch (err) {
      console.error("Failed to restore candidate:", err);
    }
  };

  // Next / Prev page handlers — they append/merge the new page into applications
  const handleLoadNext = useCallback(() => {
    if (nextPage) loadPage(nextPage);
  }, [nextPage, loadPage]);

  const handleLoadPrev = useCallback(() => {
    if (prevPage) loadPage(prevPage);
  }, [prevPage, loadPage]);

  // next/prev stage labels for buttons in detail pane
  const nextStageLabel = useMemo(() => {
    if (!selectedCandidate) return null;
    const idx = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
    return idx === -1 || idx === PIPELINE_STAGES.length - 1 ? null : stageLabels[PIPELINE_STAGES[idx + 1]];
  }, [selectedCandidate]);

  const prevStageLabel = useMemo(() => {
    if (!selectedCandidate) return null;
    const idx = PIPELINE_STAGES.indexOf(selectedCandidate.stage);
    return idx <= 0 ? null : stageLabels[PIPELINE_STAGES[idx - 1]];
  }, [selectedCandidate]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar jobTitle={jobTitle} location="Remote - Pakistan" totalCandidates={allApplications.length} />

      <PipelineTabs
        stages={PIPELINE_STAGES}
        stageLabels={stageLabels}
        applications={allApplications}
        activeStage={activeStage}
        setActiveStage={setActiveStage}
      />

      <div className="flex max-w-full">
        {/* Left Pane */}
        <div className="w-[380px] border-r bg-white min-h-[calc(100vh-140px)] shadow-md overflow-y-auto flex flex-col">
          <CandidateList
            candidates={candidatesInActiveStage}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={setSelectedCandidate}
          />

          <div className="flex justify-between p-3 border-t bg-gray-50 flex-shrink-0">
            <button onClick={handleLoadPrev} disabled={!prevPage} className={`px-3 py-1 text-sm rounded-md border ${prevPage ? "border-gray-300 hover:bg-gray-100" : "border-gray-200 text-gray-400 cursor-not-allowed"}`}>
              Previous
            </button>
            <button onClick={handleLoadNext} disabled={!nextPage} className={`px-3 py-1 text-sm rounded-md border ${nextPage ? "border-[#D64948] text-[#D64948] hover:bg-[#D64948] hover:text-white" : "border-gray-200 text-gray-400 cursor-not-allowed"}`}>
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
              Select a candidate from the <strong>{stageLabels[activeStage]}</strong> list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
