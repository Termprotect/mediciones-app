import { ChevronDown } from "lucide-react";

export default function SelectInput({ value, onChange, options, placeholder = "Seleccionar..." }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-dark border-2 border-border rounded-xl text-white text-sm outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
      >
        <option value="" className="text-muted">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id || o.value} value={o.id || o.value} className="bg-dark">
            {o.label || o.nombre}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
    </div>
  );
}
