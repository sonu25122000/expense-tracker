export default function SummaryCard({ label, value, sublabel, icon }) {
  return (
    <div className="summary-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon && (
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <p className="summary-label" style={{ margin: 0 }}>
          {label}
        </p>
      </div>
      <p className="summary-value">{value}</p>
      {sublabel ? <p className="summary-sublabel">{sublabel}</p> : null}
    </div>
  );
}
