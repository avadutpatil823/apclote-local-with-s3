import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBatchs, getCourses } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { createBatch, updateBatch } from "../../State/AddingOrCreating/Action";
import { SyncLoader } from "react-spinners";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateBatchForm = () => {
  const [batch, setBatch] = useState({
    name: "",
    course: null,
    startDate: "",
    start_time: "",
    end_time: "",
  });

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [editingBatch, setEditingBatch] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { batchs } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getCourses());
    dispatch(getAllBatchs(1));
  }, [dispatch]);

  useEffect(() => {
    const batchToEdit = location.state?.batch;
    if (batchToEdit?.id) {
      startBatchUpdate(batchToEdit, false);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBatch({ ...batch, [name]: value });
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selectedCourse = batchs?.coursess?.find((c) => c.id === parseInt(courseId));
    setSelectedCourseId(courseId);
    setBatch({ ...batch, course: selectedCourse });
  };

  const { adding } = useSelector((store) => store);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const duplicate = (batchs?.allBatchs || []).find(
      (item) =>
        item?.id !== editingBatch?.id &&
        item?.name?.trim().toLowerCase() === batch.name.trim().toLowerCase() &&
        item?.course?.id === batch.course?.id &&
        item?.startDate === batch.startDate &&
        item?.start_time === batch.start_time &&
        item?.end_time === batch.end_time
    );

    if (duplicate) {
      toast.error(`Batch already exists with these details: ${duplicate.name}, ${duplicate.course?.name || "No course"}, ${duplicate.startDate}`);
      return;
    }

    const success = editingBatch
      ? await dispatch(updateBatch({ ...batch, name: batch.name.trim(), id: editingBatch.id }))
      : await dispatch(createBatch({ ...batch, name: batch.name.trim() }));
    if (success) {
      setBatch({
        name: "",
        course: null,
        startDate: "",
        start_time: "",
        end_time: "",
      });
      setSelectedCourseId("");
      setEditingBatch(null);
      dispatch(getAllBatchs(1));
      navigate("/adminCatalog", { state: { tab: "batches" } });
    }
  };

  const startBatchUpdate = (item, shouldScroll = true) => {
    setEditingBatch(item);
    setSelectedCourseId(String(item.course?.id || ""));
    setBatch({
      id: item.id,
      name: item.name || "",
      course: item.course || null,
      startDate: item.startDate || "",
      start_time: item.start_time || "",
      end_time: item.end_time || "",
    });
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Batch Setup</span>
        <h2 className="title-dark text-3xl">{editingBatch ? "Update Batch" : "Create Batch"}</h2>
        <div>
          <label className="field-label">Batch Name</label>
          <input type="text" name="name" value={batch.name} onChange={handleChange} className="field-input" placeholder="Enter batch name" required disabled={adding?.isloading} />
        </div>
        <div>
          <label className="field-label">Select Course</label>
          <select value={selectedCourseId} onChange={handleCourseChange} className="field-select" required disabled={adding?.isloading}>
            <option value="">-- Select Course --</option>
            {batchs?.coursess?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} (Fee: {course.fee})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="field-label">Start Date</label>
            <input type="date" name="startDate" value={batch.startDate} onChange={handleChange} className="field-input" required disabled={adding?.isloading} />
          </div>
          <div>
            <label className="field-label">Start Time</label>
            <input type="time" name="start_time" value={batch.start_time} onChange={handleChange} className="field-input" required disabled={adding?.isloading} />
          </div>
          <div>
            <label className="field-label">End Time</label>
            <input type="time" name="end_time" value={batch.end_time} onChange={handleChange} className="field-input" required disabled={adding?.isloading} />
          </div>
        </div>
        <button type="submit" disabled={adding?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
          <span className="flex items-center justify-center gap-3">
            {adding?.isloading ? <SyncLoader color="white" size={8} /> : null}
            <span>{adding?.isloading ? "Saving Batch..." : editingBatch ? "Update Batch" : "Create Batch"}</span>
          </span>
        </button>
        {editingBatch && (
          <button
            type="button"
            className="ghost-btn w-full"
            onClick={() => {
              setEditingBatch(null);
              setBatch({ name: "", course: null, startDate: "", start_time: "", end_time: "" });
              setSelectedCourseId("");
            }}
            disabled={adding?.isloading}
          >
            Cancel Update
          </button>
        )}
        <Link to="/adminCatalog" state={{ tab: "batches" }} className="ghost-btn w-full">
          View Existing Batches
        </Link>
      </form>
      </div>
    </div>
  );
};

export default CreateBatchForm;
