import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCourses, getSubjects } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { createCourse, updateCourse } from "../../State/AddingOrCreating/Action";
import { toast } from "react-toastify";
import { SyncLoader } from "react-spinners";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CreateCourseForm2 = () => {
  const [course, setCourse] = useState({
    name: "",
    duration: "",
    fee: "",
    subjects: [],
  });

  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { batchs, adding } = useSelector((store) => store);

  useEffect(() => {
    dispatch(getSubjects());
    dispatch(getCourses());
  }, [dispatch]);

  useEffect(() => {
    const courseToEdit = location.state?.course;
    if (courseToEdit?.id && batchs?.subjects?.length) {
      startCourseUpdate(courseToEdit, false);
    }
  }, [location.state, batchs?.subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleSubjectsChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    const newSelected = [...new Set([...selectedSubjects, ...selectedOptions])];
    setSelectedSubjects(newSelected);
    const selectedObjs = batchs.subjects.filter((subj) =>
      newSelected.includes(subj.id)
    );
    setCourse({ ...course, subjects: selectedObjs });
  };

  const handleRemoveSubject = (id) => {
    const updatedSubjects = selectedSubjects.filter((subjId) => subjId !== id);
    setSelectedSubjects(updatedSubjects);
    const selectedObjs = batchs.subjects.filter((subj) =>
      updatedSubjects.includes(subj.id)
    );
    setCourse({ ...course, subjects: selectedObjs });
  };

  const handleFileChange = (e) => {
    setSyllabusFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedSubjectIds = [...selectedSubjects].sort((first, second) => first - second);
    const duplicate = (batchs?.coursess || []).find((item) => {
      if (item?.id === editingCourse?.id) {
        return false;
      }

      const itemSubjectIds = (item?.subjects || [])
        .map((courseSubject) => {
          if (courseSubject?.id) {
            return courseSubject.id;
          }

          return (batchs.subjects || []).find((subjectItem) => subjectItem.name === courseSubject?.name)?.id;
        })
        .filter(Boolean)
        .sort((first, second) => first - second);

      return (
        item?.name?.trim().toLowerCase() === course.name.trim().toLowerCase() &&
        String(item?.duration) === String(course.duration) &&
        String(item?.fee) === String(course.fee) &&
        JSON.stringify(itemSubjectIds) === JSON.stringify(selectedSubjectIds)
      );
    });

    if (duplicate) {
      toast.error(`Course already exists with these details: ${duplicate.name}, ${duplicate.duration} months, fee ${duplicate.fee}`);
      return;
    }

    const formData = new FormData();
    const courseData = {
      id: course.id,
      name: course.name,
      duration: course.duration,
      fee: course.fee,
      subjects: course.subjects,
    };
    formData.append("course", new Blob([JSON.stringify(courseData)], { type: "application/json" }));

    if (syllabusFile) {
      formData.append("file", syllabusFile);
    }

    if (!syllabusFile && !editingCourse) {
      toast.error("No file selected!");
      return;
    }

    const success = editingCourse
      ? await dispatch(updateCourse(formData))
      : await dispatch(createCourse(formData));
    if (success) {
      setCourse({ name: "", duration: "", fee: "", subjects: [] });
      setSelectedSubjects([]);
      setSyllabusFile(null);
      setEditingCourse(null);
      dispatch(getCourses());
      navigate("/adminCatalog", { state: { tab: "courses" } });
    }
  };

  const startCourseUpdate = (item, shouldScroll = true) => {
    const subjectIds = (item.subjects || [])
      .map((courseSubject) => (batchs.subjects || []).find((subject) => subject.name === courseSubject.name)?.id)
      .filter(Boolean);
    const selectedObjs = (batchs.subjects || []).filter((subject) => subjectIds.includes(subject.id));

    setEditingCourse(item);
    setSelectedSubjects(subjectIds);
    setSyllabusFile(null);
    setCourse({
      id: item.id,
      name: item.name || "",
      duration: item.duration || "",
      fee: item.fee || "",
      subjects: selectedObjs
    });
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5" encType="multipart/form-data">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Course Setup</span>
        <h2 className="title-dark text-3xl">{editingCourse ? "Update Course" : "Create Course"}</h2>
        <div>
          <label className="field-label">Course Name</label>
          <input type="text" name="name" value={course.name} onChange={handleChange} className="field-input" placeholder="Enter course name" required disabled={adding?.isloading} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Duration (months)</label>
            <input type="number" name="duration" value={course.duration} onChange={handleChange} className="field-input" placeholder="Enter duration" required disabled={adding?.isloading} />
          </div>
          <div>
            <label className="field-label">Fee</label>
            <input type="number" name="fee" value={course.fee} onChange={handleChange} className="field-input" placeholder="Enter fee" required disabled={adding?.isloading} />
          </div>
        </div>
        <div>
          <label className="field-label">Upload Syllabus File</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="field-file" required={!editingCourse} disabled={adding?.isloading} />
          {syllabusFile && <p className="subtle-text mt-2">Selected file: {syllabusFile.name}</p>}
          {editingCourse && !syllabusFile && <p className="subtle-text mt-2">Leave empty to keep the current syllabus file.</p>}
        </div>

        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {batchs.subjects
              .filter((subj) => selectedSubjects.includes(subj.id))
              .map((subj) => (
                <span key={subj.id} className="pill-tag">
                  {subj.name}
                  <button type="button" className="font-black" onClick={() => handleRemoveSubject(subj.id)} disabled={adding?.isloading}>
                    x
                  </button>
                </span>
              ))}
          </div>
        )}

        <div>
          <label className="field-label">Select Subjects</label>
          <select multiple value={selectedSubjects.map(String)} onChange={handleSubjectsChange} className="field-select min-h-[180px]" disabled={adding?.isloading}>
            {batchs.subjects.map((subj) => (
              <option key={subj.id} value={subj.id}>
                {subj.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={adding?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
          <span className="flex items-center justify-center gap-3">
            {adding?.isloading ? <SyncLoader color="white" size={8} /> : null}
            <span>{adding?.isloading ? "Saving Course..." : editingCourse ? "Update Course" : "Create Course"}</span>
          </span>
        </button>
        {editingCourse && (
          <button
            type="button"
            className="ghost-btn w-full"
            onClick={() => {
              setEditingCourse(null);
              setCourse({ name: "", duration: "", fee: "", subjects: [] });
              setSelectedSubjects([]);
              setSyllabusFile(null);
            }}
            disabled={adding?.isloading}
          >
            Cancel Update
          </button>
        )}
        <Link to="/adminCatalog" state={{ tab: "courses" }} className="ghost-btn w-full">
          View Existing Courses
        </Link>
      </form>
      </div>
    </div>
  );
};

export default CreateCourseForm2;
