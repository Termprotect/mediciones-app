import { useState } from "react";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import Field from "../../components/ui/Field";
import { Save, Check } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    duracion_medicion: "45",
    max_ventanas: "40",
    tiempo_desplazamiento: "30",
    horario_inicio: "08:00",
    horario_fin: "18:00",
    email_notificaciones: "admin@termprotect.es",
  });
  const [saved, setSaved] = useState(false);

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted text-sm mt-1">Parámetros generales del sistema</p>
        </div>
        <Button onClick={handleSave} variant={saved ? "success" : "primary"}>
          {saved ? <><Check className="w-4 h-4" /> Guardado</> : <><Save className="w-4 h-4" /> Guardar</>}
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Calendario y Mediciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Duración por medición (minutos)">
              <TextInput type="number" value={settings.duracion_medicion} onChange={(v) => update("duracion_medicion", v)} suffix="min" />
            </Field>
            <Field label="Tiempo desplazamiento (minutos)">
              <TextInput type="number" value={settings.tiempo_desplazamiento} onChange={(v) => update("tiempo_desplazamiento", v)} suffix="min" />
            </Field>
            <Field label="Máximo ventanas por medición">
              <TextInput type="number" value={settings.max_ventanas} onChange={(v) => update("max_ventanas", v)} />
            </Field>
            <Field label="Email de notificaciones">
              <TextInput type="email" value={settings.email_notificaciones} onChange={(v) => update("email_notificaciones", v)} />
            </Field>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Horario Laboral</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Hora de inicio">
              <TextInput type="time" value={settings.horario_inicio} onChange={(v) => update("horario_inicio", v)} />
            </Field>
            <Field label="Hora de fin">
              <TextInput type="time" value={settings.horario_fin} onChange={(v) => update("horario_fin", v)} />
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}
