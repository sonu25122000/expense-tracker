import { useRef } from 'react';

// file: a File object for a newly picked image, null if removed/none.
// existingUrl: URL of an already-saved receipt (edit mode).
export default function ReceiptPicker({ file, existingUrl, onChange }) {
  const inputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;

  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 8px' }}>
        Receipt / bill photo (optional)
      </p>
      {previewUrl ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={previewUrl}
            alt="Receipt preview"
            style={{ width: 120, height: 120, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove receipt"
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button type="button" className="button button-secondary" onClick={() => inputRef.current?.click()}>
          📷 Add Receipt Photo
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) onChange(picked);
          e.target.value = '';
        }}
      />
    </div>
  );
}
