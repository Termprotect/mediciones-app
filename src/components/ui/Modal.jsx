import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-surface border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
