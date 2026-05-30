import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { formatTimeRange12Hour } from "../../utils/timeFormat";

const StreamMyBatchs = ({ lbs }) => {
  const { batchs } = useSelector((store) => store);
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <div className="page-content space-y-6">
        <section className="surface-panel p-6 md:p-8">
          <span className="eyebrow !bg-[#fff1dc] !text-[#a85c00] !border-[#f7d7a6]">Lecturer Space</span>
          <h1 className="title-dark mt-4">Assigned Batches</h1>
          <p className="subtle-text mt-3">Open a batch to manage class rooms, schedule classes, upload notes, videos, and tests.</p>
        </section>

        {batchs.lecturerBatchs.length > 0 ? (
          <div className="grid-auto-fit">
            {batchs.lecturerBatchs?.map((batch) => (
              <div key={batch?.id} className="dashboard-card p-6 space-y-4">
                <h2 className="text-2xl font-bold">{batch?.name}</h2>
                <p><strong>Start Date:</strong> {batch?.startDate}</p>
                <p><strong>Time:</strong> {formatTimeRange12Hour(batch?.start_time, batch?.end_time)}</p>
                <div>
                  <strong>Course:</strong> {batch?.course?.name}
                  <p className="subtle-text mt-1">
                    Duration: {batch?.course?.duration} months | Fee: Rs {batch?.course?.fee}
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Assigned Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {lbs &&
                      lbs.map(
                        (bs) =>
                          bs.batchId === batch?.id && (
                            <span key={`${bs.batchId}-${bs.subject?.id}`} className="pill-tag">
                              {bs?.subject?.name}
                            </span>
                          )
                      )}
                  </div>
                </div>

                <Link
                  to="/streamBatch"
                  className="primary-btn"
                  state={{ batchId: batch?.id }}
                >
                  Open Batch
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="content-card empty-card">
              <h2 className="title-dark text-2xl">You are not assigned to any batch yet</h2>
              <button onClick={() => navigate("/")} className="primary-btn mt-5">
                Go Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamMyBatchs;
