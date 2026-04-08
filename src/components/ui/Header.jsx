import { ArrowLeft, LogOut } from "lucide-react";
import Button from "./Button";

export default function Header({ title, subtitle, user, onLogout, onBack }) {
  return (
    <header className="bg-dark border-b border-border px-4 sm:px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="text-muted hover:text-white transition-colors p-1 cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{title}</h1>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {user && onLogout && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-sm">
              {user.name?.charAt(0)}
            </div>
            <button onClick={onLogout} className="text-muted hover:text-danger transition-colors p-1 cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
