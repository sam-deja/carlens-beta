import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import CameraCapture from '../components/CameraCapture';
import CarResult from '../components/CarResult';

export default function Home() {
  const { getToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [specs, setSpecs] = useState(null);
  const [mods, setMods] = useState(null);
  const [funFacts, setFunFacts] = useState(null);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [error, setError] = useState(null);

  function handleCapture(file) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setSpecs(null);
    setMods(null);
    setFunFacts(null);
    setError(null);
  }

  async function streamDetails(id, token) {
    setLoadingSpecs(true);
    try {
      const response = await fetch(`/api/stream/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const { type, data } = JSON.parse(line.slice(6));
            if (type === 'specs') setSpecs(data);
            if (type === 'mods') setMods(data);
            if (type === 'fun_facts') setFunFacts(data);
          } catch {}
        }
      }
    } catch (err) {
      console.error('Stream error:', err);
    } finally {
      setLoadingSpecs(false);
    }
  }

  async function handleIdentify() {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSpecs(null);
    setMods(null);
    setFunFacts(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to identify car');

      setResult(data);
      setLoading(false);

      if (data.id) streamDetails(data.id, token);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Identify a Car</h1>

      <CameraCapture onCapture={handleCapture} />

      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl} alt="Selected car" className="w-full rounded-xl object-cover max-h-64" />
        </div>
      )}

      {previewUrl && !loading && !result && (
        <button
          onClick={handleIdentify}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Identify Car
        </button>
      )}

      {loading && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Identifying car...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6">
          <CarResult
            {...result}
            specs={specs}
            mods={mods}
            funFacts={funFacts}
            loadingDetails={loadingSpecs}
          />
        </div>
      )}
    </div>
  );
}
