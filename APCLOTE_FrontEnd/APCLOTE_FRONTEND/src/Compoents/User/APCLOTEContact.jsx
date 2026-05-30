import React, { useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const APCLOTEContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for contacting APCLOTE! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Contact</span>
          <h1 className="section-title mt-5">Reach out when you need help, guidance, or a better learning fit.</h1>
          <p className="section-subtitle mt-4 max-w-3xl">
            Whether you're joining as a student or exploring collaboration as an educator,
            the APCLOTE team is here to help you move forward.
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="dashboard-card p-8 text-slate-800">
            <h2 className="text-3xl font-semibold mb-4">Get in touch</h2>
            <p className="subtle-text leading-relaxed">
              Have questions about batches, course access, classroom flow, or mentoring?
              Send us a note and we will point you in the right direction.
            </p>

            <div className="space-y-5 mt-8">
              <div className="flex items-center gap-4">
                <FaPhoneAlt className="text-teal-700 text-xl" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-4">
                <FaEnvelope className="text-teal-700 text-xl" />
                <span>support@apclote.com</span>
              </div>
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-teal-700 text-xl" />
                <span>APCLOTE Online Coaching, Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>

          <div className="surface-panel p-8">
            <h2 className="text-2xl font-semibold text-teal-800 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="field-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Write your message here..."
                  className="field-textarea"
                ></textarea>
              </div>

              <button type="submit" className="primary-btn w-full">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default APCLOTEContact;
