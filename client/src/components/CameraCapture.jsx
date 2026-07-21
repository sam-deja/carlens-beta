import React, { useRef } from 'react';

export default function CameraCapture({ onCapture }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      e.target.value = '';
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl py-6 px-4 transition-colors active:scale-95"
      >
        <span className="text-3xl">📷</span>
        <span className="text-sm font-medium text-slate-200">Take Photo</span>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleChange}
        />
      </button>

      <button
        type="button"
        onClick={() => galleryRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl py-6 px-4 transition-colors active:scale-95"
      >
        <span className="text-3xl">🖼️</span>
        <span className="text-sm font-medium text-slate-200">From Gallery</span>
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </button>
    </div>
  );
}
