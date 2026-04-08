import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Users, Package, MapPin, Briefcase, Settings, FileText, LogOut, LayoutDashboard, ChevronLeft, Menu } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import UsersPage from "./UsersPage";
import CatalogPage from "./CatalogPage";
import CitiesPage from "./CitiesPage";
import ComercialesPage from "./ComercialesPage";
import SettingsPage from "./SettingsPage";
import AuditPage from "./AuditPage";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Usuarios", icon: Users },
  { id: "catalog", label: "Catálogo", icon: Package },
  { id: "cities", label: "Ciudades", icon: MapPin },
  { id: "comerciales", label: "Comerciales", icon: Briefcase },
  { id: "settings", label: "Configuración", icon: Settings },
  { id: "audit", label: "Actividad", icon: FileText },
];

const PAGE_MAP = {
  dashboard: AdminDashboard,
  users: UsersPage,
  catalog: CatalogPage,
  cities: CitiesPage,
  comerciales: ComercialesPage,
  settings: SettingsPage,
  audit: AuditPage,
};

export default function AdminLayout({ onExitAdmin }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  const PageComponent = PAGE_MAP[activePage] || AdminDashboard;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`bg-dark border-r border-border flex flex-col transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}>
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-dark font-extrabold text-sm">TP</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-bold text-white truncate">TermProtect</div>
              <div className="text-[10px] text-muted">Administración</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-dark"
                    : "text-muted hover:text-white hover:bg-surface"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-1">
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-primary hover:bg-surface transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Volver a la app</span>}
            </button>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-danger hover:bg-surface transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-5xl">
          <PageComponent />
        </div>
      </main>
    </div>
  );
}
