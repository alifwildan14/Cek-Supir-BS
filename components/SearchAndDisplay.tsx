// components/SearchAndDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Driver {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string; // Akan tetap string karena sudah dikonversi di server
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

  // Inisialisasi searchQuery dari URL searchParams
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [drivers, setDrivers] = useState<Driver[]>(driversInitialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  // Effect untuk mengambil data saat query berubah (di sisi klien)
  useEffect(() => {
    // Hanya fetch jika searchQuery berubah atau ini render pertama kali dan ada query
    if (searchQuery !== searchParams.get('query')) {
        // Update URL query parameter
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
          newSearchParams.set('query', searchQuery);
        } else {
          newSearchParams.delete('query');
        }
        router.push(`<span class="math-inline">\{pathname\}?</span>{newSearchParams.toString()}`);
    }

    // Jika ada data awal dari server, jangan fetch lagi
    if (driversInitialData.length > 0 && searchQuery === '') {
        setDrivers(driversInitialData);
        setError(initialError);
        setLoading(false);
        return;
    }

    // Fetch data dari API Route hanya jika ada searchQuery
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

    // Fetch hanya jika ada query atau jika ini render pertama kali dan server tidak memberikan data awal
    // Ini akan memicu fetch setiap kali `searchQuery` berubah dari input user
    const debounceTimeout = setTimeout(() => {
        if (searchQuery.length > 0) { // Hanya fetch jika query tidak kosong
            fetchDrivers();
        } else {
            setDrivers(driversInitialData); // Kembali ke data awal jika query kosong
        }
    }, 300); // Debounce untuk mencegah terlalu banyak request

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, searchParams, router, pathname, driversInitialData, initialError]); // Tambahkan dependensi

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

      {!loading && !error && drivers.length === 0 && searchQuery && (
        <p className="text-center text-gray-600">Tidak ada data ditemukan untuk "{searchQuery}".</p>
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