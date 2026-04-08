import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { LOGO_ICON_URI } from "../../lib/logo";
import {
  LayoutDashboard,
  CalendarDays,
  LogOut,
  Menu,
  Bell,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Mis Mediciones", icon: LayoutDashboard },
  { id: "calendario", label: "Mi Calendario", icon: CalendarDays },
];

export default function MedidorLayout({ activePage, onNavigate, children, notifications = 0 }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`bg-dark border-r border-border flex flex-col transition-all duration-200 flex-shrink-0 ${collapsed ? "w-16" : "w-60"}`}>
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div className="bg-success/10 border border-success/30 rounded-lg px-3 py-1 mb-3 text-center">
              <span className="text-[10px] font-bold text-success uppercase tracking-wider">Medidor</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <img src={LOGO_ICON_URI} alt="TermProtect" className="w-9 h-9 rounded-xl flex-shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">TermProtect</div>
                <div className="text-[10px] text-muted">Sistema de Mediciones</div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2">
          {!collapsed && (
            <div className="px-3 py-2 text-[10px] font-bold text-muted uppercase tracking-wider">Principal</div>
          )}
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    active ? "bg-primary text-dark" : "text-muted hover:text-white hover:bg-surface"
                  } ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : undefined}>
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted hover:text-danger hover:bg-surface transition-all cursor-pointer">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-dark/50 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-bold text-white">
            {NAV_ITEMS.find((n) => n.id === activePage)?.label || "Mis Mediciones"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-muted hover:text-white hover:bg-surface transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">{notifications}</span>
              )}
            </button>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-dark font-bold text-sm">{user?.name?.charAt(0) || "U"}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
