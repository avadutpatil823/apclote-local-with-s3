import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { buildUrl } from "../../config/api";
import { askYesNo } from "../User/YesNoModal";

const LecturerDetails = () => {
  const { lecturerId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disassigningId, setDisassigningId] = useState(null);
  const focusAssignmentId = Number(searchParams.get("assignmentId"));

  const token = useMemo(() => JSON.parse(localStorage.getItem("JWT")), []);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildUrl(`/admin/lecturerDetails?lecturerId=${lecturerId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetails(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load lecturer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [lecturerId]);

  const disassign = async (assignment) => {
    const answer = await askYesNo(`Disassign ${details?.user?.name || "this lecturer"} from ${assignment.subjectName}?`);
    if (!answer) return;

    setDisassigningId(assignment.assignmentId);
    try {
      const response = await axios.delete(buildUrl(`/admin/disassignLecturer?assignmentId=${assignment.assignmentId}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data);
      await loadDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to disassign lecturer");
    } finally {
      setDisassigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-content empty-state">
          <div className="content-card empty-card">
            <p className="subtle-text text-lg">Loading lecturer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="page-shell">
        <div className="page-content empty-state">
          <div className="content-card empty-card">
            <p className="subtle-text text-lg">Lecturer details not available.</p>
            <button onClick={() => navigate(-1)} className="primary-btn mt-5" type="button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const assignments = details.assignments || [];
  const activeAssignments = assignments.filter((item) => item.status === "ACTIVE");
  const completedAssignments = assignments.filter((item) => item.status !== "ACTIVE");

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturer Profile</span>
              <h1 className="title-dark mt-4">{details.user?.name || "Lecturer"}</h1>
              <p className="subtle-text mt-3">{details.user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="ghost-btn" to="/allLecturers">
                All Lecturers
              </Link>
              <Link className="primary-btn" to="/assign">
                Assign Batch
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className="content-card p-5">
            <p className="subtle-text">Phone</p>
            <p className="mt-2 font-bold text-slate-900">{details.user?.phone || "N/A"}</p>
          </div>
          <div className="content-card p-5">
            <p className="subtle-text">Address</p>
            <p className="mt-2 font-bold text-slate-900">{details.user?.address || "N/A"}</p>
          </div>
          <div className="content-card p-5">
            <p className="subtle-text">Salary</p>
            <p className="mt-2 font-bold text-slate-900">Rs {details.salary || 0}</p>
          </div>
          <div className="content-card p-5">
            <p className="subtle-text">Date of Joining</p>
            <p className="mt-2 font-bold text-slate-900">{details.dateOfJoining || "N/A"}</p>
          </div>
        </section>

        <AssignmentSection
          title="Active Assignments"
          items={activeAssignments}
          focusAssignmentId={focusAssignmentId}
          disassigningId={disassigningId}
          onDisassign={disassign}
        />

        <AssignmentSection
          title="Completed Assignments"
          items={completedAssignments}
          focusAssignmentId={focusAssignmentId}
          disassigningId={disassigningId}
          onDisassign={disassign}
        />

      </div>
    </div>
  );
};

const AssignmentSection = ({ title, items, focusAssignmentId, disassigningId, onDisassign }) => (
  <section className="surface-panel p-6 md:p-8">
    <h2 className="title-dark text-2xl">{title}</h2>
    <div className="mt-5 grid-auto-fit">
      {items.length > 0 ? (
        items.map((assignment) => {
          const isFocused = assignment.assignmentId === focusAssignmentId;
          const isActive = assignment.status === "ACTIVE";
          const accessRemoved = assignment.status === "ACCESS_REMOVED";
          return (
            <div
              key={assignment.assignmentId}
              className={`content-card p-5 space-y-3 ${isFocused ? "ring-2 ring-amber-400" : ""}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-950">{assignment.batchName}</h3>
                <span className={isActive ? "pill-tag" : "rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600"}>
                  {accessRemoved ? "ACCESS REMOVED" : assignment.status}
                </span>
              </div>
              <p className="subtle-text">{assignment.courseName || "No course"}</p>
              <p className="font-semibold text-slate-800">Subject: {assignment.subjectName}</p>
              <p className="subtle-text">
                {assignment.batchStartDate || "N/A"} to {assignment.batchEndDate || "N/A"}
              </p>
              {accessRemoved && assignment.accessRemovedAt && (
                <p className="subtle-text">Access removed at {assignment.accessRemovedAt}</p>
              )}
              {!accessRemoved && (
                <button
                  type="button"
                  onClick={() => onDisassign(assignment)}
                  disabled={disassigningId === assignment.assignmentId}
                  className="danger-btn !py-2 !px-4 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {disassigningId === assignment.assignmentId ? "Removing..." : isActive ? "Disassign" : "Remove Access"}
                </button>
              )}
            </div>
          );
        })
      ) : (
        <p className="subtle-text">No assignments found.</p>
      )}
    </div>
  </section>
);

export default LecturerDetails;
