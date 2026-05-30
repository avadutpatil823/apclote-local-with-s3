import { clampProgress } from "../../utils/progressApi";

const ProgressBar = ({ value, label = "Completion", compact = false }) => {
  const progress = clampProgress(value);

  return (
    <div className={compact ? "space-y-1" : "space-y-2"}>
      <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6,#4f46e5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
