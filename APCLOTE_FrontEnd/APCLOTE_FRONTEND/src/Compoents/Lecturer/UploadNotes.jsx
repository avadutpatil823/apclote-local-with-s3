import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { uploadNotes } from "../../State/lecutrersState/Action";
import { getLecturerBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { SyncLoader } from "react-spinners";
import LinearProgress from "@mui/material/LinearProgress";

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const { batchId, classRoomId, classId } = location.state || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lecturerWork } = useSelector((store) => store);
  const uploadProgress = lecturerWork?.uploadProgress || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !classId) {
      setMessage("Please fill all fields and select a notes file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    const success = await dispatch(uploadNotes(title, classId, formData));
    if (success) {
      await dispatch(getLecturerBatchs());
      navigate("/streamClass", { state: { batchId, classRoomId, classId } });
    }
  };

  return (
    <div className="page-shell">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">
        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Class Content</span>
        <h2 className="title-dark text-3xl">Upload Class Notes</h2>
        <div>
          <label className="field-label">Notes Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="field-input" placeholder="Enter notes title" disabled={lecturerWork?.isloading} />
        </div>
        <div>
          <label className="field-label">Select Notes File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="field-file"
            disabled={lecturerWork?.isloading}
          />
        </div>

        {lecturerWork?.isloading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Uploading notes...</span>
              <span>{uploadProgress}%</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 10,
                borderRadius: 999,
                backgroundColor: "#e7e5e4",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)",
                },
              }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={lecturerWork?.isloading}
          className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-3">
            {lecturerWork?.isloading ? <SyncLoader color="white" size={8} /> : null}
            <span>{lecturerWork?.isloading ? "Uploading Notes..." : "Upload Notes"}</span>
          </span>
        </button>
        {message && <p className="text-center subtle-text">{message}</p>}
      </form>
    </div>
  );
};

export default UploadNotes;
