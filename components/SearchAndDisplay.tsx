// components/SearchAndDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
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

  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [drivers, setDrivers] = useState<Driver[]>(driversInitialData);
  const [loading, setLoading] = useState(false); // Default false, karena tidak ada fetch awal
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    // Perbarui URL query parameter setiap kali searchQuery berubah
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      newSearchParams.set('query', searchQuery);
    } else {
      newSearchParams.delete('query');
    }
    // PASTIKAN BARIS INI BENAR, TANPA KARAKTER ANEH/HTML
    router.push(`${pathname}?${newSearchParams.toString()}`);

    // HANYA FETCH DATA JIKA ADA searchQUERY dan itu BUKAN fetch awal dari server
    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/drivers?query=${searchQuery}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: Driver[] = await res.json();
        setDrivers(data);
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Ini adalah kondisi utama: hanya fetch jika searchQuery tidak kosong
    if (searchQuery) {
      const debounceTimeout = setTimeout(() => {
        fetchDrivers();
      }, 300); // Debounce untuk mencegah terlalu banyak request

      return () => clearTimeout(debounceTimeout);
    } else {
      // Jika searchQuery kosong, reset daftar driver dan error
      setDrivers([]);
      setError(null);
      setLoading(false);
    }

  }, [searchQuery, searchParams, router, pathname]); // Hapus driversInitialData dan initialError dari dependency array

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

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
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Tampilkan pesan instruksi atau tidak ada hasil */}
      {!loading && !error && drivers.length === 0 && searchQuery && (
        <p className="text-center text-gray-600">{`Tidak ada data ditemukan untuk "${searchQuery}".`}</p> // <--- PASTIKAN INI
      )}
      {!loading && !error && drivers.length === 0 && !searchQuery && (
        <p className="text-center text-gray-600">Masukkan nama sopir atau plat nomor untuk mencari.</p>
      )}


      {!loading && !error && drivers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 border-b border-gray-200">Nama Sopir</th>
                <th className="py-3 px-6 border-b border-gray-200">Plat Nomor</th>
                <th className="py-3 px-6 border-b border-gray-200">Masa Berlaku KIR</th>
                <th className="py-3 px-6 border-b border-gray-200">Tahun Bus</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 whitespace-nowrap">{driver.driverName}</td>
                  <td className="py-3 px-6">{driver.plateNumber}</td>
                  <td className="py-3 px-6">{new Date(driver.kirExpiration).toLocaleDateString('id-ID')}</td>
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