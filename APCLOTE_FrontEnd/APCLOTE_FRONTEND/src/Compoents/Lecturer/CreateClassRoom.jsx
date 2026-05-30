import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createClassrOOM } from "../../State/lecutrersState/Action";
import { getLecturerBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { SyncLoader } from "react-spinners";
import axios from "axios";
import { buildUrl } from "../../config/api";

const CreateClassRoom = () => {
  const location = useLocation();
  const { batchId } = location.state || null;
  const dispatch = useDispatch();
  const { lecturerWork, batchs } = useSelector((store) => store);
  const [classRoomName, setClassRoomName] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assignedSubjects, setAssignedSubjects] = useState([]);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadAssignedSubjects = async () => {
      try {
        const response = await axios.get(buildUrl("/lecturer/getLBS"), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("JWT"))}`
          }
        });

        setAssignedSubjects(response.data || []);
      } catch (error) {
        setMessage("Unable to load your assigned subjects.");
      }
    };

    loadAssignedSubjects();
  }, []);

  const subjectOptions = useMemo(() => {
    const seen = new Set();

    return assignedSubjects
      .filter((item) => item.batchId === batchId && item.subject)
      .filter((item) => {
        if (seen.has(item.subject.id)) {
          return false;
        }

        seen.add(item.subject.id);
        return true;
      })
      .map((item) => item.subject);
  }, [assignedSubjects, batchId]);

  const currentBatch = batchs?.lecturerBatchs?.find((batch) => batch?.id === batchId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classRoomName || !subjectId) {
      setMessage("Please enter a classroom name and select a subject.");
      return;
    }

    const success = await dispatch(createClassrOOM(classRoomName, batchId, subjectId));
    if (success) {
      await dispatch(getLecturerBatchs());
      navigate("/streamBatch", { state: { batchId } });
    }
    setClassRoomName("");
    setSubjectId("");
  };

  return (
    <div className="page-shell">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturer Tools</span>
        <h1 className="title-dark text-3xl">Create ClassRoom</h1>
        <p className="subtle-text">
          Set up a dedicated room for one of your assigned subjects in {currentBatch?.name || "this batch"}.
        </p>
        <input
          type="text"
          placeholder="Enter classroom name"
          value={classRoomName}
          onChange={(e) => setClassRoomName(e.target.value)}
          disabled={lecturerWork?.isloading}
          className="field-input"
        />
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          disabled={lecturerWork?.isloading || subjectOptions.length === 0}
          className="field-input"
        >
          <option value="">Select assigned subject</option>
          {subjectOptions.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        {subjectOptions.length === 0 && (
          <p className="subtle-text text-sm">
            No assigned subjects were found for you in this batch.
          </p>
        )}
        <button type="submit" disabled={lecturerWork?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
          <span className="flex items-center justify-center gap-3">
            {lecturerWork?.isloading ? <SyncLoader color="white" size={8} /> : null}
            <span>{lecturerWork?.isloading ? "Creating ClassRoom..." : "Create"}</span>
          </span>
        </button>
        {message && <p className="text-center subtle-text">{message}</p>}
      </form>
    </div>
  );
};

export default CreateClassRoom;
