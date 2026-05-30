import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { getLecturers } from "../../State/LecturerAndUsers/Action";
import { buildUrl } from "../../config/api";

const UpdateLecturer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch=useDispatch()

  // Lecturer object coming from location.state
  const lecturerFromState = location.state?.lecturer;

  const [lecturer, setLecturer] = useState({
    id: "",
    user: { name: "", email: "" }, // nested user object
    dateOfJoining: "",
    salary: "",
    batches: [],
    lecturerBatchSubjects: [],
  });

  useEffect(() => {
    if (lecturerFromState) {
      setLecturer({
        ...lecturerFromState,
        dateOfJoining: lecturerFromState.dateOfJoining || "",
        salary: lecturerFromState.salary || "",
      });
    }
  }, [lecturerFromState]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLecturer({ ...lecturer, [name]: value });
  };

  // Submit updated lecturer
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sending entire lecturer object to backend
      const token = JSON.parse(localStorage.getItem("JWT"));
      await axios.post(
        buildUrl("/admin/updateLecturer"),
        lecturer,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Lecturer updated successfully");
      dispatch(getLecturers())
      navigate("/allLecturers"); // redirect to lecturer list page
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page-shell">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturer Profile</span>
        <h2 className="title-dark text-3xl">Update Lecturer</h2>

        {/* Name - not editable */}
        <label className="field-label">Name</label>
        <input
          type="text"
          value={lecturer.user.name || ""}
          disabled
          className="field-input bg-slate-100"
        />

        {/* Date of Joining */}
        <label className="field-label">Date of Joining</label>
        <input
          type="date"
          name="dateOfJoining"
          value={lecturer.dateOfJoining || ""}
          onChange={handleChange}
          className="field-input"
          required
        />

        {/* Salary */}
        <label className="field-label">Salary</label>
        <input
          type="number"
          name="salary"
          value={lecturer.salary || ""}
          onChange={handleChange}
          className="field-input"
          required
        />

        {/* Submit */}
        <button
          type="submit"
          className="primary-btn w-full"
        >
          Update Lecturer
        </button>
      </form>
    </div>
  );
};

export default UpdateLecturer;
