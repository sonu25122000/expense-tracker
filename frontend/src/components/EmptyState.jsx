export default function EmptyState({ icon = '🧾', title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-title">{title}</p>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
