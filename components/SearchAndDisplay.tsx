// components/SearchAndDisplay.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Driver {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string;
  busYear: number;
}

interface SearchAndDisplayProps {
  driversInitialData: Driver[];
  initialError: string | null;
}

export default function SearchAndDisplay({ driversInitialData, initialError }: SearchAndDisplayProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('query') || '');
  const [drivers, setDrivers] = useState<Driver[]>(driversInitialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    setDrivers(driversInitialData);
    setError(initialError);
  }, [driversInitialData, initialError]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return 'N/A';
    }
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        newParams.set('query', searchQuery);
      } else {
        newParams.delete('query');
      }
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, pathname, router, searchParams]);

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama sopir atau plat nomor..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {loading && <p className="text-center text-blue-600">Memuat data...</p>}
      {error && <p className="text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

      {!loading && !error && drivers.length === 0 && searchQuery && (
        <p className="text-center text-gray-600 py-4">{`Tidak ada data ditemukan untuk "${searchQuery}".`}</p>
      )}
      {!loading && !error && drivers.length === 0 && !searchQuery && (
        <p className="text-center text-gray-500 py-4 italic">
          Masukkan nama sopir atau plat nomor untuk mencari.
        </p>
      )}

      {!loading && !error && drivers.length > 0 && (
        <div className="overflow-x-auto shadow rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-600 uppercase text-sm">
                <th className="py-3 px-6 border-b">Nama Sopir</th>
                <th className="py-3 px-6 border-b">Plat Nomor</th>
                <th className="py-3 px-6 border-b">Masa Berlaku KIR</th>
                <th className="py-3 px-6 border-b">Tahun Bus</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 whitespace-nowrap">{driver.driverName}</td>
                  <td className="py-3 px-6">{driver.plateNumber}</td>
                  <td className="py-3 px-6">{formatDate(driver.kirExpiration)}</td>
                  <td className="py-3 px-6">{driver.busYear}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
