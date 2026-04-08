export default function Field({ label, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-muted uppercase tracking-wide">
          {label}{required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
