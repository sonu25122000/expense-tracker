import { useRef } from 'react';

// file: a File object for a newly picked image, null if removed/none.
// existingUrl: URL of an already-saved receipt (edit mode).
export default function ReceiptPicker({ file, existingUrl, onChange }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;

  const handlePicked = (e) => {
    const picked = e.target.files?.[0];
    if (picked) onChange(picked);
    e.target.value = '';
  };

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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button button-secondary"
            style={{ flex: '1 1 150px' }}
            onClick={() => galleryInputRef.current?.click()}
          >
            🖼️ Choose from Gallery
          </button>
          <button
            type="button"
            className="button button-secondary"
            style={{ flex: '1 1 150px' }}
            onClick={() => cameraInputRef.current?.click()}
          >
            📷 Take Photo
          </button>
        </div>
      )}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handlePicked}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handlePicked}
      />
    </div>
  );
}
