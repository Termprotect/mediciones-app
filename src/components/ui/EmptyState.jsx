export default function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-muted text-sm font-medium">{text}</p>
    </div>
  );
}
