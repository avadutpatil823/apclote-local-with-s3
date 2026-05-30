import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SyncLoader } from "react-spinners";
import { getLecturerBatchs } from "../../State/BatchsAndCoursesAndSubjects/Action";
import { getUser } from "../../State/Auth/Action";
import { formatTimeRange12Hour } from "../../utils/timeFormat";

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }

  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return new Date(year, month - 1, day);
};

const formatDateLabel = (dateKey) => {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  }).format(date);
};

const formatFullDate = (dateKey) => {
  const date = parseLocalDate(dateKey);
  if (!date) {
    return dateKey;
  }

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);
};

const getDayWindow = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [-2, -1, 0, 1, 2, 3].map((offset) => {
    const date = new Date(today.getTime() + offset * DAY_MS);
    const key = toDateKey(date);

    return {
      key,
      offset,
      label: offset === 0 ? "Today" : formatDateLabel(key)
    };
  });
};

const isActiveBatch = (batch) => {
  const status = String(batch?.status || batch?.batchStatus || "").toUpperCase();
  if (status) {
    return status === "ACTIVE";
  }

  if (typeof batch?.active === "boolean") {
    return batch.active;
  }

  return true;
};

const buildClassSchedule = (batches) =>
  (batches || [])
    .filter(isActiveBatch)
    .flatMap((batch) =>
      (batch?.classRooms || []).flatMap((classRoom) =>
        (classRoom?.classes || []).map((classItem) => ({
          ...classItem,
          batchId: batch?.id,
          batchName: batch?.name,
          classRoomId: classRoom?.id,
          classRoomName: classRoom?.name,
          subjectName: classRoom?.subject?.name || classItem?.subject?.name || "No subject"
        }))
      )
    )
    .filter((classItem) => classItem.date)
    .sort((first, second) => {
      const dateCompare = String(first.date).localeCompare(String(second.date));
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return String(first.starttime || "").localeCompare(String(second.starttime || ""));
    });

const LecturerClasses = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dayWindow = React.useMemo(getDayWindow, []);
  const [selectedDate, setSelectedDate] = React.useState(() => toDateKey(new Date()));
  const { batchs, auth } = useSelector((store) => store);
  const userRole = auth?.user?.role || JSON.parse(localStorage.getItem("USER") || "null")?.role;

  React.useEffect(() => {
    if (localStorage.getItem("JWT") && !userRole) {
      dispatch(getUser());
    }
  }, [dispatch, userRole]);

  React.useEffect(() => {
    if (userRole === "ROLE_LECTURER" || !batchs?.lecturerBatchs?.length) {
      dispatch(getLecturerBatchs());
    }
  }, [batchs?.lecturerBatchs?.length, dispatch, userRole]);

  const classes = React.useMemo(() => buildClassSchedule(batchs?.lecturerBatchs), [batchs?.lecturerBatchs]);
  const selectedClasses = classes.filter((classItem) => classItem.date === selectedDate);
  const selectedDay = dayWindow.find((day) => day.key === selectedDate);

  if (localStorage.getItem("JWT") && userRole && userRole !== "ROLE_LECTURER") {
    return (
      <div className="page-shell">
        <div className="page-content">
          <section className="surface-panel p-8">
            <h1 className="title-dark">Lecturer Access Required</h1>
            <p className="subtle-text mt-3">Please sign in with a lecturer account to view scheduled classes.</p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturer Schedule</span>
              <h1 className="title-dark mt-3">My Classes</h1>
              <p className="subtle-text mt-3">View classes from your active batches across the recent and upcoming days.</p>
            </div>
            <Link to="/lecturerBatchs" className="ghost-btn w-fit">
              Assigned Batches
            </Link>
          </div>
        </section>

        <section className="surface-panel p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {dayWindow.map((day) => {
              const count = classes.filter((classItem) => classItem.date === day.key).length;
              const isSelected = selectedDate === day.key;

              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => setSelectedDate(day.key)}
                  className={`rounded-lg border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                  }`}
                >
                  <span className="block text-sm font-bold">{day.label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{formatDateLabel(day.key)}</span>
                  <span className="mt-2 block text-sm font-semibold">{count} class{count === 1 ? "" : "es"}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-panel p-6 md:p-8">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {selectedDay?.offset === 0 ? "Today's classes" : "Classes"}
              </h2>
              <p className="subtle-text mt-1">{formatFullDate(selectedDate)}</p>
            </div>
            {batchs?.isloading && (
              <span className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                <SyncLoader color="#0f766e" size={6} />
                Loading classes
              </span>
            )}
          </div>

          {selectedClasses.length > 0 ? (
            <div className="space-y-4">
              {selectedClasses.map((classItem) => (
                <article key={`${classItem.batchId}-${classItem.classRoomId}-${classItem.id}`} className="content-card p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{classItem.className || "Class"}</h3>
                      <p className="subtle-text mt-1">{classItem.batchName} | {classItem.classRoomName}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="pill-tag">{classItem.subjectName}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                          {formatTimeRange12Hour(classItem.starttime, classItem.endTime)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {classItem.zoomlink && (
                        <a href={classItem.zoomlink} target="_blank" rel="noreferrer" className="secondary-btn !py-2 !px-4">
                          Join
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          navigate("/streamClass", {
                            state: {
                              batchId: classItem.batchId,
                              classRoomId: classItem.classRoomId,
                              classId: classItem.id
                            }
                          })
                        }
                        className="primary-btn !py-2 !px-4"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="content-card p-8 text-center">
              <h3 className="text-xl font-bold text-slate-950">No classes scheduled</h3>
              <p className="subtle-text mt-2">There are no active-batch classes for this day.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LecturerClasses;
