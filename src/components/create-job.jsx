import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    company_details: "",
    description: "",
    requirements: "",
    benefits: "",
    responsibilities: "",
    type: "full-time",
    location: "",
    is_open: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access"); // admin JWT
      await axios.post("http://127.0.0.1:8000/api/jobs/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Job created successfully!");
      setError("");
      setFormData({
        title: "",
        company_details: "",
        description: "",
        requirements: "",
        benefits: "",
        responsibilities: "",
        type: "full-time",
        location: "",
        is_open: true,
      });

      setTimeout(() => navigate("/admin-dashboard"), 1500);
    } catch (err) {
      setError("Failed to create job. Please check your input.");
      setSuccess("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-[#D64948]">Create Job</h2>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Company Details */}
        <div>
          <label className="block font-medium">Company Details</label>
          <textarea
            name="company_details"
            value={formData.company_details}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block font-medium">Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block font-medium">Benefits</label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block font-medium">Responsibilities</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block font-medium">Job Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block font-medium">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Is Open */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_open"
            checked={formData.is_open}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="font-medium">Open for Applications</label>
        </div>

        <button
          type="submit"
          className="bg-[#D64948] text-white px-6 py-2 rounded-lg hover:bg-[#b73837] transition"
        >
          Create Job
        </button>
      </form>
    </div>
  );
};

export default CreateJobPage;
