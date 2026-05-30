import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { buildUrl } from "../../config/api";
import Pagination from "../User/Pagination";

const BatchStudents = () => {
  const [status, setStatus] = useState("ACTIVE");
  const [batchPage, setBatchPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const [batchData, setBatchData] = useState({ content: [], totalPages: 1 });
  const [studentData, setStudentData] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const token = useMemo(() => JSON.parse(localStorage.getItem("JWT")), []);
  const headers = { Authorization: `Bearer ${token}` };

  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadBatches = async (nextPage = batchPage, append = false) => {
    setLoadingBatches(true);
    try {
      const response = await axios.get(
        buildUrl(`/admin/studentBatchOptions?status=${status}&pageNumber=${nextPage}&pageSize=8`),
        { headers }
      );
      setBatchData((current) => ({
        ...response.data,
        content: append ? [...(current.content || []), ...(response.data.content || [])] : response.data.content || []
      }));
      if (!selectedBatchId && response.data.content?.length) {
        setSelectedBatchId(String(response.data.content[0].id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load batches");
    } finally {
      setLoadingBatches(false);
    }
  };

  const loadStudents = async (nextPage = studentPage, append = false) => {
    if (!selectedBatchId) return;
    setLoadingStudents(true);
    try {
      const response = await axios.get(
        buildUrl(`/admin/studentsByBatch?batchId=${selectedBatchId}&pageNumber=${nextPage}&pageSize=20`),
        { headers }
      );
      setStudentData((current) => ({
        ...response.data,
        content: append ? [...(current?.content || []), ...(response.data.content || [])] : response.data.content || []
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    setSelectedBatchId("");
    setStudentData(null);
    setBatchPage(1);
    setStudentPage(1);
  }, [status]);

  useEffect(() => {
    loadBatches(batchPage, batchPage > 1);
  }, [status, batchPage]);

  useEffect(() => {
    setStudentPage(1);
  }, [selectedBatchId]);

  useEffect(() => {
    loadStudents(studentPage, studentPage > 1);
  }, [selectedBatchId, studentPage]);

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Batch Students</span>
              <h1 className="title-dark mt-4">Students By Batch</h1>
            </div>
            <div className="grid w-full grid-cols-1 rounded-2xl border border-stone-200 bg-white p-1 sm:w-auto sm:grid-cols-2">
              {["ACTIVE", "COMPLETED"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStatus(item)}
                  className={`rounded-xl px-4 py-2 font-bold ${status === item ? "bg-teal-700 text-white" : "text-slate-700"}`}
                >
                  {item === "ACTIVE" ? "Active Batches" : "Completed Batches"}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <h2 className="title-dark text-2xl">Select Batch</h2>
          <div className="mt-5 grid-auto-fit">
            {batchData.content?.map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => setSelectedBatchId(String(batch.id))}
                className={`content-card p-5 text-left ${String(batch.id) === selectedBatchId ? "ring-2 ring-teal-500" : ""}`}
              >
                <p className="text-lg font-bold text-slate-950">{batch.name}</p>
                <p className="subtle-text mt-2">{batch.courseName || "No course"}</p>
                <p className="subtle-text mt-2">{batch.startDate || "N/A"} to {batch.endDate || "N/A"}</p>
              </button>
            ))}
          </div>
          <Pagination currentPage={batchPage} totalPages={batchData.totalPages || 1} onPageChange={setBatchPage} loading={loadingBatches} label="batches" />
        </section>

        <section className="surface-panel p-6 md:p-8">
          <h2 className="title-dark text-2xl">{studentData?.batch?.name || "Students"}</h2>
          {studentData?.content?.length > 0 ? (
            <div className="table-shell responsive-table mt-5">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.content.map((student) => (
                    <tr key={student.id}>
                      <td data-label="ID">{student.id}</td>
                      <td data-label="Name">{student.user?.name}</td>
                      <td data-label="Email">{student.user?.email}</td>
                      <td data-label="Phone">{student.user?.phone}</td>
                      <td data-label="Status">{student.active === false ? "DEACTIVATED" : "ACTIVE"}</td>
                      <td data-label="Action">
                        <Link className="primary-btn !py-2 !px-4" to={`/studentDetails/${student.id}`}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="subtle-text mt-5">No students found for this batch.</p>
          )}
          <Pagination currentPage={studentPage} totalPages={studentData?.totalPages || 1} onPageChange={setStudentPage} loading={loadingStudents} label="students" />
        </section>
      </div>
    </div>
  );
};

export default BatchStudents;
