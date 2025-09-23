import React from "react";
import JobApplyForm from "./JobApplyForm";
import { useParams } from "react-router-dom";

const JobApplyPage = () => {
  const { id } = useParams();
  
  return (
    <JobApplyForm jobId={id} />
  );
};

export default JobApplyPage;