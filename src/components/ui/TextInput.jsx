export default function TextInput({ value, onChange, placeholder, type = "text", suffix, className = "", disabled, min, max }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        className={`w-full px-4 py-2.5 bg-dark border-2 border-border rounded-xl text-white text-sm placeholder:text-muted/60 outline-none focus:border-primary transition-colors disabled:opacity-50 ${className}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-xs font-medium">
          {suffix}
        </span>
      )}
    </div>
  );
}
