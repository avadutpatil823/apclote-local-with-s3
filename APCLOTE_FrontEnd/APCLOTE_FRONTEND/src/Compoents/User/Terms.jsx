import React from "react";

const sections = [
  {
    title: "Account Registration",
    points: [
      "Users must register with accurate personal information.",
      "Each account is personal and sharing credentials is prohibited.",
      "Users are responsible for maintaining account confidentiality.",
    ],
  },
  {
    title: "Payment and Subscription",
    points: [
      "Paid courses must be purchased through authorized payment channels.",
      "Refund handling follows APCLOTE subscription guidelines.",
      "Prices and subscription fees may change over time.",
    ],
  },
  {
    title: "Content Usage",
    points: [
      "Course materials and videos are for personal, non-commercial use.",
      "Copying or distributing platform content without permission is prohibited.",
      "Accounts may be restricted for violating content rules.",
    ],
  },
  {
    title: "User Conduct",
    points: [
      "Users must not engage in abusive, offensive, or illegal behavior.",
      "Spam and misleading content are not allowed.",
      "Violations may lead to suspension or further action.",
    ],
  },
];

const Terms = () => {
  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Legal</span>
          <h1 className="section-title mt-5">Terms & Conditions</h1>
          <p className="section-subtitle mt-4 max-w-4xl">
            By using APCLOTE, you agree to the platform rules that help keep
            learning safe, fair, and reliable for everyone.
          </p>
        </section>

        <section className="surface-panel p-6 md:p-8 space-y-8">
          <p className="subtle-text text-lg leading-8">
            Welcome to <span className="font-semibold text-teal-800">APCLOTE</span>,
            your online coaching platform. Please review these terms carefully before
            using the service.
          </p>

          {sections.map((section, index) => (
            <div key={section.title} className="content-card p-6">
              <h2 className="text-2xl font-semibold text-teal-800 mb-4">
                {index + 1}. {section.title}
              </h2>
              <ul className="space-y-3 text-slate-700">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="content-card p-6">
            <h2 className="text-2xl font-semibold text-teal-800 mb-4">5. Limitation of Liability</h2>
            <p className="subtle-text leading-8">
              APCLOTE strives to provide accurate, useful, and current learning content,
              but does not guarantee specific outcomes from platform usage.
            </p>
          </div>

          <div className="content-card p-6">
            <h2 className="text-2xl font-semibold text-teal-800 mb-4">6. Modifications</h2>
            <p className="subtle-text leading-8">
              We may update these terms from time to time. Continued use of the platform
              means you accept the revised terms.
            </p>
          </div>

          <p className="text-sm text-slate-500">Last updated: 20 October 2025</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
