import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

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
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Handle Change — keeps newlines + formats pasted bullets
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Keep newlines for typing normally
    if (["requirements", "benefits", "responsibilities"].includes(name)) {
      // Only apply formatting when pasting (not typing)
      const formatted =
        e.nativeEvent.inputType === "insertFromPaste"
          ? value
              .replace(/\r\n/g, "\n") // Normalize line breaks
              .replace(/^\s*[-•*]\s*/gm, "• ") // Convert -, *, etc. to •
              .trim()
          : value;

      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //  Submit Job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setIsLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      await API.post("jobs/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(" Job created successfully!");
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

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err.response?.data || err);
      const message =
        err.response?.data?.title ||
        err.response?.data?.type ||
        JSON.stringify(err.response?.data) ||
        "Failed to create job. Please check your input.";
      setError(message);
    }finally {
      // 3. STOP LOADING, ensuring the button is re-enabled after success or error
      setIsLoading(false);
    }
    
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[#D64948]">Create Job</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Write Job title..."
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948]"
          />
        </div>

        {/* Company Details */}
        <div>
          <label className="block font-medium mb-1">Company Details</label>
          <textarea
            name="company_details"
            value={formData.company_details}
            onChange={handleChange}
            rows="3"
            placeholder="Write about the company..."
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948] resize-y"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Write job description here..."
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948] resize-y"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block font-medium mb-1">Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            rows="5"
            placeholder={`Write requirements `}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948] resize-y"
          />
          
        </div>

        {/* Benefits */}
        <div>
          <label className="block font-medium mb-1">Benefits</label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            rows="4"
            placeholder={`Write benefits / what we offer`}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948] resize-y"
          />
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block font-medium mb-1">Responsibilities</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            rows="4"
            placeholder={`Write responsibilities`}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948] resize-y"
          />
        </div>

        {/* Job Type */}
        <div>
          <label className="block font-medium mb-1">Job Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948]"
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
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Dubai / Remote"
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D64948]"
          />
        </div>

        {/* Is Open */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_open"
            checked={formData.is_open}
            onChange={handleChange}
            className="h-5 w-5 accent-[#D64948]"
          />
          <label className="font-medium">Open for Applications</label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#D64948] hover:bg-[#b73837] text-white font-medium px-6 py-3 rounded-lg transition"
        >
          {/* Change text based on loading state */}
          {isLoading ? "Creating Job..." : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default CreateJobPage;