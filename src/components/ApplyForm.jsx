import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { applyJob } from "../api/api";

const ApplyForm = ({ jobId: propJobId }) => {
  const { id: routeJobId } = useParams();
  const jobId = propJobId || routeJobId;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      setMessage("⚠️ Please upload your resume to continue.");
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("resume", resume);

    try {
      const data = await applyJob(jobId, formData);
      if (data.error) throw new Error(data.error);

      setMessage("Your application has been submitted successfully!");
      setShowModal(true);

      // Reset fields
      setFullName("");
      setEmail("");
      setPhone("");
      setResume(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setMessage(err.message || "❌ Something went wrong. Try again.");
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-gray-100">
        {/* Header */}
        <h2 className="text-3xl font-extrabold text-center text-[#D64948] mb-2">
          Apply for Job
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Fill in your details and upload your resume
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#D64948] focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#D64948] focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-[#D64948] focus:outline-none"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setResume(e.target.files[0])}
            accept=".pdf,.doc,.docx"
            required
            className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#D64948] focus:outline-none"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#D64948] text-white py-3 rounded-lg font-semibold shadow hover:bg-[#b63a39] transition disabled:opacity-70"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full border border-gray-100">
            <p className="text-center text-gray-700 mb-6 font-medium">
              {message}
            </p>
            <button
              className="w-full bg-[#D64948] text-white py-2 rounded-lg hover:bg-[#b63a39] transition"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyForm;
