// components/SearchAndDisplay.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface Driver {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string; // Assuming this is a date string like YYYY-MM-DD
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

  // Initialize searchQuery from URL or default to empty string
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('query') || '');
  const [drivers, setDrivers] = useState<Driver[]>(driversInitialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  // Effect to update drivers list when initial data changes (e.g., from server-side props)
  useEffect(() => {
    setDrivers(driversInitialData);
    setError(initialError);
    // Set loading to false if we received initial data, indicating server-side fetch is done.
    // This prevents the "Memuat data..." from showing if data is already there from the server.
    if (driversInitialData.length > 0 || initialError) {
        setLoading(false);
    }
  }, [driversInitialData, initialError]);


  // Debounced fetch function
  const fetchDrivers = useCallback(async (query: string) => {
    if (!query) { // Do not fetch if query is empty
      setDrivers([]);
      setError(null);
      setLoading(false);
      // Update URL to remove query param if search is cleared
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete('query');
      router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/drivers?query=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      const data: Driver[] = await res.json();
      setDrivers(data);
    } catch (e: unknown) { // Type error as unknown
      if (e instanceof Error) {
        setError(`Failed to fetch data: ${e.message}`);
      } else {
        setError('Failed to fetch data due to an unknown error. Please try again.');
      }
      console.error(e);
      setDrivers([]); // Clear drivers on error
    } finally {
      setLoading(false);
    }
  }, [router, pathname, searchParams]); // searchParams is included because new URLSearchParams(searchParams.toString()) uses it


  // Effect for debouncing and fetching
  useEffect(() => {
    // Update URL query parameter
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (searchQuery) {
      newSearchParams.set('query', searchQuery);
    } else {
      newSearchParams.delete('query');
    }
    // Update URL without triggering a full page reload, only if it's different
    // This check prevents an infinite loop with router.push
    if (`${pathname}?${newSearchParams.toString()}` !== `${pathname}?${searchParams.toString()}`) {
        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    }

    // Debounce logic
    if (searchQuery) {
      const debounceTimeout = setTimeout(() => {
        fetchDrivers(searchQuery);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(debounceTimeout);
    } else {
      // If searchQuery becomes empty, clear results and loading state
      setDrivers([]);
      setError(null);
      setLoading(false);
    }
  }, [searchQuery, fetchDrivers, pathname, router, searchParams]);


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Function to format date string, assuming kirExpiration is YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
        return 'Invalid date'; // Or handle as per your requirement
    }
    try {
        // Assuming dateString is already in a format that toLocaleDateString can parse
        // or it's a full ISO string. If it's just YYYY-MM-DD, some browsers might struggle.
        // It's safer if kirExpiration is a full ISO string from the server.
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (parseError) {
        console.error("Error formatting date:", dateString, parseError);
        return dateString; // Fallback to original string if parsing fails
    }
  };

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama sopir atau plat nomor..."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search drivers and bus plates"
        />
      </div>

      {loading && <p className="text-center text-blue-600 py-4">Memuat data...</p>}
      {error && <p className="text-center text-red-600 py-4 bg-red-50 p-3 rounded-md">{error}</p>}

      {!loading && !error && drivers.length === 0 && searchQuery && (
        // Corrected line for unescaped entities:
        <p className="text-center text-gray-600 py-4">{`Tidak ada data ditemukan untuk "${searchQuery}".`}</p>
        // Alternative using &quot;
        // <p className="text-center text-gray-600">Tidak ada data ditemukan untuk &quot;{searchQuery}&quot;.</p>
      )}
      {!loading && !error && drivers.length === 0 && !searchQuery && (
        <p className="text-center text-gray-500 py-4 italic">
          Masukkan nama sopir atau plat nomor pada kolom pencarian di atas.
        </p>
      )}

      {!loading && !error && drivers.length > 0 && (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr className="text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 border-b border-gray-200">Nama Sopir</th>
                <th className="py-3 px-6 border-b border-gray-200">Plat Nomor</th>
                <th className="py-3 px-6 border-b border-gray-200">Masa Berlaku KIR</th>
                <th className="py-3 px-6 border-b border-gray-200">Tahun Bus</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
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
