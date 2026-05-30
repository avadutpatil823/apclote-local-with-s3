import React from "react";
import { FiPlus } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { AdminDeleteButton, LecturerDeleteRequestButton } from "../User/DeleteResourceControls";
import { getUser } from "../../State/Auth/Action";
import { useWorkspaceRefresh } from "../../hooks/useWorkspaceRefresh";
import { fetchStudentDashboard } from "../../utils/progressApi";
import { formatDateTime12Hour, formatTimeRange12Hour } from "../../utils/timeFormat";
import ProgressBar from "../User/ProgressBar";

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

const StreamClassRoom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { batchId: stateBatchId, classRoomId: stateClassRoomId } = location.state || {};
  const batchId = stateBatchId || (searchParams.get("batchId") ? Number(searchParams.get("batchId")) : null);
  const classRoomId = stateClassRoomId || (searchParams.get("classRoomId") ? Number(searchParams.get("classRoomId")) : null);
  const { batchs, auth } = useSelector((store) => store);
  const userRole = auth?.user?.role || JSON.parse(localStorage.getItem("USER"))?.role;
  const visibleBatches = getVisibleBatchesForRole(batchs, userRole);
  const currentBatch = visibleBatches.find((batch) => batch?.id === batchId);
  const classRoom = currentBatch?.classRooms?.find((room) => room?.id === classRoomId);
  const [dashboardRoom, setDashboardRoom] = React.useState(null);
  const formatCreatedAt = (value) => {
    if (!value) {
      return "Not available";
    }

    return formatDateTime12Hour(value);
  };
  const formatClassDateTime = (cls) => {
    const date = cls?.date ? new Date(`${cls.date}T${cls.starttime || "00:00"}`) : null;
    const dateText = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : cls?.date || "Date not set";
    return `${dateText} | ${formatTimeRange12Hour(cls?.starttime, cls?.endTime)}`;
  };
  const isClassLive = (cls) => {
    if (!cls?.date || !cls?.starttime || !cls?.endTime) {
      return false;
    }

    const now = new Date();
    const start = new Date(`${cls.date}T${cls.starttime}`);
    const end = new Date(`${cls.date}T${cls.endTime}`);
    return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && now >= start && now <= end;
  };

  React.useEffect(() => {
    if (localStorage.getItem("JWT") && !userRole) {
      dispatch(getUser());
    }
  }, [dispatch, userRole]);

  const refreshWorkspace = useWorkspaceRefresh(dispatch, userRole);

  React.useEffect(() => {
    if (userRole !== "ROLE_USER" || !batchId || !classRoomId) {
      setDashboardRoom(null);
      return;
    }

    let cancelled = false;
    fetchStudentDashboard()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const course = response?.data?.courses?.find((item) => item.batchId === batchId);
        const room = course?.classRooms?.find((item) => item.id === classRoomId);
        setDashboardRoom(room || null);
      })
      .catch(() => setDashboardRoom(null));

    return () => {
      cancelled = true;
    };
  }, [batchId, classRoomId, userRole]);

  const classCompletionMap = React.useMemo(
    () => new Map((dashboardRoom?.classes || []).map((item) => [item.id, item.completionPercentage])),
    [dashboardRoom]
  );

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
                <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Class Room</span>
                <h1 className="title-dark mt-3">{classRoom?.name}</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                  <span className="pill-tag">{classRoom?.subject?.name || "No subject"}</span>
                  <span>Created by {classRoom?.createdByName || "Not available"}</span>
                  <span>{formatCreatedAt(classRoom?.createdAt)}</span>
                </div>
                {userRole === "ROLE_USER" && dashboardRoom && (
                  <div className="mt-4 max-w-sm">
                    <ProgressBar value={dashboardRoom.completionPercentage} label="Classroom completion" />
                  </div>
                )}
              </div>
            </div>

            {userRole === "ROLE_LECTURER" && (
              <Link to="/createClass" state={{ batchId, classRoomId, classRoom }} className="primary-btn w-fit">
                <FiPlus /> Add New Class
              </Link>
            )}
          </div>
        </section>

        <div className="space-y-4">
          {classRoom?.classes && classRoom.classes.length > 0 ? (
            classRoom.classes.map((cls) => (
              <div key={cls.id} className="content-card p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="font-semibold text-lg">{cls.className}</span>
                  <p className="subtle-text mt-1">{formatClassDateTime(cls)}</p>
                  <p className="subtle-text mt-1">Lecturer: {cls?.lecturer?.user?.name || cls?.lecturer?.name || "Not assigned"}</p>
                  {userRole === "ROLE_USER" && (
                    <div className="mt-3 max-w-xs">
                      <ProgressBar value={classCompletionMap.get(cls.id) || 0} label="Class completion" compact />
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isClassLive(cls) && cls?.zoomlink && (
                    <button type="button" onClick={() => window.open(cls.zoomlink, "_blank", "noopener,noreferrer")} className="secondary-btn !py-2 !px-4">
                      Join
                    </button>
                  )}
                  <Link
                    to="/streamClass"
                    state={{ batchId, classRoomId, classId: cls?.id }}
                    className="primary-btn w-fit"
                  >
                    View
                  </Link>
                  {userRole === "ROLE_ADMIN" && (
                    <AdminDeleteButton
                      resource={{ type: "class", id: cls.id, name: cls.className, label: "class" }}
                      onDeleted={refreshWorkspace}
                      className="!py-2 !px-4"
                    />
                  )}
                  {userRole === "ROLE_LECTURER" && (
                    <LecturerDeleteRequestButton
                      resource={{ type: "class", id: cls.id, name: cls.className, label: "class" }}
                      target={{ batchId, classRoomId, classId: cls.id }}
                      className="!py-2 !px-4"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="content-card p-8 text-center subtle-text">No classes available.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamClassRoom;
