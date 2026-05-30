import React from "react";
import { useLocation } from "react-router-dom";
import { formatTimeRange12Hour } from "../utils/timeFormat";

const Batch = () => {
  const location = useLocation();
  const { batch } = location.state || {};

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <h1 className="title-dark">{batch?.name}</h1>
          <p className="subtle-text mt-3">Batch ID: {batch?.id}</p>
          <p className="subtle-text">Start Date: {batch?.startDate}</p>
          <p className="subtle-text">Time: {formatTimeRange12Hour(batch?.start_time, batch?.end_time)}</p>
        </section>

        <section className="content-card p-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Course Info</h2>
          <p><span className="font-semibold">Name:</span> {batch?.course?.name}</p>
          <p><span className="font-semibold">Duration:</span> {batch?.course?.duration} months</p>
          <p><span className="font-semibold">Fee:</span> Rs {batch?.course?.fee}</p>
        </section>

        <section className="content-card p-6">
          <h2 className="text-xl font-semibold text-teal-700 mb-3">Lecturers</h2>
          <div className="space-y-3">
            {batch?.lecturers?.map((lecturer, idx) => (
              <div key={idx} className="rounded-2xl border border-stone-200 p-4">
                <p><span className="font-semibold">Name:</span> {lecturer.user?.name}</p>
                <p><span className="font-semibold">Email:</span> {lecturer.user?.email}</p>
                <p><span className="font-semibold">Salary:</span> Rs {lecturer.salary}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-teal-700 mb-4">Classrooms</h2>
          <div className="grid-auto-fit">
            {batch?.classRooms?.map((room) => (
              <div key={room.id} className="dashboard-card p-5">
                <h3 className="text-lg font-bold text-teal-800 mb-2">{room.name}</h3>
                {room.classes?.length > 0 ? (
                  <ul className="space-y-2 text-gray-700">
                    {room.classes.map((cls) => (
                      <li key={cls.id}>{cls.className} ({cls.date})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="subtle-text text-sm">No classes yet</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Batch;
