import React, { useState } from 'react';
import CarResult from './CarResult';

export default function HistoryCard({ lookup, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  function handleDelete(e) {
    e.stopPropagation();
    if (window.confirm(`Delete lookup for ${lookup.car_year} ${lookup.car_make} ${lookup.car_model}?`)) {
      onDelete(lookup.id);
    }
  }

  const result = {
    make: lookup.car_make,
    model: lookup.car_model,
    year: lookup.car_year,
    confidence: lookup.car_confidence,
    notes: lookup.car_notes,
    specs: lookup.specs,
    imageUrl: lookup.image_url,
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div
        className="cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {lookup.image_url && (
          <img
            src={lookup.image_url}
            alt={`${lookup.car_year} ${lookup.car_make} ${lookup.car_model}`}
            className="w-full h-40 object-cover"
          />
        )}
        {!lookup.image_url && (
          <div className="w-full h-40 bg-slate-700 flex items-center justify-center">
            <span className="text-slate-500 text-4xl">🚗</span>
          </div>
        )}

        <div className="p-3 flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-white text-sm">
              {lookup.car_year} {lookup.car_make} {lookup.car_model}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {new Date(lookup.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-xs">{expanded ? '▲' : '▼'}</span>
            <button
              onClick={handleDelete}
              className="text-slate-500 hover:text-red-400 transition-colors text-lg leading-none"
              title="Delete"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-700">
          <CarResult {...result} />
        </div>
      )}
    </div>
  );
}
