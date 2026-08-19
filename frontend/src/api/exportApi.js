import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getServerUrl } from './client';

function buildExportUrl(type, filters = {}) {
  const base = getServerUrl();
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.append(key, value);
  });
  const query = params.toString();
  return `${base}/api/export/${type}${query ? `?${query}` : ''}`;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportAndShare(type, filters = {}) {
  const url = buildExportUrl(type, filters);
  const ext = type === 'pdf' ? 'pdf' : 'xlsx';
  const mimeType =
    type === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Export failed (${response.status})`);
  const blob = await response.blob();
  const filename = `expenses-${Date.now()}.${ext}`;

  if (Capacitor.isNativePlatform()) {
    const base64 = await blobToBase64(blob);
    const written = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache,
    });
    await Share.share({ title: 'Expense export', url: written.uri, dialogTitle: `Share ${type.toUpperCase()}` });
    return written.uri;
  }

  if (navigator.canShare && navigator.share) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return filename;
      }
    } catch (err) {
      // fall through to plain download
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
  return filename;
}
