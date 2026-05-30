import React from "react";
import { FaLightbulb, FaHandshake, FaUsers, FaChartLine } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">About APCLOTE</span>
          <h1 className="section-title mt-5">A learning ecosystem built to connect teaching, progress, and trust.</h1>
          <p className="section-subtitle mt-5 max-w-4xl">
            APCLOTE is designed to reduce friction across the full education experience.
            Students can learn with clarity, lecturers can manage delivery better, and
            institutions gain a more connected academic workflow.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="dashboard-card p-8">
            <FaLightbulb className="text-5xl text-amber-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Our Vision</h2>
            <p className="subtle-text">
              We imagine education that feels accessible, data-aware, and genuinely supportive for every learner and educator.
            </p>
          </div>

          <div className="dashboard-card p-8">
            <FaHandshake className="text-5xl text-teal-600 mb-4" />
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="subtle-text">
              We build tools that simplify academic operations, strengthen the learning experience, and make collaboration easier at every stage.
            </p>
          </div>
        </section>

        <section className="surface-panel p-8 md:p-10">
          <h2 className="title-dark text-center mb-8">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="content-card p-6 text-center">
              <FaUsers className="text-4xl text-teal-600 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Collaboration</h3>
              <p className="subtle-text">Students, teachers, and admins work better when the platform keeps everyone aligned.</p>
            </div>
            <div className="content-card p-6 text-center">
              <FaChartLine className="text-4xl text-emerald-600 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="subtle-text">We keep improving the learning flow using technology that makes education clearer and more effective.</p>
            </div>
            <div className="content-card p-6 text-center">
              <FaLightbulb className="text-4xl text-amber-500 mb-3 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="subtle-text">Trust, transparency, and fairness shape how we design the experience and handle academic data.</p>
            </div>
          </div>
        </section>

        <section className="content-card p-8 md:p-10 text-center">
          <h2 className="title-dark mb-5">Join us in shaping the future of learning</h2>
          <p className="subtle-text text-lg max-w-3xl mx-auto">
            Whether you are a learner, lecturer, or institution, APCLOTE is built to support a more connected and motivating way to grow.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
