import { CITIES } from "../../lib/constants";

export default function CityBadge({ cityId }) {
  const city = CITIES.find((c) => c.id === cityId);
  if (!city) return null;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{ backgroundColor: city.color + "22", color: city.color }}
    >
      {city.label}
    </span>
  );
}
