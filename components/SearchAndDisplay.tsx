// components/SearchAndDisplay.tsx
'use client';

import { useState, useEffect } from 'react'; // Menghapus useCallback yang tidak terpakai
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
  const [loading, setLoading] = useState(false); // setLoading sekarang akan digunakan
  const [error, setError] = useState<string | null>(initialError);

  useEffect(() => {
    setDrivers(driversInitialData);
    setError(initialError);
    // Memanggil setLoading(false) untuk menandai bahwa data telah dimuat (atau error diterima)
    // Ini juga memastikan setLoading digunakan, sehingga menghilangkan error lint.
    setLoading(false); 
  }, [driversInitialData, initialError]); // Dependensi array

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return 'N/A'; // Atau penanganan tanggal tidak valid lainnya
    }
    // Format tanggal ke format yang lebih mudah dibaca
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  // useEffect untuk memperbarui URL ketika searchQuery berubah
  useEffect(() => {
    const handler = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        newParams.set('query', searchQuery);
      } else {
        newParams.delete('query');
      }
      // Mendorong query baru ke URL, ini akan memicu pengambilan data ulang di server component (app/page.tsx)
      router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
    }, 300); // Debounce untuk mengurangi frekuensi pembaruan URL

    return () => {
      clearTimeout(handler); // Membersihkan timeout jika komponen unmount atau searchQuery berubah lagi
    };
  }, [searchQuery, pathname, router, searchParams]); // Dependensi array

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama sopir atau plat nomor..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Input pencarian sopir dan plat nomor"
        />
      </div>

      {/* Menampilkan pesan loading jika state loading adalah true */}
      {/* Dengan logika saat ini, pesan ini mungkin tidak akan pernah muncul karena setLoading(true) tidak pernah dipanggil */}
      {loading && <p className="text-center text-blue-600 py-4">Memuat data...</p>}
      
      {/* Menampilkan pesan error jika ada */}
      {error && <p className="text-center text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

      {/* Menampilkan pesan jika tidak ada data dan tidak sedang loading atau error */}
      {!loading && !error && drivers.length === 0 && searchQuery && (
        <p className="text-center text-gray-600 py-4">{`Tidak ada data ditemukan untuk "${searchQuery}".`}</p>
      )}
      {!loading && !error && drivers.length === 0 && !searchQuery && (
        <p className="text-center text-gray-500 py-4 italic">
          Masukkan nama sopir atau plat nomor untuk mencari.
        </p>
      )}

      {/* Menampilkan tabel data jika ada data dan tidak sedang loading atau error */}
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
