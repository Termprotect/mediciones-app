export default function Button({ children, onClick, variant = "primary", disabled, className = "", full, type = "button" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary text-dark hover:bg-primary-hover px-5 py-2.5",
    secondary: "bg-surface text-white border border-border hover:bg-surface-hover px-5 py-2.5",
    ghost: "bg-transparent text-muted hover:text-white hover:bg-surface px-5 py-2.5",
    danger: "bg-danger/20 text-danger hover:bg-danger/30 px-5 py-2.5",
    success: "bg-success/20 text-success hover:bg-success/30 px-5 py-2.5",
    outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary/10 px-5 py-2.5",
    icon: "bg-surface text-muted hover:text-white hover:bg-surface-hover p-2.5",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${full ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
