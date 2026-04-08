// Cities
export const CITIES = [
  { id: "madrid", label: "Madrid", color: "#C62828" },
  { id: "valencia", label: "Valencia", color: "#E65100" },
  { id: "barcelona", label: "Barcelona", color: "#1565C0" },
  { id: "malaga", label: "Málaga", color: "#6A1B9A" },
];

// Users (will be replaced by Supabase Auth)
export const USERS = [
  { id: "admin1", username: "admin", password: "admin1234", role: "admin", name: "Wiston Bastidas", city: null },
  { id: "dir1", username: "neider", password: "1234", role: "director", name: "Neider", city: null },
  { id: "log_mad", username: "madrid", password: "1234", role: "logistica", name: "Moisés", city: "madrid" },
  { id: "log_val", username: "valencia", password: "1234", role: "logistica", name: "Juan Pablo", city: "valencia" },
  { id: "log_bcn", username: "barcelona", password: "1234", role: "logistica", name: "Lucho", city: "barcelona" },
  { id: "log_mlg", username: "malaga", password: "1234", role: "logistica", name: "Málaga", city: "malaga" },
  { id: "med_jesus", username: "jesus", password: "1234", role: "medidor", name: "Jesús", city: "madrid" },
  { id: "med_serioja", username: "serioja", password: "1234", role: "medidor", name: "Serioja", city: "all" },
  { id: "med_luciano", username: "luciano", password: "1234", role: "medidor", name: "Luciano", city: "valencia" },
  { id: "med_miguel", username: "miguel", password: "1234", role: "medidor", name: "Miguel", city: "barcelona" },
];

// Comerciales (managed from admin panel)
export const COMERCIALES = [
  { id: "com1", nombre: "Ana López", email: "ana@termprotect.es", telefono: "600111222", ciudad: "madrid", activo: true },
  { id: "com2", nombre: "Carlos Ruiz", email: "carlos@termprotect.es", telefono: "600333444", ciudad: "valencia", activo: true },
  { id: "com3", nombre: "Marta Díaz", email: "marta@termprotect.es", telefono: "600555666", ciudad: "barcelona", activo: true },
  { id: "com4", nombre: "Luis Fernández", email: "luis@termprotect.es", telefono: "600777888", ciudad: "malaga", activo: true },
];

// Window types
export const WINDOW_TYPES = [
  { id: "practicable", label: "Practicable", icon: "▫" },
  { id: "oscilobatiente", label: "Oscilobatiente", icon: "◨" },
  { id: "oscilo_2h", label: "Oscilobatiente 2 hojas", icon: "◫" },
  { id: "basculante", label: "Basculante", icon: "⬒" },
  { id: "oscilo_3h_t", label: "Oscilobatiente 3 hojas T", icon: "⬓" },
  { id: "balconera", label: "Balconera", icon: "▯" },
  { id: "balconera_alu", label: "Balconera umbral aluminio", icon: "▮" },
  { id: "puerta", label: "Puerta", icon: "🚪" },
  { id: "corredera_2h", label: "Corredera 2 hojas", icon: "↔" },
  { id: "corredera_3h", label: "Corredera 3 hojas", icon: "⇔" },
];

export const TIPOS_SIN_HOJA_PRINCIPAL = ["practicable", "oscilobatiente", "basculante", "balconera", "balconera_alu", "puerta"];

export const COLORS = [
  { id: "blanco", label: "Blanco", hex: "#F5F5F0" },
  { id: "gris_antracita", label: "Gris Antracita", hex: "#3D3D3D" },
  { id: "negro", label: "Negro", hex: "#1A1A1A" },
  { id: "nogal", label: "Nogal", hex: "#6B3A2A" },
  { id: "roble_dorado", label: "Roble Dorado", hex: "#C19A5B" },
  { id: "gris_plata", label: "Gris Plata", hex: "#A8A9AD" },
];

export const PERSIANAS = [
  { id: "monoblock", label: "Mono block" },
  { id: "mini", label: "Mini" },
  { id: "cajon_catalan", label: "Cajón catalán" },
  { id: "sin", label: "Sin persiana" },
];

export const MEDIDA_PERSIANA_OPTS = [
  { id: "cajon_incluido", label: "Medida ventana cajón incluido" },
  { id: "ventana_mas_cajon", label: "Medida ventana + cajón persiana" },
];

export const ACCIONAMIENTOS = [
  { id: "cinta", label: "Cinta" },
  { id: "motor", label: "Motor" },
];

export const TIPO_MOTOR = [
  { id: "mando", label: "Mando" },
  { id: "pulsador", label: "Pulsador" },
];

export const SENTIDOS = [
  { id: "izquierda", label: "Izquierda" },
  { id: "derecha", label: "Derecha" },
];

export const GUIAS = [
  { id: "60x72", label: "60×72" },
  { id: "60x30", label: "60×30" },
  { id: "pala_lisa", label: "Pala Lisa" },
];

export const MOSQUITEROS = [
  { id: "enrollable", label: "Enrollable" },
  { id: "plisada", label: "Plisada" },
  { id: "sin", label: "Sin mosquitera" },
];

export const TAPAJUNTAS = [
  { id: "pletina", label: "Pletina" },
  { id: "tapajuntas", label: "Tapajuntas" },
];

export const VIDRIOS = [
  { id: "transparente", label: "Transparente" },
  { id: "mate", label: "Mate" },
];

// Servicios / checklist de obra
export const SERVICIOS_OBRA = [
  { id: "montaje", label: "Incluye Montaje" },
  { id: "transporte", label: "Transporte" },
  { id: "subida_ventanas", label: "Subida de Ventanas" },
  { id: "obra_cajon", label: "Obra Cajón" },
  { id: "hueco_escalera", label: "Hueco Escalera" },
  { id: "con_cuerda", label: "Con Cuerda" },
];

// Status config
export const STATUS_CONFIG = {
  borrador: { label: "Borrador", color: "bg-muted/20 text-muted" },
  asignado: { label: "Asignado", color: "bg-primary/20 text-primary" },
  en_progreso: { label: "En progreso", color: "bg-blue-500/20 text-blue-400" },
  completado: { label: "Completado", color: "bg-success/20 text-success" },
};

// Helper functions
export const getMedidoresForCity = (cityId) =>
  USERS.filter((u) => u.role === "medidor" && (u.city === cityId || u.city === "all"));

export const getComercialesForCity = (cityId) =>
  COMERCIALES.filter((c) => c.activo && (c.ciudad === cityId || !cityId));

export const getLabel = (arr, id) => arr.find((a) => a.id === id)?.label || id || "—";
