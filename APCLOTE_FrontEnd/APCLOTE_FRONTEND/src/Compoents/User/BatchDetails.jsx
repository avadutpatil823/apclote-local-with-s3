import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { buildApiUrl } from "../../config/api";
import { formatTimeRange12Hour } from "../../utils/timeFormat";
import {
  FaChalkboardTeacher,
  FaBookOpen,
  FaUserGraduate,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";

const BatchDetails = () => {
  const location = useLocation();
  const { batch } = location.state || {};
  const navigate = useNavigate();
  const classRooms = React.useMemo(() => batch?.classRooms || [], [batch?.classRooms]);
  const teachingAssignments = React.useMemo(() => {
    const lecturers = batch?.lecturers || [];
    const assignments = batch?.lecturerBatchSubjects || [];
    const rows = Math.max(lecturers.length, assignments.length);

    return Array.from({ length: rows }, (_, index) => {
      const assignment = assignments[index];
      const lecturer = assignment?.lecturer || lecturers[index];

      return {
        id: assignment?.id || lecturer?.id || index,
        lecturerName: lecturer?.user?.name || "N/A",
        subjectName: assignment?.subject?.name || "N/A"
      };
    });
  }, [batch?.lecturerBatchSubjects, batch?.lecturers]);
  const [expandedClassRoomId, setExpandedClassRoomId] = React.useState(null);
  const syllabusPath = batch?.course?.syllabusFilePath?.replace(/\\/g, "/") || "";
  const syllabusDownloadUrl = syllabusPath
    ? buildApiUrl(`/download?filePath=${encodeURIComponent(syllabusPath)}`)
    : "";

  const toggleClassRoom = (roomId) => {
    setExpandedClassRoomId((currentId) => (currentId === roomId ? null : roomId));
  };

  if (!batch) {
    return (
      <div className="page-shell">
        <div className="page-content empty-state">
          <div className="content-card empty-card">
            <p className="text-lg subtle-text">No batch details found.</p>
            <Link to="/allBatchs" className="primary-btn mt-5">
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="eyebrow">Batch Overview</span>
              <h1 className="section-title mt-5">{batch.name}</h1>
              <p className="section-subtitle mt-4 max-w-2xl">
                {batch.course?.name} with guided sessions, supporting notes, tests,
                and a structured learning flow built around the batch schedule.
              </p>
            </div>
            <div className="surface-panel min-w-[260px] border-white/70 bg-white/95 p-6 text-slate-950 shadow-lg">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-700">Starts</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{batch.startDate}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-panel p-8">
            <h2 className="title-dark text-2xl mb-6">Batch Snapshot</h2>
            <div className="space-y-5 text-slate-700">
              <p className="flex items-center gap-3">
                <FaCalendarAlt className="text-teal-600" />
                <strong>Start Date:</strong> {batch.startDate}
              </p>
              <p className="flex items-center gap-3">
                <FaClock className="text-teal-600" />
                <strong>Time:</strong> {formatTimeRange12Hour(batch.start_time, batch.end_time)}
              </p>
              <p className="flex items-center gap-3">
                <FaUserGraduate className="text-teal-600" />
                <strong>Duration:</strong> {batch.course?.duration} months
              </p>
              <p className="flex items-center gap-3">
                <FaBookOpen className="text-amber-600" />
                <strong>Fee:</strong> Rs {batch.course?.fee}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              {localStorage.getItem("JWT") === null ? (
                <Link to="/login" className="secondary-btn">
                  Enroll Now
                </Link>
              ) : (
                <Link to="/createOrder" state={{ batch }} className="secondary-btn">
                  Enroll Now
                </Link>
              )}
              <button onClick={() => navigate(-1)} className="ghost-btn">
                Go Back
              </button>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-7">
              <h3 className="text-xl font-bold text-slate-950">Classroom Flow</h3>
              {classRooms.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {classRooms.map((room) => {
                    const isExpanded = expandedClassRoomId === room.id;
                    const classes = room?.classes || [];

                    return (
                      <div key={room.id} className="rounded-lg border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => toggleClassRoom(room.id)}
                          className={`flex w-full items-center justify-between gap-4 rounded-lg px-4 py-3 text-left text-base font-bold transition ${
                            isExpanded
                              ? "border-teal-300 bg-teal-50 text-teal-800"
                              : "text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          <span>{room.name}</span>
                          <span className="shrink-0 text-lg" aria-hidden="true">
                            {isExpanded ? "v" : ">"}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-100 px-5 py-4">
                            {classes.length > 0 ? (
                              <div className="space-y-2">
                                {classes.map((classItem) => (
                                  <div key={classItem.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                    <span>{classItem.className || "Class"}</span>
                                    <span aria-hidden="true">&gt;</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="subtle-text text-sm">No classes added yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="subtle-text mt-3">No classrooms added yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="content-card p-6">
              <h3 className="text-2xl font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <FaBookOpen /> Course Details
              </h3>
              <p><strong>Course:</strong> {batch.course?.name}</p>
              <p><strong>Duration:</strong> {batch.course?.duration} months</p>
              <p><strong>Fee:</strong> Rs {batch.course?.fee}</p>

              {syllabusPath && (
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to="/noteViewer"
                    state={{
                      title: `${batch.course?.name || "Course"} Syllabus`,
                      filePath: syllabusPath
                    }}
                    className="primary-btn w-fit"
                  >
                    View Syllabus
                  </Link>
                  <a href={syllabusDownloadUrl} className="ghost-btn w-fit">
                    Download Syllabus
                  </a>
                </div>
              )}
            </div>

            <div className="content-card p-6">
              <h3 className="text-2xl font-semibold text-teal-800 mb-4">Subjects Covered</h3>
              {batch.course?.subjects?.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {batch.course.subjects.map((sub) => (
                    <span key={sub.id} className="pill-tag">
                      {sub.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="subtle-text">No subjects available.</p>
              )}
            </div>

            <div className="content-card p-6">
              <h3 className="text-2xl font-semibold text-teal-800 mb-4 flex items-center gap-2">
                <FaChalkboardTeacher /> Teaching Assignments
              </h3>
              {teachingAssignments.length > 0 ? (
                <div className="space-y-3">
                  <div className="hidden rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white sm:grid sm:grid-cols-2 sm:gap-4">
                    <span>Lecturer</span>
                    <span>Assigned Subject</span>
                  </div>
                  {teachingAssignments.map((item) => (
                    <div key={item.id} className="grid gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 sm:grid-cols-2 sm:items-center sm:gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Lecturer</p>
                        <p className="font-bold text-slate-900">{item.lecturerName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:hidden">Assigned Subject</p>
                        <p className="font-semibold text-slate-700">{item.subjectName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="subtle-text">No teaching assignments yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BatchDetails;
