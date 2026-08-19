export default function SummaryCard({ label, value, sublabel, icon }) {
  return (
    <div className="summary-card">
      {icon && (
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'var(--primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          {icon}
        </div>
      )}
      <p className="summary-label">{label}</p>
      <p className="summary-value">{value}</p>
      {sublabel ? <p className="summary-sublabel">{sublabel}</p> : null}
    </div>
  );
}
