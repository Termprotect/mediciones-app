import { FileText } from "lucide-react";

export default function AuditPage() {
  const auditLogs = [
    { id: 1, user: "admin", action: "Crear usuario", target: "Juan Pérez", timestamp: "2024-04-01 14:30:00", status: "success" },
    { id: 2, user: "admin", action: "Editar catálogo", target: "Color Blanco", timestamp: "2024-04-01 13:15:00", status: "success" },
    { id: 3, user: "director", action: "Descargar reporte", target: "Mediciones Marzo", timestamp: "2024-03-31 18:45:00", status: "success" },
    { id: 4, user: "admin", action: "Cambiar configuración", target: "Horario laboral", timestamp: "2024-03-31 09:00:00", status: "success" },
    { id: 5, user: "logistica", action: "Intentar acceso denegado", target: "Panel de usuarios", timestamp: "2024-03-30 16:20:00", status: "failed" },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Registro de Actividad</h1>
        <p className="text-muted text-sm mt-1">Historial de acciones del sistema</p>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Usuario</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Acción</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Objetivo</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Fecha y Hora</th>
              <th className="text-left px-5 py-3 text-xs text-muted font-semibold uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3.5 font-semibold text-sm">{log.user}</td>
                <td className="px-5 py-3.5 text-sm text-muted">{log.action}</td>
                <td className="px-5 py-3.5 text-sm">{log.target}</td>
                <td className="px-5 py-3.5 text-sm text-muted text-xs">{log.timestamp}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${log.status === "success" ? "text-success" : "text-danger"}`}>
                    <span className={`w-2 h-2 rounded-full ${log.status === "success" ? "bg-success" : "bg-danger"}`} />
                    {log.status === "success" ? "Exitoso" : "Fallido"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-5 h-5 text-muted" />
          <h2 className="text-lg font-bold">Sobre el registro de actividad</h2>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          Este registro contiene un historial de todas las acciones realizadas en el panel de administración.
          Se mantiene un registro detallado de quién hizo qué, cuándo y con qué resultado para mantener la
          seguridad y trazabilidad del sistema.
        </p>
      </div>
    </div>
  );
}
