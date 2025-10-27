import React, { useEffect, useState } from "react";
import { fetchJobs } from "../api/api";
import JobCard from "./JobCard";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data.results || []);
      })
      .catch((err) => console.error(" Failed to fetch jobs:", err))
      .finally(() => setLoading(false));
  }, []);


  const fullPageWrapperClass = "flex justify-center items-center h-[calc(100vh-4rem-24px)] p-6";

  if (loading) {
    return (
      <div className={fullPageWrapperClass}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D64948] border-t-transparent"></div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className={fullPageWrapperClass}>
        <h4 className="text-gray-500 text-lg italic">
          No jobs available at the moment.
        </h4>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 px-4 sm:px-6 py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#D64948] mb-8 sm:mb-10">
        Available Jobs
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobList;
