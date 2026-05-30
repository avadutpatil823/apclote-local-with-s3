import React from "react";

const groups = [
  {
    title: "Information We Collect",
    points: [
      "Personal details such as name, email, phone number, and profile data.",
      "Learning activity including course progress, quiz results, and preferences.",
      "Payment-related information needed for purchases.",
      "Technical information such as browser, device, and IP details.",
    ],
  },
  {
    title: "How We Use Your Information",
    points: [
      "To provide and personalize the learning experience.",
      "To send important platform updates and support messages.",
      "To improve platform performance and security.",
      "To comply with legal obligations when required.",
    ],
  },
  {
    title: "Data Security",
    points: [
      "We use secure protocols and access controls to protect user data.",
      "Sensitive access is limited to authorized personnel.",
      "No platform can guarantee absolute security, but we aim to reduce risk responsibly.",
    ],
  },
];

const Privacy = () => {
  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Privacy</span>
          <h1 className="section-title mt-5">Privacy Policy</h1>
          <p className="section-subtitle mt-4 max-w-4xl">
            APCLOTE is committed to handling personal information carefully and
            transparently while delivering the platform experience.
          </p>
        </section>

        <section className="surface-panel p-6 md:p-8 space-y-8">
          <p className="subtle-text text-lg leading-8">
            This policy explains how APCLOTE collects, uses, and safeguards your
            data when you use the platform.
          </p>

          {groups.map((group, index) => (
            <div key={group.title} className="content-card p-6">
              <h2 className="text-2xl font-semibold text-teal-800 mb-4">
                {index + 1}. {group.title}
              </h2>
              <ul className="space-y-3 text-slate-700">
                {group.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-600"></span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="content-card p-6">
            <h2 className="text-2xl font-semibold text-teal-800 mb-4">4. Cookies & Tracking</h2>
            <p className="subtle-text leading-8">
              APCLOTE may use cookies and similar tools to remember preferences,
              improve usability, and better understand platform traffic patterns.
            </p>
          </div>

          <div className="content-card p-6">
            <h2 className="text-2xl font-semibold text-teal-800 mb-4">5. Third-Party Services</h2>
            <p className="subtle-text leading-8">
              The platform may integrate with services such as payment providers or
              social sign-in providers. Those services may process data under their own policies.
            </p>
          </div>

          <div className="content-card p-6">
            <h2 className="text-2xl font-semibold text-teal-800 mb-4">6. User Rights</h2>
            <p className="subtle-text leading-8">
              Users may request access, correction, or deletion of personal information
              based on the platform’s available account and support processes.
            </p>
          </div>

          <p className="text-sm text-slate-500">Last updated: 20 October 2025</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
