import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { buildApiUrl } from "../../config/api";
import { markResourceComplete } from "../../utils/progressApi";

const NoteViewer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { note, title, filePath } = location.state || {};
  const noteTitle = note?.title || title || "Notes";
  const rawPath = note?.filePath || filePath || "";
  const normalizedPath = rawPath ? rawPath.replace(/\\/g, "/") : "";
  const viewerUrl = normalizedPath
    ? `${buildApiUrl(`/view?filePath=${encodeURIComponent(normalizedPath)}`)}#toolbar=0&navpanes=0&scrollbar=1`
    : "";

  React.useEffect(() => {
    if (note?.id) {
      markResourceComplete("NOTE", note.id).catch((error) => {
      });
    }
  }, [note?.id]);

  if (!viewerUrl) {
    return (
      <div className="page-shell">
        <div className="page-content empty-state">
          <div className="content-card empty-card">
            <p className="text-lg subtle-text">No notes file available.</p>
            <button onClick={() => navigate(-1)} className="primary-btn mt-5" type="button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell" onContextMenu={(event) => event.preventDefault()}>
      <style>{`
        @media print {
          .notes-viewer-shell {
            display: none !important;
          }
        }
      `}</style>

      <div className="page-content notes-viewer-shell space-y-5">
        <section className="surface-panel p-5">
          <div className="flex items-center gap-4">
            <Tooltip title="Go Back" placement="right">
              <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: "white", boxShadow: 2 }}>
                <ArrowBackIosNewIcon />
              </IconButton>
            </Tooltip>
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Class Notes</span>
              <h1 className="title-dark mt-3 text-2xl">{noteTitle}</h1>
            </div>
          </div>
        </section>

        <section className="surface-panel overflow-hidden p-0">
          <iframe
            title={noteTitle}
            src={viewerUrl}
            sandbox="allow-same-origin allow-scripts"
            className="block h-[78vh] w-full border-0 bg-white"
          />
        </section>
      </div>
    </div>
  );
};

export default NoteViewer;
