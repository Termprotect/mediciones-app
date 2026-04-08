export default function ProgressBar({ current, total, className = "" }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const complete = current === total && total > 0;
  return (
    <div className={`h-1.5 rounded-full bg-border overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${complete ? "bg-success" : "bg-primary"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
