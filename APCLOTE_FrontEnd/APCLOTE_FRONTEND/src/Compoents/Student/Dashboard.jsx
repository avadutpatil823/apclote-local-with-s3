import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLayers,
  FiPlayCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import { buildApiUrl } from "../../config/api";
import { formatDateTime12Hour } from "../../utils/timeFormat";
import ProgressBar from "../User/ProgressBar";

const parseStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  const rawValue = localStorage.getItem("JWT");
  if (!rawValue) {
    return "";
  }

  let token = rawValue;

  try {
    token = JSON.parse(rawValue);
  } catch {
    token = rawValue;
  }

  if (typeof token !== "string") {
    return "";
  }

  return token.replace(/^Bearer\s+/i, "").trim();
};

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getStoredToken()}`,
});

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) => formatDateTime12Hour(value);

const toneByStatus = {
  "In Progress": {
    background: "rgba(59, 130, 246, 0.12)",
    color: "#1d4ed8",
    border: "1px solid rgba(59, 130, 246, 0.22)",
  },
  Upcoming: {
    background: "rgba(14, 165, 233, 0.12)",
    color: "#0369a1",
    border: "1px solid rgba(14, 165, 233, 0.22)",
  },
  "Ready to Start": {
    background: "rgba(99, 102, 241, 0.12)",
    color: "#4338ca",
    border: "1px solid rgba(99, 102, 241, 0.22)",
  },
  Completed: {
    background: "rgba(34, 197, 94, 0.12)",
    color: "#15803d",
    border: "1px solid rgba(34, 197, 94, 0.2)",
  },
  "Payment Pending": {
    background: "rgba(245, 158, 11, 0.14)",
    color: "#b45309",
    border: "1px solid rgba(245, 158, 11, 0.22)",
  },
  "Payment Failed": {
    background: "rgba(239, 68, 68, 0.12)",
    color: "#b91c1c",
    border: "1px solid rgba(239, 68, 68, 0.22)",
  },
  Expired: {
    background: "rgba(100, 116, 139, 0.12)",
    color: "#475569",
    border: "1px solid rgba(100, 116, 139, 0.18)",
  },
};

const defaultTone = {
  background: "rgba(15, 23, 42, 0.06)",
  color: "#334155",
  border: "1px solid rgba(15, 23, 42, 0.1)",
};

const getStatusTone = (status) => toneByStatus[status] || defaultTone;

const StatCard = ({ icon, label, value, helper }) => (
  <div className="metric-card p-5 md:p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
        <p className="mt-2 text-sm subtle-text">{helper}</p>
      </div>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(6,182,212,0.16))",
          color: "#4338ca",
        }}
      >
        {icon}
      </div>
    </div>
  </div>
);

const MiniMeta = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-white/80 p-4">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
      {icon}
      <span>{label}</span>
    </div>
    <p className="mt-2 text-base font-bold text-slate-900">{value}</p>
  </div>
);

function Dashboard() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUser = useMemo(() => parseStoredJson("USER"), []);
  const fetchDashboard = async () => {
    const token = getStoredToken();

    if (!token) {
      setError("Please sign in to view your dashboard.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const dashboardUrl = studentId
        ? buildApiUrl(`/dashboard/admin/student?studentId=${studentId}`)
        : buildApiUrl("/dashboard/student/me");
      const response = await axios.get(dashboardUrl, {
        headers: getAuthHeaders(),
      });
      setDashboard(response.data);
    } catch (requestError) {
      setError(
        requestError?.response?.status === 401
          ? "Your session is not authorized for the dashboard. Please log in again."
          :
        requestError?.response?.data?.message ||
          "We could not load the dashboard right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [studentId]);

  const summary = dashboard?.summary || {};
  const student = dashboard?.student || currentUser || {};
  const courses = dashboard?.courses || [];
  const activity = dashboard?.recentActivity || [];
  const upcomingClasses = dashboard?.upcomingClasses || [];
  const recommendations = dashboard?.recommendations || [];

  const metricCards = [
    {
      label: "Courses",
      value: summary.totalCourses ?? 0,
      helper: "Tracked from enrolled and purchased batches",
      icon: <FiLayers size={22} />,
    },
    {
      label: "Avg Progress",
      value: `${summary.averageProgress ?? 0}%`,
      helper: "Weighted from videos started and tests attempted",
      icon: <FiTrendingUp size={22} />,
    },
    {
      label: "Watch Time",
      value: `${summary.totalWatchHours ?? 0} hrs`,
      helper: "Approximate time from saved video tracking",
      icon: <FiClock size={22} />,
    },
    {
      label: "Tests Attempted",
      value: summary.testsAttempted ?? 0,
      helper: `Average score ${summary.averageTestScore ?? 0}%`,
      icon: <FiBarChart2 size={22} />,
    },
  ];

  const openBatchWorkspace = (course) => {
    if (!course?.classRooms?.length) {
      navigate("/myBatchs");
      return;
    }

    navigate("/streamBatch", {
      state: {
        classRooms: course.classRooms,
        batchName: course.batchName,
        batchId: course.batchId,
      },
    });
  };

  const continuePayment = (course) => {
    if (!course?.purchaseOrderId) {
      navigate("/myPOs");
      return;
    }

    navigate("/dopay", {
      state: { poId: course.purchaseOrderId },
    });
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-content space-y-6">
          <section className="section-hero">
            <span className="eyebrow">Student Dashboard</span>
            <h1 className="section-title mt-5">Loading your learning dashboard...</h1>
            <p className="section-subtitle mt-4">
              We are preparing course progress, recent activity, and class updates from your saved analytics.
            </p>
          </section>

          <div className="grid-auto-fit">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="metric-card p-6">
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-5 h-10 w-32 rounded-full bg-slate-100" />
                <div className="mt-4 h-4 w-48 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <div className="page-content">
          <div className="content-card empty-card mx-auto">
            <h1 className="title-dark">Dashboard unavailable</h1>
            <p className="subtle-text mt-4">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={fetchDashboard} className="primary-btn">
                <FiRefreshCw /> Retry
              </button>
              <Link to="/login" className="ghost-btn">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="section-hero overflow-hidden">
          <div className="floating-orb one" />
          <div className="floating-orb two" />
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <span className="eyebrow">Student Dashboard</span>
              <h1 className="section-title mt-5">
                {student?.name ? `${student.name}, here is your learning pulse.` : "Your learning pulse."}
              </h1>
              <p className="section-subtitle mt-4 max-w-3xl">
                Track every enrolled course, payment status, video progress, tests, upcoming classes, and saved activity from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => navigate("/myBatchs")} className="ghost-btn">
                  <FiBookOpen /> Enrolled Courses
                </button>
                <button onClick={() => navigate("/myPOs")} className="ghost-btn">
                  <FiCreditCard /> Purchase Orders
                </button>
              </div>
            </div>

            <div className="media-frame p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-sky-100/80">Overview</p>
              <div className="mt-5 flex items-end gap-4">
                <div>
                  <p className="text-5xl font-bold">{summary.averageProgress ?? 0}%</p>
                  <p className="mt-2 text-sm text-sky-100/85">Average progress across tracked courses</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Completed courses</span>
                  <strong>{summary.completedCourses ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Upcoming classes</span>
                  <strong>{summary.upcomingClasses ?? 0}</strong>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Pending payments</span>
                  <strong>{summary.pendingPayments ?? 0}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid-auto-fit">
          {metricCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="content-card p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="eyebrow !bg-[#eef6ff] !text-[#1d4ed8] !border-[#cfe0ff]">Profile</span>
                <h2 className="title-dark mt-4 text-3xl">Student Snapshot</h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.1)] text-indigo-700">
                <FiUser size={26} />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <MiniMeta icon={<FiUser />} label="Name" value={student?.name || "Student"} />
              <MiniMeta icon={<FiBookOpen />} label="Role" value={student?.role || "ROLE_USER"} />
              <MiniMeta icon={<FiActivity />} label="Email" value={student?.email || "Not available"} />
              <MiniMeta icon={<FiCalendar />} label="Member Since" value={formatDate(student?.memberSince)} />
            </div>

            <div className="mt-5 rounded-[24px] border border-[rgba(79,70,229,0.12)] bg-[linear-gradient(135deg,rgba(79,70,229,0.06),rgba(6,182,212,0.08))] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Address</p>
              <p className="mt-3 text-base font-medium text-slate-900">{student?.address || "No address added yet."}</p>
            </div>
          </section>

          <section className="surface-panel p-6 md:p-7">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <span className="eyebrow !bg-[#ecfeff] !text-[#0f766e] !border-[#bae6fd]">Guidance</span>
                <h2 className="title-dark mt-4 text-3xl">What to focus on next</h2>
                <div className="mt-5 space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-white/85 px-4 py-4 text-sm font-medium text-slate-700"
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-white/85 px-4 py-4 text-sm subtle-text">
                      No recommendations yet.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="eyebrow !bg-[#fff7ed] !text-[#b45309] !border-[#fed7aa]">Upcoming</span>
                <h2 className="title-dark mt-4 text-3xl">Next classes</h2>
                <div className="mt-5 space-y-3">
                  {upcomingClasses.length > 0 ? (
                    upcomingClasses.map((item) => (
                      <div key={`${item.batchId}-${item.scheduledAt}`} className="dashboard-card p-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{item.batchName}</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">{item.courseName}</p>
                        <p className="mt-2 text-sm subtle-text">{formatDateTime(item.scheduledAt)}</p>
                      </div>
                    ))
                  ) : (
                    <div className="content-card p-5 subtle-text">No upcoming classes found right now.</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#eef2ff] !text-[#4338ca] !border-[#c7d2fe]">Courses</span>
              <h2 className="title-dark mt-4">Courses, progress, and access</h2>
              <p className="subtle-text mt-3">
                Every card below is backed by saved analytics in the database and refreshed from your real course activity.
              </p>
            </div>
            <button onClick={fetchDashboard} className="ghost-btn w-fit">
              <FiRefreshCw /> Refresh Dashboard
            </button>
          </div>

          <div className="mt-7 space-y-5">
            {courses.length > 0 ? (
              courses.map((course) => {
                const tone = getStatusTone(course.status);
                const canOpenWorkspace = course.orderStatus === "COMPLETED";
                const canPayNow = course.orderStatus === "PENDING";

                return (
                  <article key={course.batchId} className="dashboard-card p-6 md:p-7">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="pill-tag">{course.batchName}</span>
                          <span style={{ ...tone, borderRadius: 999, padding: "0.5rem 0.9rem", fontWeight: 800, fontSize: "0.82rem" }}>
                            {course.status}
                          </span>
                          <span className="rounded-full border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            {course.orderStatus}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-2xl font-bold text-slate-900">{course.courseName}</h3>
                          <p className="mt-2 subtle-text">
                            Fee: Rs {course.courseFee ?? "0"} | Duration: {course.courseDuration ?? "0"} months | Valid till{" "}
                            {formatDate(course.validUntil)}
                          </p>
                        </div>
                      </div>

                      <div className="min-w-[220px] rounded-[28px] border border-[rgba(79,70,229,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.92))] p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Progress</p>
                        <p className="mt-3 text-4xl font-bold text-slate-900">{course.progressPercentage}%</p>
                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(course.progressPercentage || 0, 100)}%`,
                              background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <MiniMeta
                        icon={<FiPlayCircle />}
                        label="Videos"
                        value={`${course.videosStarted}/${course.totalVideos} started`}
                      />
                      <MiniMeta
                        icon={<FiCheckCircle />}
                        label="Tests"
                        value={`${course.testsAttempted}/${course.totalTests} attempted`}
                      />
                      <MiniMeta
                        icon={<FiBookOpen />}
                        label="Notes"
                        value={`${course.completedNotes || 0}/${course.totalNotes || 0} completed`}
                      />
                      <MiniMeta
                        icon={<FiClock />}
                        label="Watch Time"
                        value={`${course.totalWatchHours} hrs`}
                      />
                      <MiniMeta
                        icon={<FiTrendingUp />}
                        label="Average Score"
                        value={`${course.averageTestScore}%`}
                      />
                    </div>

                    {course.classRooms?.length > 0 && (
                      <div className="mt-6 rounded-[24px] border border-[rgba(79,70,229,0.12)] bg-white/85 p-5">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Classroom completion</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          {course.classRooms.map((room) => (
                            <div key={room.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <ProgressBar value={room.completionPercentage} label={room.name || "Classroom"} compact />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {course.recentTestResults?.length > 0 && (
                      <div className="mt-6 rounded-[24px] border border-[rgba(79,70,229,0.12)] bg-white/80 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Recent Test Results</p>
                            <p className="mt-1 text-sm subtle-text">Latest attempted tests for this course.</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {course.recentTestResults.map((result) => (
                            <div
                              key={`${course.batchId}-${result.testId}-${result.attemptedDate}`}
                              className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-[linear-gradient(180deg,rgba(248,250,255,0.98),rgba(238,242,255,0.88))] p-4"
                            >
                              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{result.className}</p>
                              <h4 className="mt-2 text-lg font-bold text-slate-900">{result.testName}</h4>
                              <p className="mt-2 text-sm subtle-text">Attempted on {formatDate(result.attemptedDate)}</p>
                              <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                                <span className="rounded-full bg-[rgba(34,197,94,0.12)] px-3 py-2 text-green-700">
                                  Correct: {result.correctAns}
                                </span>
                                <span className="rounded-full bg-[rgba(239,68,68,0.12)] px-3 py-2 text-red-700">
                                  Wrong: {result.wrongAns}
                                </span>
                                <span className="rounded-full bg-[rgba(79,70,229,0.12)] px-3 py-2 text-indigo-700">
                                  Score: {result.scorePercentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                      <div className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-white/80 px-4 py-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Last activity</p>
                        <p className="mt-2 text-base font-bold text-slate-900">{formatDateTime(course.lastActivityAt)}</p>
                      </div>
                      <div className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-white/80 px-4 py-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Next class</p>
                        <p className="mt-2 text-base font-bold text-slate-900">{formatDateTime(course.nextClassDate)}</p>
                      </div>
                      <div className="rounded-2xl border border-[rgba(79,70,229,0.12)] bg-white/80 px-4 py-4">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Workspace</p>
                        <p className="mt-2 text-base font-bold text-slate-900">
                          {course.totalClassRooms} rooms, {course.totalClasses} classes
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {canOpenWorkspace && (
                        <button onClick={() => openBatchWorkspace(course)} className="primary-btn">
                          Continue Learning <FiArrowRight />
                        </button>
                      )}

                      {canPayNow && (
                        <button onClick={() => continuePayment(course)} className="secondary-btn">
                          <FiCreditCard /> Complete Payment
                        </button>
                      )}

                      <button onClick={() => navigate("/myPOs")} className="ghost-btn">
                        <FiCreditCard /> Orders
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty-state">
                <div className="content-card empty-card">
                  <h3 className="title-dark text-2xl">No tracked courses yet</h3>
                  <p className="subtle-text mt-4">
                    Once you purchase or enroll in a batch, your dashboard will start showing course analytics here.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link to="/allBatchs" className="primary-btn cta-btn">
                      Explore Courses
                    </Link>
                    <Link to="/myPOs" className="ghost-btn">
                      View Orders
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff7ed] !text-[#c2410c] !border-[#fed7aa]">Activity</span>
              <h2 className="title-dark mt-4">Recent timeline</h2>
            </div>
            <p className="subtle-text">Generated at {formatDateTime(dashboard?.generatedAt)}</p>
          </div>

          <div className="mt-6 grid gap-4">
            {activity.length > 0 ? (
              activity.map((item, index) => (
                <div key={`${item.batchId}-${index}`} className="content-card p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{item.type}</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{item.batchName}</h3>
                      <p className="mt-1 subtle-text">{item.message}</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-500">{formatDateTime(item.occurredAt)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="content-card p-6 subtle-text">No recent activity has been captured yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
