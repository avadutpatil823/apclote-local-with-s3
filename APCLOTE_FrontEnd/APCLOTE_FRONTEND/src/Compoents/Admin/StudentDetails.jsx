import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";
import { buildUrl } from "../../config/api";
import { askYesNo } from "../User/YesNoModal";

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const token = useMemo(() => JSON.parse(localStorage.getItem("JWT")), []);

  const headers = { Authorization: `Bearer ${token}` };

  const confirmAction = (message) => askYesNo(message);

  const loadStudent = async () => {
    setLoading(true);
    try {
      const response = await axios.get(buildUrl(`/admin/studentDetails?studentId=${studentId}`), { headers });
      setStudent(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const updateStudentStatus = async (active) => {
    const confirmed = await confirmAction(
      active
        ? `Activate ${student?.user?.name || "this student"}?`
        : `Deactivate ${student?.user?.name || "this student"}?`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await axios.post(buildUrl(`/admin/studentStatus?studentId=${studentId}&active=${active}`), null, { headers });
      toast.success(response.data);
      await loadStudent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
    } finally {
      setBusy(false);
    }
  };

  const updateBatchStatus = async (batchId, active) => {
    const batch = student?.batches?.find((item) => item.id === batchId);
    const confirmed = await confirmAction(
      active
        ? `Activate batch access for ${batch?.name || "this batch"}?`
        : `Deactivate ${student?.user?.name || "this student"} from ${batch?.name || "this batch"}?`
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await axios.post(
        buildUrl(`/admin/studentBatchStatus?studentId=${studentId}&batchId=${batchId}&active=${active}`),
        null,
        { headers }
      );
      toast.success(response.data);
      await loadStudent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update batch access");
    } finally {
      setBusy(false);
    }
  };

  const softDelete = async () => {
    const confirmed = await confirmAction(`Delete ${student?.user?.name || "this student"}? This will deactivate the student account.`);
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await axios.delete(buildUrl(`/admin/softDeleteStudent?studentId=${studentId}`), { headers });
      toast.success(response.data);
      navigate("/allStudents");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="page-content empty-state">
          <div className="content-card empty-card">
            <p className="subtle-text text-lg">Loading student details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="page-shell">
        <div className="page-content empty-state">
          <div className="content-card empty-card">
            <p className="subtle-text text-lg">Student details not available.</p>
            <button className="primary-btn mt-5" onClick={() => navigate(-1)} type="button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = student.active !== false;

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Student Profile</span>
              <h1 className="title-dark mt-4">{student.user?.name || "Student"}</h1>
              <p className="subtle-text mt-3">{student.user?.email}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="ghost-btn" to="/allStudents">All Students</Link>
              <Link className="primary-btn" to={`/adminStudentDashboard/${student.id}`}>Open Dashboard</Link>
              <button className="secondary-btn" disabled={busy} onClick={() => updateStudentStatus(!isActive)} type="button">
                {busy ? <SyncLoader color="white" size={6} /> : null}
                {isActive ? "Deactivate Student" : "Activate Student"}
              </button>
              <button className="danger-btn" disabled={busy} onClick={softDelete} type="button">
                {busy ? <SyncLoader color="white" size={6} /> : null}
                Delete
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard label="Status" value={isActive ? "ACTIVE" : "DEACTIVATED"} />
          <InfoCard label="Phone" value={student.user?.phone || "N/A"} />
          <InfoCard label="Address" value={student.user?.address || "N/A"} />
          <InfoCard label="Member Since" value={student.user?.memberSince || "N/A"} />
        </section>

        <section className="surface-panel p-6 md:p-8">
          <h2 className="title-dark text-2xl">Batch Access</h2>
          <div className="mt-5 grid-auto-fit">
            {student.batches?.length > 0 ? (
              student.batches.map((batch) => (
                <div key={batch.id} className="content-card p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-slate-950">{batch.name}</h3>
                    <span className={batch.status === "ACTIVE" ? "pill-tag" : "rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600"}>
                      {batch.status}
                    </span>
                  </div>
                  <p className="subtle-text">{batch.courseName || "No course"}</p>
                  <p className="subtle-text">{batch.startDate || "N/A"} to {batch.endDate || "N/A"}</p>
                  <button className="danger-btn !py-2 !px-4" disabled={busy} onClick={() => updateBatchStatus(batch.id, false)} type="button">
                    {busy ? <SyncLoader color="white" size={6} /> : null}
                    Deactivate From Batch
                  </button>
                </div>
              ))
            ) : (
              <p className="subtle-text">No active batch access found.</p>
            )}
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <h2 className="title-dark text-2xl">Purchase Orders</h2>
          <div className="mt-5 grid-auto-fit">
            {student.purchaseOrders?.length > 0 ? (
              student.purchaseOrders.map((order) => (
                <div key={order.id} className="content-card p-5 space-y-2">
                  <p className="font-bold text-slate-950">{order.batch?.name || "No batch"}</p>
                  <p className="subtle-text">Status: {order.status}</p>
                  <p className="subtle-text">Fee: Rs {order.fee || 0}</p>
                  <p className="subtle-text">Purchased: {order.purchaseDate || "N/A"}</p>
                </div>
              ))
            ) : (
              <p className="subtle-text">No purchase orders found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="content-card p-5">
    <p className="subtle-text">{label}</p>
    <p className="mt-2 font-bold text-slate-900">{value}</p>
  </div>
);

export default StudentDetails;
