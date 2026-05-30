import React from "react";
import { FaCheckCircle } from "react-icons/fa";

const APCLOTEPricing = () => {
  const plans = [
    {
      name: "Starter Plan",
      price: "Rs 499 / month",
      description: "Perfect for individual learners and self-paced study.",
      features: [
        "Access to 50+ video lectures",
        "Basic quizzes and assignments",
        "Certificate after completion",
        "Email support",
      ],
      highlighted: false,
    },
    {
      name: "Pro Plan",
      price: "Rs 999 / month",
      description: "Ideal for students who want more live support and deeper progress tracking.",
      features: [
        "All Starter features",
        "Access to 200+ courses",
        "Live mentor sessions",
        "Progress dashboard",
        "Priority support",
      ],
      highlighted: true,
    },
    {
      name: "Enterprise Plan",
      price: "Custom pricing",
      description: "For institutions and organizations managing multiple learners at once.",
      features: [
        "All Pro features",
        "Institution analytics",
        "Custom course integration",
        "Dedicated account manager",
        "24/7 technical support",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Pricing</span>
          <h1 className="section-title mt-5">Simple plans for learners, ambitious students, and growing teams.</h1>
          <p className="section-subtitle mt-4 max-w-3xl">
            Choose the level of access and support that matches your learning goals today,
            with room to scale as you grow.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`${plan.highlighted ? "section-hero scale-[1.01]" : "dashboard-card"} p-8`}
            >
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-3xl font-semibold mb-4">{plan.price}</p>
              <p className={`mb-6 ${plan.highlighted ? "text-white/80" : "subtle-text"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FaCheckCircle className={plan.highlighted ? "text-amber-300" : "text-emerald-600"} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`${plan.highlighted ? "ghost-btn text-slate-900 mt-8 w-full" : "primary-btn mt-8 w-full"}`}>
                {plan.name === "Enterprise Plan" ? "Contact Us" : "Get Started"}
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default APCLOTEPricing;
