export default function SummaryCard({ label, value, sublabel }) {
  return (
    <div className="summary-card">
      <p className="summary-label">{label}</p>
      <p className="summary-value">{value}</p>
      {sublabel ? <p className="summary-sublabel">{sublabel}</p> : null}
    </div>
  );
}
