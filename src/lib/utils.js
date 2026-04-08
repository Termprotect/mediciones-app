export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00").toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
};

export const emptyClient = () => ({
  id: uid(),
  businessName: "",
  hubspotLink: "",
  name: "",
  address: "",
  googleMapsLink: "",
  phone: "",
  scheduledTime: "",
  comercialId: "",
  notas: "",
  budgetFileName: "",
  budgetUrl: "",
  measurement: null,
  measurementApproval: null,
  status: "pendiente",
  rescheduleNote: "",
});

export const emptyWindow = () => ({
  id: uid(),
  tipo: "",
  sentidoApertura: "",
  sentidoAperturaOtro: "",
  hojaPrincipal: "",
  hojaPrincipalOtro: "",
  color: "",
  colorOtro: "",
  ancho: "",
  alto: "",
  persiana: "",
  medidaPersiana: "",
  accionamiento: "",
  tipoMotor: "",
  sentidoPersiana: "",
  guia: "",
  guiaOtro: "",
  mosquitero: "",
  mosquiteroOtro: "",
  tapajuntas: "",
  tapajuntasObs: "",
  vidrio: "",
  vidrioOtro: "",
  ubicacion: "",
  accesoriosAdicionales: "",
  notas: "",
  audios: [],
  videos: [],
});

// Storage helpers (will be replaced by Supabase)
const STORAGE_KEY = "mediciones-v4";

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading data:", e);
  }
  return [];
};

export const saveData = (routes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  } catch (e) {
    console.error("Error saving data:", e);
  }
};

// Seed data for initial testing
export const SEED_DATA = [
  {
    id: "route1",
    date: new Date().toISOString().split("T")[0],
    city: "madrid",
    assignedTo: "med_jesus",
    status: "asignado",
    createdBy: "log_mad",
    clients: [
      {
        ...emptyClient(),
        id: "c1",
        name: "María García",
        address: "Calle Gran Vía 42, Madrid",
        googleMapsLink: "https://maps.google.com/?q=Calle+Gran+Via+42+Madrid",
        phone: "612345678",
        scheduledTime: "09:00",
        comercialId: "com1",
        notas: "Portero automático, 3ª planta",
      },
      {
        ...emptyClient(),
        id: "c2",
        name: "Pedro Martínez",
        address: "Av. de la Constitución 15, Madrid",
        googleMapsLink: "https://maps.google.com/?q=Av+Constitucion+15+Madrid",
        phone: "698765432",
        scheduledTime: "11:30",
        comercialId: "com1",
      },
    ],
  },
];
