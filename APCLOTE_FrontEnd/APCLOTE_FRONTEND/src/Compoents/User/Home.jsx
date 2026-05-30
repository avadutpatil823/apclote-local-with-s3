import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import BatchCard from "./BatchCard";

const Home = () => {
  const { batchs } = useSelector((store) => store);
  const page = batchs.page;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllBatchs(page));
  }, [dispatch]);

  const ltBatchs = batchs?.allBatchs.slice(0, 3);

  return (
    <div className="page-shell">
      <div className="page-content space-y-10">
        <section className="section-hero">
          <div className="floating-orb one"></div>
          <div className="floating-orb two"></div>
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <span className="eyebrow">Smarter Coaching Platform</span>
              <h1 className="section-title">
                Learn with structure, clarity, and a platform built for real
                progress.
              </h1>
              <p className="section-subtitle max-w-2xl">
                APCLOTE brings together courses, mentors, live sessions, notes,
                and tests in one focused learning experience for students,
                lecturers, and academic teams.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/allBatchs" className="primary-btn cta-btn">
                  Explore Courses
                </Link>
                {!localStorage.getItem("JWT") && (
                  <Link to="/register" className="ghost-btn">
                    Create Account
                  </Link>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3 pt-4">
                <div className="metric-card p-5">
                  <div className="text-3xl font-black text-teal-700">24/7</div>
                  <div className="subtle-text text-sm">
                    Access classes, notes, and recorded learning anytime.
                  </div>
                </div>
                <div className="metric-card p-5">
                  <div className="text-3xl font-black text-teal-700">Live</div>
                  <div className="subtle-text text-sm">
                    Join scheduled rooms and keep classroom flow organized.
                  </div>
                </div>
                <div className="metric-card p-5">
                  <div className="text-3xl font-black text-teal-700">Tests</div>
                  <div className="subtle-text text-sm">
                    Practice, review, and build confidence inside the same app.
                  </div>
                </div>
              </div>
            </div>
            <div className="media-frame p-4 soft-grid">
              <img
                src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37481.jpg"
                alt="APCLOTE Learning"
                className="rounded-[24px] shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="surface-panel px-6 py-8 md:px-8">
          <div className="text-center mb-10">
            <h2 className="title-dark">Why learners stay with APCLOTE</h2>
            <p className="subtle-text mt-3 max-w-2xl mx-auto">
              The platform follows the full study flow: discover a batch,
              enroll, attend live class, revisit notes, and measure progress
              with tests.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="dashboard-card p-8">
              <h3 className="text-xl font-semibold mb-3 text-teal-800">
                Expert Mentors
              </h3>
              <p className="subtle-text">
                Learn from experienced educators and subject specialists who
                guide students with practical clarity.
              </p>
            </div>
            <div className="dashboard-card p-8">
              <h3 className="text-xl font-semibold mb-3 text-teal-800">
                Flexible Learning
              </h3>
              <p className="subtle-text">
                Use the platform across devices and keep learning moving at a
                pace that actually fits your routine.
              </p>
            </div>
            <div className="dashboard-card p-8">
              <h3 className="text-xl font-semibold mb-3 text-teal-800">
                Affordable Growth
              </h3>
              <p className="subtle-text">
                High-value teaching, notes, and practice support without making
                quality feel out of reach.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">
                Courses
              </p>
              <h2 className="title-dark mt-3">Featured batches ready to explore</h2>
            </div>
            <Link to="/allBatchs" className="primary-btn w-fit">
              View All Courses
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {ltBatchs.length > 0 ? (
              ltBatchs.map((batch) => <BatchCard key={batch.id} batch={batch} />)
            ) : (
              <p className="col-span-full text-center subtle-text text-lg">
                No batches found.
              </p>
            )}
          </div>
        </section>

        <section className="surface-panel px-6 py-8 md:px-8">
          <div className="text-center">
            <h2 className="title-dark mb-12">What our students say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Rahul",
                  text: "APCLOTE helped me crack my dream exam. The structured classes and practice flow kept me on track.",
                },
                {
                  name: "Sneha",
                  text: "The flexibility to learn at my own pace and revisit lessons later made a huge difference for me.",
                },
                {
                  name: "Arjun",
                  text: "Mentors are supportive, responsive, and genuinely focused on helping students improve.",
                },
                {
                  name: "Priya",
                  text: "Interactive quizzes and revision materials made learning more engaging and much less stressful.",
                },
                {
                  name: "Karan",
                  text: "The course material feels current and practical, especially for competitive preparation.",
                },
                {
                  name: "Anjali",
                  text: "The platform helped me stay consistent and motivated throughout my preparation journey.",
                },
              ].map((t, i) => (
                <div key={i} className="dashboard-card p-6 text-left">
                  <p className="text-slate-700 italic mb-4">"{t.text}"</p>
                  <h3 className="font-semibold text-teal-700">- {t.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
