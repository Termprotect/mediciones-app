import { memo } from "react";

export default memo(function Chips({ options, value, onChange, renderOpt }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const sel = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer border-2 ${
              sel
                ? "bg-primary text-dark border-primary"
                : "bg-surface text-muted border-border hover:border-muted/50"
            }`}
          >
            {renderOpt ? renderOpt(o) : o.label}
          </button>
        );
      })}
    </div>
  );
});
