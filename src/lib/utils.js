import { supabase } from "./supabase";

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr + "T12:00").toLocaleDateString("es-ES", {
    day: "numeric", month: "short",
  });
};

export const emptyClient = () => ({
  id: uid(), businessName: "", hubspotLink: "", name: "", address: "",
  googleMapsLink: "", phone: "", scheduledTime: "", comercialId: "",
  notas: "", budgetFileName: "", budgetUrl: "", measurement: null,
  measurementApproval: null, status: "pendiente", rescheduleNote: "",
});

export const emptyWindow = () => ({
  id: uid(), tipo: "", sentidoApertura: "", sentidoAperturaOtro: "",
  hojaPrincipal: "", hojaPrincipalOtro: "", color: "", colorOtro: "",
  ancho: "", alto: "", persiana: "", medidaPersiana: "", accionamiento: "",
  tipoMotor: "", sentidoPersiana: "", guia: "", guiaOtro: "", mosquitero: "",
  mosquiteroOtro: "", tapajuntas: "", tapajuntasObs: "", vidrio: "",
  vidrioOtro: "", ubicacion: "", accesoriosAdicionales: "", notas: "",
  audios: [], videos: [],
});

// Supabase data helpers
export const loadData = async () => {
  const { data, error } = await supabase.from("routes").select("*");
  if (error) { console.error("Error loading data:", error); return []; }
  return data || [];
};

export const saveData = async (route) => {
  const { error } = await supabase
    .from("routes")
    .upsert(route, { onConflict: "id" });
  if (error) console.error("Error saving data:", error);
};

export const SEED_DATA = [];