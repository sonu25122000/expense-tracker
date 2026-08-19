import { useNavigate } from 'react-router-dom';

export default function PageHeader({ title, back = false }) {
  const navigate = useNavigate();
  return (
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {back && (
          <button
            type="button"
            className="icon-button"
            style={{ fontSize: 20 }}
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            ←
          </button>
        )}
        <h1 className="page-title">{title}</h1>
      </div>
    </div>
  );
}
