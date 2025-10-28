import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";

const EditJobPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 👈 get job ID from URL

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Load existing job on mount
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await API.get(`jobs/${id}/`);
        setFormData(response.data);
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // ✅ Handle form changes (same as your Create page)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (["requirements", "benefits", "responsibilities"].includes(name)) {
      const formatted =
        e.nativeEvent.inputType === "insertFromPaste"
          ? value
              .replace(/\r\n/g, "\n")
              .replace(/^\s*[-•*]\s*/gm, "• ")
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      await API.put(`jobs/${id}/`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(" Job updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err.response?.data || err);
      setError(
        err.response?.data?.detail ||
          "Failed to update job. Please check your input."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#D64948] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[#D64948]">Edit Job</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Job Title */}
        <div>
          <label className="block font-medium mb-1">Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Edit job title..."
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
            placeholder="Edit company details..."
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
            placeholder="Edit job description..."
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
            placeholder="Edit requirements..."
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
            placeholder="Edit benefits..."
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
            placeholder="Edit responsibilities..."
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
            placeholder="Edit location..."
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
          className="w-full bg-[#D64948] hover:bg-[#b73837] text-white font-medium px-6 py-3 rounded-lg transition"
        >
          Update Job
        </button>
      </form>
    </div>
  );
};

export default EditJobPage;
