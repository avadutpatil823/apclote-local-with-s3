import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PlusIconWithTooltip from "../User/PlusIconWithTooltip";
import { useDispatch, useSelector } from "react-redux";
import { getAllUserTestAns } from "../../State/LecturerAndUsers/Action";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { AdminDeleteButton, LecturerDeleteRequestButton } from "../User/DeleteResourceControls";
import { getUser } from "../../State/Auth/Action";
import { useWorkspaceRefresh } from "../../hooks/useWorkspaceRefresh";
import { fetchStudentDashboard } from "../../utils/progressApi";
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

const StreamClass = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { batchId: stateBatchId, classRoomId: stateClassRoomId, classId: stateClassId } = location.state || {};
  const batchId = stateBatchId || (searchParams.get("batchId") ? Number(searchParams.get("batchId")) : null);
  const classRoomId = stateClassRoomId || (searchParams.get("classRoomId") ? Number(searchParams.get("classRoomId")) : null);
  const classId = stateClassId || (searchParams.get("classId") ? Number(searchParams.get("classId")) : null);
  const resourceType = searchParams.get("resourceType");
  const dispatch = useDispatch();
  const getInitialTab = React.useCallback(() => {
    if (resourceType === "notes") {
      return "notes";
    }

    if (resourceType === "test") {
      return "tests";
    }

    return "videos";
  }, [resourceType]);
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [testIds, setTestIds] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [dashboardClass, setDashboardClass] = useState(null);
  const { lecturesAndUsers, batchs, auth } = useSelector((store) => store);
  const userAllTA = lecturesAndUsers?.userAllTA;
  const userRole = auth?.user?.role || JSON.parse(localStorage.getItem("USER"))?.role;
  const visibleBatches = getVisibleBatchesForRole(batchs, userRole);
  const currentBatch = visibleBatches.find((batch) => batch?.id === batchId);
  const currentClassRoom = currentBatch?.classRooms?.find((room) => room?.id === classRoomId);
  const classData = currentClassRoom?.classes?.find((cls) => cls?.id === classId);

  useEffect(() => {
    if (localStorage.getItem("JWT") && !userRole) {
      dispatch(getUser());
    }
  }, [dispatch, userRole]);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [getInitialTab]);

  useEffect(() => {
    dispatch(getAllUserTestAns());
    if (classData?.tests?.length > 0) {
      setTestIds(classData.tests.map((test) => test.id));
    }
  }, [dispatch, classData]);

  const refreshWorkspace = useWorkspaceRefresh(dispatch, userRole);

  useEffect(() => {
    if (userAllTA && testIds.length > 0) {
      setFilteredTests(userAllTA.filter((uta) => testIds.includes(uta.test.id)));
    } else {
      setFilteredTests([]);
    }
  }, [userAllTA, testIds]);

  const navigate = useNavigate();
  const tabs = ["videos", "notes", "tests"];

  useEffect(() => {
    if (userRole !== "ROLE_USER" || !batchId || !classRoomId || !classId) {
      setDashboardClass(null);
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
        const itemClass = room?.classes?.find((item) => item.id === classId);
        setDashboardClass(itemClass || null);
      })
      .catch(() => setDashboardClass(null));

    return () => {
      cancelled = true;
    };
  }, [batchId, classId, classRoomId, userRole]);

  const completionByType = React.useMemo(() => ({
    videos: new Map((dashboardClass?.videos || []).map((item) => [item.id, item])),
    notes: new Map((dashboardClass?.notes || []).map((item) => [item.id, item])),
    tests: new Map((dashboardClass?.tests || []).map((item) => [item.id, item]))
  }), [dashboardClass]);

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
                <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Class Space</span>
                <h1 className="title-dark mt-3">{classData?.className}</h1>
                {userRole === "ROLE_USER" && dashboardClass && (
                  <div className="mt-4 max-w-sm">
                    <ProgressBar value={dashboardClass.completionPercentage} label="Class completion" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {userRole === "ROLE_ADMIN" && classData && (
                <AdminDeleteButton
                  resource={{ type: "class", id: classData.id, name: classData.className, label: "class" }}
                  onDeleted={() => {
                    refreshWorkspace();
                    navigate("/streamClassRoom", { state: { batchId, classRoomId } });
                  }}
                  className="!py-2 !px-4"
                />
              )}
              {userRole === "ROLE_LECTURER" && classData && (
                <LecturerDeleteRequestButton
                  resource={{ type: "class", id: classData.id, name: classData.className, label: "class" }}
                  target={{ batchId, classRoomId, classId }}
                  className="!py-2 !px-4"
                />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? "primary-btn" : "ghost-btn"}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {userRole === "ROLE_LECTURER" && (
                  <Link
                    to={tab === "videos" ? "/uploadVideo" : tab === "notes" ? "/uploadNotes" : "/createTest"}
                    state={{ batchId, classRoomId, classId: classData?.id }}
                  >
                    <PlusIconWithTooltip color={activeTab === tab ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} />
                  </Link>
                )}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "videos" && (
          <div className="grid-auto-fit">
            {classData?.videos?.length > 0 ? (
              classData.videos.map((video, index) => (
                <div key={index} className="dashboard-card p-5 space-y-4">
                  <div className="h-[20vh] rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#06b6d4)]"></div>
                  <h2 className="font-semibold text-lg">{video.title}</h2>
                  {userRole === "ROLE_USER" && (
                    <ProgressBar value={completionByType.videos.get(video.id)?.completionPercentage || 0} label="Video completion" compact />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Link to="/videoPlayer" state={{ video: { ...video, completed: completionByType.videos.get(video.id)?.completed } }} className="primary-btn w-fit">
                      Stream
                    </Link>
                    {userRole === "ROLE_ADMIN" && (
                      <AdminDeleteButton
                        resource={{ type: "video", id: video.id, name: video.title, label: "class video" }}
                        onDeleted={refreshWorkspace}
                        className="!py-2 !px-4"
                      />
                    )}
                    {userRole === "ROLE_LECTURER" && (
                      <LecturerDeleteRequestButton
                        resource={{ type: "video", id: video.id, name: video.title, label: "class video" }}
                        target={{ batchId, classRoomId, classId, resourceType: "video", resourceId: video.id }}
                        className="!py-2 !px-4"
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="content-card p-8 text-center subtle-text">No videos available.</div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="grid-auto-fit">
            {classData?.notes?.length > 0 ? (
              classData.notes.map((note, index) => (
                <div key={index} className="dashboard-card p-5 space-y-4">
                  <div className="h-[20vh] rounded-2xl bg-stone-100 p-4">
                    <img src="/notes.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <h2 className="font-semibold text-lg">{note.title}</h2>
                  {userRole === "ROLE_USER" && completionByType.notes.get(note.id)?.completed && (
                    <span className="pill-tag !bg-emerald-50 !text-emerald-700 !border-emerald-200">Completed</span>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/noteViewer"
                      state={{ note }}
                      className="primary-btn w-fit"
                    >
                      View
                    </Link>
                    {userRole === "ROLE_ADMIN" && (
                      <AdminDeleteButton
                        resource={{ type: "notes", id: note.id, name: note.title, label: "notes" }}
                        onDeleted={refreshWorkspace}
                        className="!py-2 !px-4"
                      />
                    )}
                    {userRole === "ROLE_LECTURER" && (
                      <LecturerDeleteRequestButton
                        resource={{ type: "notes", id: note.id, name: note.title, label: "notes" }}
                        target={{ batchId, classRoomId, classId, resourceType: "notes", resourceId: note.id }}
                        className="!py-2 !px-4"
                      />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="content-card p-8 text-center subtle-text">No notes available.</div>
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="grid-auto-fit">
            {classData?.tests?.length > 0 ? (
              classData.tests.map((test, index) => {
                const userTA = filteredTests?.length > 0 && filteredTests.find((uta) => uta.test.id === test.id);

                return (
                  <div key={index} className="dashboard-card p-5 space-y-4">
                    <div className="h-[20vh] rounded-2xl bg-stone-100 p-4">
                      <img src="/test.png" alt="test" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="font-semibold text-lg">{test.name}</h2>
                    {userRole === "ROLE_USER" && completionByType.tests.get(test.id)?.completed && (
                      <span className="pill-tag !bg-emerald-50 !text-emerald-700 !border-emerald-200">Completed</span>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {userTA ? (
                        <Link to="/UTA" state={{ userTA }} className="secondary-btn w-fit">
                          See Result
                        </Link>
                      ) : (
                        <Link to="/userAnswers" state={{ test }} className="primary-btn w-fit">
                          Attempt
                        </Link>
                      )}
                      {userRole === "ROLE_ADMIN" && (
                        <AdminDeleteButton
                          resource={{ type: "test", id: test.id, name: test.name, label: "test" }}
                          onDeleted={refreshWorkspace}
                          className="!py-2 !px-4"
                        />
                      )}
                      {userRole === "ROLE_LECTURER" && (
                        <LecturerDeleteRequestButton
                          resource={{ type: "test", id: test.id, name: test.name, label: "test" }}
                          target={{ batchId, classRoomId, classId, resourceType: "test", resourceId: test.id }}
                          className="!py-2 !px-4"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="content-card p-8 text-center subtle-text">No tests available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamClass;
