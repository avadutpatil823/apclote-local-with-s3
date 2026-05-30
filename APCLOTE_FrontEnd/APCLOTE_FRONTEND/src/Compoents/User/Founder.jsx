import React from "react";

const founders = [
  {
    name: "Avadut Patil",
    role: "Main Founder & CEO",
    image: "/i1.jpeg",
    description: "Avadut Patil leads APCLOTE with a strong focus on vision, platform direction, and better digital learning experiences.",
  },
  {
    name: "BasavChetan Patil",
    role: "Co-Founder",
    image: "/i2.jpeg",
    description: "BasavChetan Patil contributes to course development and helps shape the educational strength of the platform.",
  },
  {
    name: "KedarLing Kanade",
    role: "Co-Founder",
    image: "/i4.jpeg",
    description: "KedarLing Kanade supports operations and user experience so students can navigate the platform smoothly.",
  },
  {
    name: "Prasad Bedge",
    role: "Co-Founder",
    image: "/i5.jpeg",
    description: "Prasad Bedge focuses on marketing and course presentation, helping APCLOTE reach the right learners.",
  },
  {
    name: "Omkar Patole",
    role: "Co-Founder",
    image: "/i6.jpeg",
    description: "Omkar Patole works on outreach and collaboration to expand APCLOTE’s educational presence.",
  },
  {
    name: "Sakshi Patil",
    role: "Co-Founder",
    image: "/i7.jpeg",
    description: "Sakshi Patil supports content quality and student engagement to keep learning effective and interactive.",
  },
];

const Founders = () => {
  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Founding Team</span>
          <h1 className="section-title mt-5">Meet the people building APCLOTE.</h1>
          <p className="section-subtitle mt-4 max-w-4xl">
            APCLOTE was shaped by a team of MCA graduates from GM University, Davangere,
            combining technology, education, and a shared push to improve online learning.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {founders.map((founder, index) => (
            <div key={index} className="dashboard-card p-6 flex flex-col items-center text-center">
              <img
                src={founder.image}
                alt={founder.name}
                className={`w-32 h-32 rounded-full object-cover mb-5 ${
                  index === 0 ? "ring-4 ring-amber-400" : "ring-4 ring-teal-200"
                }`}
              />
              <h2 className="text-xl font-semibold text-teal-900">{founder.name}</h2>
              <p className="text-sm font-medium text-amber-700 mb-3">{founder.role}</p>
              <p className="subtle-text text-sm">{founder.description}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Founders;
