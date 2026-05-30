import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllBatchs, getCourses, getSubjects } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { AdminDeleteButton } from "../User/DeleteResourceControls";
import { canAdminCreate, canAdminUpdate } from "../User/deleteResourceUtils";
import axios from "axios";
import { buildApiUrl } from "../../config/api";
import Pagination from "../User/Pagination";

const tabs = [
  { id: "subjects", label: "Subjects" },
  { id: "courses", label: "Courses" },
  { id: "batches", label: "Batches" }
];

const pageSize = 12;

const AdminCatalog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { batchs } = useSelector((store) => store);
  const [activeTab, setActiveTab] = React.useState(location.state?.tab || "subjects");
  const [search, setSearch] = React.useState("");
  const [visibleCount, setVisibleCount] = React.useState(pageSize);
  const [batchItems, setBatchItems] = React.useState([]);
  const [batchPage, setBatchPage] = React.useState(1);
  const [batchTotalPages, setBatchTotalPages] = React.useState(1);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const canCreateActiveTab =
    (activeTab === "subjects" && canAdminCreate("SUBJECT")) ||
    (activeTab === "courses" && canAdminCreate("COURSE")) ||
    (activeTab === "batches" && canAdminCreate("BATCH"));

  const filteredSubjects = (batchs?.subjects || []).filter((item) =>
    item?.name?.toLowerCase().includes(search.trim().toLowerCase())
  );
  const filteredCourses = (batchs?.coursess || []).filter((item) =>
    item?.name?.toLowerCase().includes(search.trim().toLowerCase())
  );

  const localItems = activeTab === "subjects" ? filteredSubjects : filteredCourses;
  const visibleLocalItems = localItems.slice(0, visibleCount);

  React.useEffect(() => {
    dispatch(getSubjects());
    dispatch(getCourses());
    dispatch(getAllBatchs(1));
  }, [dispatch]);

  React.useEffect(() => {
    if (activeTab !== "batches") {
      return;
    }

    setBatchItems([]);
    setBatchPage(1);
    setBatchTotalPages(1);
    loadBatchPage(1, true);
  }, [activeTab]);

  React.useEffect(() => {
    setVisibleCount(pageSize);
  }, [activeTab, search]);

  const getSubjectCourseBlockers = (subjectId) =>
    (batchs?.coursess || [])
      .filter((course) => (course?.subjects || []).some((subject) => subject?.id === subjectId || subject?.name === batchs.subjects.find((item) => item.id === subjectId)?.name))
      .map((course) => course.name || `Course ${course.id}`);

  const getCourseBatchBlockers = (courseId) =>
    (batchs?.allBatchs || [])
      .filter((batch) => batch?.course?.id === courseId)
      .map((batch) => batch.name || `Batch ${batch.id}`);

  const loadBatchPage = async (pageNumber, replace = false, key = search) => {
    setLoadingMore(true);
    try {
      const params = new URLSearchParams({ pageNumber, pageSize });
      if (key?.trim()) {
        params.set("key", key.trim());
      }

      const response = await axios.get(buildApiUrl(`/getAllBatchs?${params.toString()}`));
      setBatchItems((current) => (replace ? response.data?.content || [] : [...current, ...(response.data?.content || [])]));
      setBatchPage((response.data?.number || 0) + 1);
      setBatchTotalPages(response.data?.totalPages || 1);
    } finally {
      setLoadingMore(false);
    }
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setVisibleCount(pageSize);
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    setVisibleCount(pageSize);

    if (activeTab === "batches") {
      setBatchItems([]);
      setBatchPage(1);
      loadBatchPage(1, true, value);
    }
  };

  const refreshCurrentTab = () => {
    if (activeTab === "subjects") {
      dispatch(getSubjects());
    } else if (activeTab === "courses") {
      dispatch(getCourses());
    } else {
      loadBatchPage(1, true);
    }
  };

  const localPage = Math.max(Math.ceil(visibleCount / pageSize), 1);
  const localTotalPages = Math.max(Math.ceil(localItems.length / pageSize), 1);

  const loadNextLocalPage = async (nextPage) => {
    setLoadingMore(true);
    window.setTimeout(() => {
      setVisibleCount(Math.min(nextPage * pageSize, localItems.length));
      setLoadingMore(false);
    }, 450);
  };

  const loadNextPage = (nextPage) => {
    if (activeTab === "batches") {
      return loadBatchPage(nextPage);
    }

    return loadNextLocalPage(nextPage);
  };

  const renderSubjects = () => (
    <div className="mt-5 grid-auto-fit">
      {visibleLocalItems.length > 0 ? visibleLocalItems.map((item) => (
        <article key={item.id} className="content-card p-4 flex items-center justify-between gap-3">
          <span className="font-semibold">{item.name}</span>
          <div className="flex flex-wrap gap-2">
            {canAdminUpdate("SUBJECT") && (
              <button className="ghost-btn !py-2 !px-4" type="button" onClick={() => navigate("/addSubject", { state: { subject: item } })}>
                Update
              </button>
            )}
            <AdminDeleteButton
              resource={{
                type: "subject",
                id: item.id,
                name: item.name,
                label: "subject",
                blockers: getSubjectCourseBlockers(item.id),
                blockerMessage: "Subject is associated with this course:"
              }}
              onDeleted={refreshCurrentTab}
              className="!py-2 !px-4"
            />
          </div>
        </article>
      )) : <p className="subtle-text">No subjects found.</p>}
    </div>
  );

  const renderCourses = () => (
    <div className="mt-5 grid-auto-fit">
      {visibleLocalItems.length > 0 ? visibleLocalItems.map((item) => (
        <article key={item.id} className="content-card p-5 space-y-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">{item.name}</h3>
            <p className="subtle-text">Duration: {item.duration} months | Fee: Rs {item.fee}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAdminUpdate("COURSE") && (
              <button className="ghost-btn !py-2 !px-4" type="button" onClick={() => navigate("/createCourse", { state: { course: item } })}>
                Update
              </button>
            )}
            <AdminDeleteButton
              resource={{
                type: "course",
                id: item.id,
                name: item.name,
                label: "course",
                blockers: getCourseBatchBlockers(item.id),
                blockerMessage: "Course is attached with this batch:"
              }}
              onDeleted={refreshCurrentTab}
              className="!py-2 !px-4"
            />
          </div>
        </article>
      )) : <p className="subtle-text">No courses found.</p>}
    </div>
  );

  const renderBatches = () => (
    <div className="mt-5 grid-auto-fit">
      {batchItems.length > 0 ? batchItems.map((item) => (
        <article key={item.id} className="content-card p-5 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-950">{item.name}</h3>
            <p className="subtle-text">{item.course?.name || "No course"} | {item.startDate}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/streamBatch" state={{ batchId: item.id }} className="primary-btn !py-2 !px-4">
              Manage
            </Link>
            {canAdminUpdate("BATCH") && (
              <button className="ghost-btn !py-2 !px-4" type="button" onClick={() => navigate("/createBatch", { state: { batch: item } })}>
                Update
              </button>
            )}
            <AdminDeleteButton
              resource={{ type: "batch", id: item.id, name: item.name, label: "batch" }}
              onDeleted={refreshCurrentTab}
              className="!py-2 !px-4"
            />
          </div>
        </article>
      )) : !loadingMore ? <p className="subtle-text">No batches found.</p> : null}
    </div>
  );

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Admin Catalog</span>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="title-dark">Subjects, Courses & Batches</h1>
              <p className="subtle-text mt-2">Review existing records, update details, or delete records with dependency checks.</p>
            </div>
            {canCreateActiveTab && (
              <Link
                to={activeTab === "subjects" ? "/addSubject" : activeTab === "courses" ? "/createCourse" : "/createBatch"}
                className="primary-btn w-fit"
              >
                Create New
              </Link>
            )}
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={activeTab === tab.id ? "primary-btn !py-2 !px-4" : "ghost-btn !py-2 !px-4"}
                  type="button"
                  onClick={() => changeTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <input className="field-input md:max-w-xs" value={search} onChange={handleSearch} placeholder={`Search ${activeTab}`} />
          </div>

          {activeTab === "subjects" && renderSubjects()}
          {activeTab === "courses" && renderCourses()}
          {activeTab === "batches" && renderBatches()}
          <Pagination
            currentPage={activeTab === "batches" ? batchPage : localPage}
            totalPages={activeTab === "batches" ? batchTotalPages : localTotalPages}
            onPageChange={loadNextPage}
            loading={loadingMore}
            label={activeTab}
          />
        </section>
      </div>
    </div>
  );
};

export default AdminCatalog;
