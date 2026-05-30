import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { FiPlus } from "react-icons/fi";
import { AdminDeleteButton, LecturerDeleteRequestButton } from "../User/DeleteResourceControls";
import { getUser } from "../../State/Auth/Action";
import Pagination from "../User/Pagination";
import { useWorkspaceRefresh } from "../../hooks/useWorkspaceRefresh";
import { formatDateTime12Hour } from "../../utils/timeFormat";

const getVisibleBatchesForRole = (batchs, userRole) => {
  if (userRole === "ROLE_LECTURER") {
    return batchs?.lecturerBatchs || [];
  }

  if (userRole === "ROLE_USER") {
    return batchs?.myBatchs || [];
  }

  if (userRole === "ROLE_ADMIN") {
    return batchs?.allBatchs || [];
  }

  return [];
};

const StreamBatch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeBatchId = searchParams.get("batchId");
  const { batchId: stateBatchId } = location.state || {};
  const batchId = stateBatchId || (routeBatchId ? Number(routeBatchId) : null);
  const { batchs, auth } = useSelector((store) => store);
  const userRole = auth?.user?.role || JSON.parse(localStorage.getItem("USER"))?.role;
  const visibleBatches = getVisibleBatchesForRole(batchs, userRole);
  const currentBatch = visibleBatches.find((batch) => batch?.id === batchId);
  const classRooms = currentBatch?.classRooms || [];
  const [classroomSearch, setClassroomSearch] = React.useState("");
  const [classroomPage, setClassroomPage] = React.useState(1);
  const classroomPageSize = 9;
  const filteredClassRooms = classRooms.filter((room) =>
    `${room?.name || ""} ${room?.subject?.name || ""}`.toLowerCase().includes(classroomSearch.trim().toLowerCase())
  );
  const classroomTotalPages = Math.max(Math.ceil(filteredClassRooms.length / classroomPageSize), 1);
  const visibleClassRooms = filteredClassRooms.slice(0, classroomPage * classroomPageSize);
  const batchName = currentBatch?.name || "Batch";
  const formatCreatedAt = (value) => {
    if (!value) {
      return "Not available";
    }

    return formatDateTime12Hour(value);
  };

  React.useEffect(() => {
    if (localStorage.getItem("JWT") && !userRole) {
      dispatch(getUser());
    }
  }, [dispatch, userRole]);

  const refreshWorkspace = useWorkspaceRefresh(dispatch, userRole);

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Tooltip title="Go Back" placement="right">
                <IconButton onClick={() => navigate(-1)} sx={{ backgroundColor: "white", boxShadow: 2 }}>
                  <ArrowBackIosNewIcon />
                </IconButton>
              </Tooltip>
              <div>
                <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Batch Workspace</span>
                <h1 className="title-dark mt-3">{batchName}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {userRole === "ROLE_LECTURER" && (
                <Link to="/createClassRoom" state={{ batchId }} className="primary-btn w-fit">
                  <FiPlus /> Add ClassRoom
                </Link>
              )}
              {userRole === "ROLE_ADMIN" && currentBatch && (
                <AdminDeleteButton
                  resource={{ type: "batch", id: currentBatch.id, name: currentBatch.name, label: "batch" }}
                  onDeleted={() => {
                    refreshWorkspace();
                    navigate("/createBatch");
                  }}
                  className="!py-2 !px-4"
                />
              )}
            </div>
          </div>
        </section>

        <section className="surface-panel p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold text-slate-950">Classrooms</h2>
            <input
              className="field-input md:max-w-xs"
              value={classroomSearch}
              onChange={(event) => {
                setClassroomSearch(event.target.value);
                setClassroomPage(1);
              }}
              placeholder="Search classrooms"
            />
          </div>
        </section>

        <div className="grid-auto-fit">
          {visibleClassRooms.length > 0 ? (
            visibleClassRooms.map((room) => (
              <div key={room.id} className="dashboard-card p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">{room.name}</h2>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><strong>Subject:</strong> {room?.subject?.name || "Not assigned"}</p>
                  <p><strong>Created By:</strong> {room?.createdByName || "Not available"}</p>
                  <p><strong>Created At:</strong> {formatCreatedAt(room?.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/streamClassRoom" state={{ batchId, classRoomId: room?.id }} className="primary-btn w-fit">
                    View
                  </Link>
                  {userRole === "ROLE_ADMIN" && (
                    <AdminDeleteButton
                      resource={{ type: "classRoom", id: room.id, name: room.name, label: "classroom" }}
                      onDeleted={refreshWorkspace}
                      className="!py-2 !px-4"
                    />
                  )}
                  {userRole === "ROLE_LECTURER" && (
                    <LecturerDeleteRequestButton
                      resource={{ type: "classRoom", id: room.id, name: room.name, label: "classroom" }}
                      target={{ batchId, classRoomId: room.id }}
                      className="!py-2 !px-4"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state col-span-full">
              <div className="content-card empty-card">
                <p className="subtle-text">No classrooms found for this batch.</p>
                <Link to="/" className="primary-btn mt-5">Back To Home</Link>
              </div>
            </div>
          )}
        </div>
        <Pagination
          currentPage={classroomPage}
          totalPages={classroomTotalPages}
          onPageChange={(nextPage) => setClassroomPage(nextPage)}
          label="classrooms"
        />
      </div>
    </div>
  );
};

export default StreamBatch;
