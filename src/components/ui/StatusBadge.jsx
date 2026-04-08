import { STATUS_CONFIG } from "../../lib/constants";

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.borrador;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}
