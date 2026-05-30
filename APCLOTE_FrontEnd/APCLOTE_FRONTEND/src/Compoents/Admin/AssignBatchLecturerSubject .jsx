import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLecturers } from "../../State/LecturerAndUsers/Action";
import { getAllBatchs, getSubjects } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { SyncLoader } from "react-spinners";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { buildUrl } from "../../config/api";

const AssignBatchLecturerSubject = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [assignmentConflict, setAssignmentConflict] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lecturesAndUsers } = useSelector((store) => store);
  const { batchs } = useSelector((store) => store);
  const page = batchs.page;
  const totalPages = batchs.totalPages;

  useEffect(() => {
    dispatch(getLecturers(page));
    dispatch(getAllBatchs(page));
    dispatch(getSubjects());
  }, [dispatch]);

  useEffect(() => {
    setBatches((prev) => [...prev, ...batchs.allBatchs]);
  }, [batchs?.allBatchs]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 2 && page < totalPages) {
      dispatch(getAllBatchs(page + 1));
    }
  };

  const { adding } = useSelector((store) => store);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAssignmentConflict(null);

    try {
      const token = JSON.parse(localStorage.getItem("JWT"));
      const response = await axios.get(
        buildUrl(`/admin/assign?batchId=${selectedBatch}&subjectId=${selectedSubject}&lecturerId=${selectedLecturer}`),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data);
      setSelectedBatch("");
      setSelectedSubject("");
      setSelectedLecturer("");
    } catch (error) {
      if (error.response?.status === 409) {
        setAssignmentConflict(error.response.data);
        toast.error(error.response.data?.message || "This subject is already assigned");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to assign");
    }
  };

  return (
    <div className="page-shell">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Assignment Flow</span>
        <h2 className="title-dark text-3xl">Assign Batch, Subject and Lecturer</h2>

        <div>
          <label className="field-label">Select Batch</label>
          <select value={selectedBatch} onScroll={handleScroll} onChange={(e) => { setSelectedBatch(e.target.value); setAssignmentConflict(null); }} className="field-select min-h-[180px]" size="5" required disabled={adding?.isloading}>
            <option value="">-- Select Batch --</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Select Subject</label>
          <select value={selectedSubject} onChange={(e) => { setSelectedSubject(e.target.value); setAssignmentConflict(null); }} className="field-select" required disabled={adding?.isloading}>
            <option value="">-- Select Subject --</option>
            {batchs?.allBatchs
              ?.filter((batch) => batch.id === Number(selectedBatch))
              ?.flatMap((batch) =>
                batch?.course?.subjects?.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))
              )}
          </select>
        </div>

        <div>
          <label className="field-label">Select Lecturer</label>
          <select value={selectedLecturer} onChange={(e) => setSelectedLecturer(e.target.value)} className="field-select" required disabled={adding?.isloading}>
            <option value="">-- Select Lecturer --</option>
            {lecturesAndUsers?.lecturers?.map((lecturer) => (
              <option key={lecturer.id} value={lecturer.id}>
                {lecturer.user.name} - {lecturer.salary}
              </option>
            ))}
          </select>
        </div>

        {assignmentConflict && (
          <div className="content-card p-5 border-amber-300 bg-amber-50">
            <p className="font-bold text-amber-900">
              {assignmentConflict.message || "This subject is already assigned"}
            </p>
            <button
              type="button"
              className="danger-btn !py-2 !px-4 mt-4"
              onClick={() =>
                navigate(`/lecturerDetails/${assignmentConflict.lecturerId}?assignmentId=${assignmentConflict.assignmentId}`)
              }
            >
              Open Disassign Page
            </button>
          </div>
        )}

        <button type="submit" disabled={adding?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
          <span className="flex items-center justify-center gap-3">
            {adding?.isloading ? <SyncLoader color="white" size={8} /> : null}
            <span>{adding?.isloading ? "Assigning..." : "Assign"}</span>
          </span>
        </button>
      </form>
    </div>
  );
};

export default AssignBatchLecturerSubject;
