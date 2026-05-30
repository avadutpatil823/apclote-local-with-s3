import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { uploadVideo } from "../../State/lecutrersState/Action";
import { SyncLoader } from "react-spinners";
import { getLecturerBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import LinearProgress from "@mui/material/LinearProgress";

const UploadVideo = () => {

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState("");

  const location = useLocation();
  const { batchId, classRoomId, classId } = location.state || {};

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { lecturerWork } = useSelector((store) => store);
  const uploadProgress = lecturerWork?.uploadProgress || 0;
  const isProcessingVideo = lecturerWork?.isloading && uploadProgress >= 100;
  const uploadStatusText = isProcessingVideo
    ? "Processing 360p, 480p, and 720p streams..."
    : "Uploading original video...";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title || !classId) {
      setMessage("Please fill all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("classId", classId);
    formData.append("description", description);
    formData.append("transcript", transcript);

    const success = await dispatch(uploadVideo(formData));
    if (success) {
      await dispatch(getLecturerBatchs());
      navigate("/streamClass", { state: { batchId, classRoomId, classId } });
    }
  };

  return (
    <div className="page-shell">
      <form onSubmit={handleSubmit} className="form-shell surface-panel space-y-5">

        <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">
          Class Content
        </span>

        <h2 className="title-dark text-3xl">Upload Class Video</h2>

        {/* TITLE */}
        <div>
          <label className="field-label">Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="field-input"
            placeholder="Enter video title"
            disabled={lecturerWork?.isloading}
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="field-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="field-input"
            placeholder="Enter video description"
            disabled={lecturerWork?.isloading}
          />
        </div>

        {/* TRANSCRIPT */}
        <div>
          <label className="field-label">Transcript (optional)</label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="field-input"
            placeholder="Paste transcript (for AI understanding)"
            disabled={lecturerWork?.isloading}
          />
        </div>

        {/* FILE */}
        <div>
          <label className="field-label">Select Video File</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="field-file"
            disabled={lecturerWork?.isloading}
          />
        </div>

        {lecturerWork?.isloading && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span className="font-semibold text-slate-700">{uploadStatusText}</span>
              {!isProcessingVideo && <span>{uploadProgress}%</span>}
            </div>
            <LinearProgress
              variant={isProcessingVideo ? "indeterminate" : "determinate"}
              value={isProcessingVideo ? undefined : uploadProgress}
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
            <div className="grid gap-2 text-left text-xs text-slate-500 sm:grid-cols-3">
              <span className={uploadProgress > 0 ? "font-semibold text-teal-700" : ""}>
                1. Upload file
              </span>
              <span className={isProcessingVideo ? "font-semibold text-teal-700" : ""}>
                2. Create qualities
              </span>
              <span className={isProcessingVideo ? "font-semibold text-slate-600" : ""}>
                3. Save stream
              </span>
            </div>
            {isProcessingVideo && (
              <p className="m-0 text-left text-xs text-slate-500">
                This can take a few minutes for large videos. Keep this page open until it completes.
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={lecturerWork?.isloading}
          className="primary-btn w-full disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-3">
            {lecturerWork?.isloading ? <SyncLoader color="white" size={8} /> : null}
            <span>{lecturerWork?.isloading ? "Preparing Stream..." : "Upload Video"}</span>
          </span>
        </button>

        {message && <p className="text-center subtle-text">{message}</p>}

      </form>
    </div>
  );
};

export default UploadVideo;
