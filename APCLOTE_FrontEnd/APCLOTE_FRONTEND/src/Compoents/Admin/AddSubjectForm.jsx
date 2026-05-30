import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSubject, updateSubject } from "../../State/AddingOrCreating/Action";
import { SyncLoader } from "react-spinners";
import { getSubjects } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AddSubjectForm = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { adding } = useSelector((store) => store);
  const { batchs } = useSelector((store) => store);
  const [subject, setSubject] = useState({ name: "" });
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    dispatch(getSubjects());
  }, [dispatch]);

  useEffect(() => {
    const subjectToEdit = location.state?.subject;
    if (subjectToEdit?.id) {
      setEditingSubject(subjectToEdit);
      setSubject({ name: subjectToEdit.name || "" });
    }
  }, [location.state]);

  const handleChange = (e) => {
    setSubject({ ...subject, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedName = subject.name.trim().toLowerCase();
    const duplicate = (batchs?.subjects || []).find(
      (item) => item?.id !== editingSubject?.id && item?.name?.trim().toLowerCase() === normalizedName
    );

    if (duplicate) {
      toast.error(`Subject already exists with this name: ${duplicate.name}`);
      return;
    }

    const success = editingSubject
      ? await dispatch(updateSubject({ ...subject, name: subject.name.trim(), id: editingSubject.id }))
      : await dispatch(addSubject({ ...subject, name: subject.name.trim() }));
    if (success) {
      setSubject({ name: "" });
      setEditingSubject(null);
      dispatch(getSubjects());
      navigate("/adminCatalog", { state: { tab: "subjects" } });
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Admin</span>
          <h2 className="title-dark text-3xl">{editingSubject ? "Update Subject" : "Add Subject"}</h2>
          <p className="subtle-text">Create a subject so it can be attached to courses and later assigned within batches.</p>
          <div>
            <label className="field-label">Subject Name</label>
            <input type="text" name="name" value={subject.name} onChange={handleChange} className="field-input" placeholder="Enter subject name" required disabled={adding?.isloading} />
          </div>
          <button type="submit" disabled={adding?.isloading} className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed">
            <span className="flex items-center justify-center gap-3">
              {adding?.isloading ? <SyncLoader color="white" size={8} /> : null}
              <span>{adding?.isloading ? "Saving Subject..." : editingSubject ? "Update Subject" : "Add Subject"}</span>
            </span>
          </button>
          {editingSubject && (
            <button
              type="button"
              className="ghost-btn w-full"
              onClick={() => {
                setEditingSubject(null);
                setSubject({ name: "" });
              }}
              disabled={adding?.isloading}
            >
              Cancel Update
            </button>
          )}
          <Link to="/adminCatalog" state={{ tab: "subjects" }} className="ghost-btn w-full">
            View Existing Subjects
          </Link>
        </form>
      </div>
    </div>
  );
};

export default AddSubjectForm;
