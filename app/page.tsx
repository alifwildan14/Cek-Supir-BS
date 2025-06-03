// app/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SearchAndDisplay from '@/components/SearchAndDisplay';

export default function HomePage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.trim() || '';

  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;

      try {
        const res = await fetch(`/api/drivers/${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Unknown error');

        setDrivers(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to fetch data.');
      }
    };

    fetchData();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Cek Data Sopir &amp; Bus
