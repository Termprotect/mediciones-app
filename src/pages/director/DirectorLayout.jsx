import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { LOGO_ICON_URI } from "../../lib/logo";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Ruler,
  ClipboardCheck,
  CheckCircle2,
  RefreshCw,
  Users,
  Package,
  MapPin,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PRINCIPAL_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "calendario", label: "Calendario", icon: CalendarDays },
  { id: "jornadas", label: "Jornadas", icon: ClipboardList },
  { id: "mediciones", label: "Mediciones", icon: ClipboardCheck },
  { id: "medidores", label: "Medidores", icon: Ruler },
];

const ADMIN_EXTRA_NAV = [
  { id: "aprobaciones", label: "Aprobaciones", icon: CheckCircle2 },
  { id: "reprogramaciones", label: "Reprogramaciones", icon: RefreshCw },
];

const ADMIN_NAV = [
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "catalogo", label: "Catálogo", icon: Package },
  { id: "ciudades", label: "Ciudades", icon: MapPin },
  { id: "comerciales", label: "Comerciales", icon: Briefcase },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

export default function DirectorLayout({
  activePage,
  onNavigate,
  children,
  isAdmin,
  notifications = 0,
}) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`bg-dark border-r border-border flex flex-col transition-all duration-200 flex-shrink-0 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {/* Badge + Logo */}
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-1 mb-3 text-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Dashboard Director
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <img src={LOGO_ICON_URI} alt="TermProtect" className="w-9 h-9 rounded-xl flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">
                  TermProtect
                </div>
                <div className="text-[10px] text-muted">
                  Sistema de Mediciones
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Principal Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 py-2 text-[10px] font-bold text-muted uppercase tracking-wider">
              Principal
            </div>
          )}
          <div className="space-y-0.5">
            {PRINCIPAL_NAV.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? "bg-primary text-dark"
                      : "text-muted hover:text-white hover:bg-surface"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Gestión Nav (only for admin) */}
          {isAdmin && (
            <>
              {!collapsed && (
                <div className="px-3 py-2 mt-4 text-[10px] font-bold text-muted uppercase tracking-wider">
                  Gestión
                </div>
              )}
              {collapsed && <div className="border-t border-border my-2" />}
              <div className="space-y-0.5">
                {ADMIN_EXTRA_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? "bg-primary text-dark"
                          : "text-muted hover:text-white hover:bg-surface"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Admin Nav (only for admin role) */}
          {isAdmin && (
            <>
              {!collapsed && (
                <div className="px-3 py-2 mt-4 text-[10px] font-bold text-muted uppercase tracking-wider">
                  Administración
                </div>
              )}
              {collapsed && <div className="border-t border-border my-2" />}
              <div className="space-y-0.5">
                {ADMIN_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? "bg-primary text-dark"
                          : "text-muted hover:text-white hover:bg-surface"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border space-y-1">
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
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-dark/50 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-bold text-white">
            {PRINCIPAL_NAV.find((n) => n.id === activePage)?.label ||
              ADMIN_EXTRA_NAV.find((n) => n.id === activePage)?.label ||
              ADMIN_NAV.find((n) => n.id === activePage)?.label ||
              "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            {/* User Avatar */}
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-dark font-bold text-sm">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
