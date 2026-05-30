import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaBookOpen,
  FaRupeeSign,
} from "react-icons/fa";
import { formatTimeRange12Hour } from "../../utils/timeFormat";

const BatchCard = ({ batch }) => {
  const navigate = useNavigate();

  const handleExplore = () => {
    navigate("/batchDetails", { state: { batch } });
  };

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="bg-[linear-gradient(135deg,#4f46e5,#06b6d4)] text-white py-5 px-6">
        <div>
          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans']">{batch.name}</h2>
          <p className="text-sm text-sky-50/90 mt-1">{batch.course?.name}</p>
        </div>
      </div>

      <div className="p-6 space-y-4 text-slate-700">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-teal-600" />
          <p>
            <strong>Start Date:</strong> {batch.startDate}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FaClock className="text-teal-600" />
          <p>
            <strong>Timing:</strong> {formatTimeRange12Hour(batch.start_time, batch.end_time)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FaBookOpen className="text-teal-600" />
          <p>
            <strong>Duration:</strong> {batch.course?.duration} months
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FaRupeeSign className="text-amber-600" />
          <p className="text-lg font-semibold text-amber-700">
            {batch.course?.fee}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-wrap gap-3">
        <button onClick={handleExplore} className="primary-btn">
          Explore
        </button>

        {localStorage.getItem("JWT") === null ? (
          <Link to="/login" className="secondary-btn">
            Enroll Now
          </Link>
        ) : (
          <Link to="/createOrder" state={{ batch }} className="secondary-btn">
            Enroll Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default BatchCard;
