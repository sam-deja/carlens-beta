import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import HistoryCard from '../components/HistoryCard';

export default function History() {
  const { getToken } = useAuth();
  const [lookups, setLookups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = await getToken();
        const res = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
        setLookups(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [getToken]);

  async function handleDelete(id) {
    try {
      const token = await getToken();
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setLookups((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center mt-16">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (lookups.length === 0) {
    return (
      <div className="text-center mt-16 text-slate-400">
        No lookups yet. Go identify some cars!
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">History</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {lookups.map((lookup) => (
          <HistoryCard key={lookup.id} lookup={lookup} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
