import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLecturers, getSearchedLecturers } from "../../State/LecturerAndUsers/Action";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { SyncLoader } from "react-spinners";
import Pagination from "../User/Pagination";
import { askYesNo } from "../User/YesNoModal";
import { buildUrl } from "../../config/api";

const AllLecturersTable = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lecturesAndUsers } = useSelector((store) => store);
  const [searchKey, setSearchKey] = useState("");
  const [deletingLecturerId, setDeletingLecturerId] = useState(null);

  const page = lecturesAndUsers.page;
  const totalPages = lecturesAndUsers.totalPages;

  useEffect(() => {
    dispatch(getLecturers(1));
  }, [dispatch]);

  const onPageChane = (num) => {
    return searchKey.trim().length > 0
      ? dispatch(getSearchedLecturers(searchKey, num, true))
      : dispatch(getLecturers(num, true));
  };

  useEffect(() => {
    if (searchKey.trim().length > 0) {
      dispatch(getSearchedLecturers(searchKey, 1));
    } else {
      dispatch(getLecturers(1));
    }
  }, [searchKey]);

  const deleteLecturer = async (lecturerId) => {
    try {
      const answer = await askYesNo("Are you sure you want to delete this lecturer?");
      if (answer) {
        setDeletingLecturerId(lecturerId);
        const token = JSON.parse(localStorage.getItem("JWT"));
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        const detailsResponse = await axios.get(buildUrl(`/admin/lecturerDetails?lecturerId=${lecturerId}`), { headers });
        const activeAssignments = (detailsResponse.data?.assignments || []).filter((item) => item.status === "ACTIVE");

        if (activeAssignments.length > 0) {
          const assignmentNames = activeAssignments
            .map((item) => `${item.batchName || "active batch"}${item.subjectName ? ` (${item.subjectName})` : ""}`)
            .join(", ");
          toast.error(`Lecturer is assigned to active batch: ${assignmentNames}. First disassign the lecturer, then delete.`);
          return;
        }

        const response = await axios.get(
          buildUrl(`/admin/deleteLecturer?lecturerId=${lecturerId}`),
          { headers }
        );
        toast.success(response.data);
        dispatch(getLecturers(0));
        navigate("/allLecturers");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Deletion failed");
    } finally {
      setDeletingLecturerId(null);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturers</span>
              <h1 className="title-dark mt-4">All Lecturers</h1>
            </div>
            <div className="w-full md:w-80">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                className="field-input"
              />
            </div>
          </div>
        </section>

        {lecturesAndUsers?.lecturers.length > 0 ? (
          <div className="table-shell responsive-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Salary</th>
                  <th>Date of Joining</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lecturesAndUsers?.lecturers.map((lec) => (
                  <tr key={lec.id}>
                    <td data-label="ID">{lec.id}</td>
                    <td data-label="Name">{lec.user?.name}</td>
                    <td data-label="Salary">Rs {lec.salary}</td>
                    <td data-label="Joining">{lec.dateOfJoining}</td>
                    <td data-label="Phone">{lec.user?.phono}</td>
                    <td data-label="Address">{lec.user?.address}</td>
                    <td data-label="Email">{lec.user?.email}</td>
                    <td data-label="Action">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link className="secondary-btn !py-2 !px-4" to={`/lecturerDetails/${lec.id}`}>
                          Details
                        </Link>
                        <Link className="primary-btn !py-2 !px-4" to="/updateLecturer" state={{ lecturer: lec }}>
                          Update
                        </Link>
                        <button
                          className="danger-btn !py-2 !px-4 disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={() => deleteLecturer(lec.id)}
                          disabled={deletingLecturerId === lec.id}
                        >
                          {deletingLecturerId === lec.id ? <SyncLoader color="white" size={6} /> : null}
                          {deletingLecturerId === lec.id ? "Checking..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="content-card empty-card">
              <p className="subtle-text text-lg">No lecturers found.</p>
            </div>
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChane} loading={lecturesAndUsers.isloading} label="lecturers" />
      </div>
    </div>
  );
};

export default AllLecturersTable;
