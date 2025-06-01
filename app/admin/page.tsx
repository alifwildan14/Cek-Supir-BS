// app/admin/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Define interfaces for API error shapes
interface ApiErrorWithMessage {
  message: string;
  [key: string]: unknown; // Allow other properties
}

interface ApiErrorWithDetails {
  details: string;
  [key: string]: unknown; // Allow other properties
}

// Type predicate functions to check error shapes
function isApiErrorWithMessage(error: unknown): error is ApiErrorWithMessage {
  return typeof error === 'object' && error !== null && 'message' in error && typeof (error as ApiErrorWithMessage).message === 'string';
}

function isApiErrorWithDetails(error: unknown): error is ApiErrorWithDetails {
  return typeof error === 'object' && error !== null && 'details' in error && typeof (error as ApiErrorWithDetails).details === 'string';
}


interface Driver {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string; // Will be a string (e.g., YYYY-MM-DD from date input, or ISO string from API)
  busYear: number;
}

// Interface for the new driver form state, where all fields can be strings initially
interface NewDriverForm {
  driverName: string;
  plateNumber: string;
  kirExpiration: string; // YYYY-MM-DD from date input
  busYear: string;       // String from number input, to be parsed
}

// Interface for the editing driver state, kirExpiration and busYear can be string during edit
interface EditingDriverForm extends Omit<Driver, 'busYear' | 'kirExpiration'> {
  kirExpiration: string; // YYYY-MM-DD for date input
  busYear: string | number; // Can be string from input, or number
}


export default function AdminDashboardPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null); // For general notifications

  const [editingDriver, setEditingDriver] = useState<EditingDriverForm | null>(null);
  const [newDriver, setNewDriver] = useState<NewDriverForm>({
    driverName: '',
    plateNumber: '',
    kirExpiration: '', // Expects YYYY-MM-DD
    busYear: '',       // Expects string number
  });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null); // For delete confirmation

  const router = useRouter();

  // Function to fetch all driver data
  const fetchAllDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Clear notification on new fetch
    setNotification(null);
    try {
      const res = await fetch('/api/drivers');
      if (!res.ok) {
        // Try to parse error response from API
        const errorData = await res.json().catch(() => null);
        if (errorData && isApiErrorWithDetails(errorData)) throw errorData;
        if (errorData && isApiErrorWithMessage(errorData)) throw errorData;
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Driver[] = await res.json();
      setDrivers(data);
    } catch (err: unknown) {
      let errorMessage = 'Gagal mengambil data. Silakan coba lagi.';
      if (err instanceof Error) {
        errorMessage = `Gagal mengambil data: ${err.message}`;
      } else if (isApiErrorWithDetails(err)) {
        errorMessage = `Gagal mengambil data: ${err.details}`;
      } else if (isApiErrorWithMessage(err)) {
        errorMessage = `Gagal mengambil data: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Gagal mengambil data: ${err}`;
      }
      setError(errorMessage);
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies needed if it's stable

  useEffect(() => {
    // Basic client-side auth check
    const isAuthenticated = document.cookie.includes('isAuthenticated=true');
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchAllDrivers();
  }, [router, fetchAllDrivers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, formType: 'new' | 'edit') => {
    const { name, value } = e.target;
    setNotification(null); // Clear notification on input change

    if (formType === 'new') {
      setNewDriver(prev => ({ ...prev, [name]: value }));
    } else if (editingDriver) {
      setEditingDriver(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null); // Clear previous notifications

    if (!newDriver.driverName || !newDriver.plateNumber || !newDriver.kirExpiration || !newDriver.busYear) {
      setNotification('Semua kolom formulir tambah data harus diisi!');
      return;
    }

    const busYearParsed = parseInt(newDriver.busYear);
    if (isNaN(busYearParsed) || busYearParsed <= 1900 || busYearParsed > new Date().getFullYear() + 5) {
        setNotification('Tahun bus tidak valid.');
        return;
    }
    if (new Date(newDriver.kirExpiration).toString() === "Invalid Date") {
        setNotification('Tanggal Masa Berlaku KIR tidak valid.');
        return;
    }


    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: newDriver.driverName,
          plateNumber: newDriver.plateNumber,
          kirExpiration: new Date(newDriver.kirExpiration).toISOString(), // Ensure ISO format
          busYear: busYearParsed,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData && isApiErrorWithDetails(errorData)) throw errorData;
        if (errorData && isApiErrorWithMessage(errorData)) throw errorData;
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setNewDriver({ driverName: '', plateNumber: '', kirExpiration: '', busYear: '' }); // Reset form
      setNotification('Data berhasil ditambahkan!');
      await fetchAllDrivers(); // Refresh list
    } catch (err: unknown) {
      let errorMessage = 'Gagal menambahkan data.';
      if (err instanceof Error) {
        errorMessage = `Gagal menambahkan data: ${err.message}`;
      } else if (isApiErrorWithDetails(err)) {
        errorMessage = `Gagal menambahkan data: ${err.details}`;
      } else if (isApiErrorWithMessage(err)) {
        errorMessage = `Gagal menambahkan data: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Gagal menambahkan data: ${err}`;
      }
      setError(errorMessage); // Set error state to display in UI
      console.error('Error adding driver:', err);
    }
  };

  const handleEditClick = (driver: Driver) => {
    setNotification(null);
    setError(null);
    setEditingDriver({
      ...driver,
      kirExpiration: driver.kirExpiration.split('T')[0], // Format to YYYY-MM-DD for input type="date"
      busYear: String(driver.busYear), // Keep as string for form input consistency
    });
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    setNotification(null);

    const busYearParsed = parseInt(String(editingDriver.busYear)); // Ensure busYear is parsed from string
    if (isNaN(busYearParsed) || busYearParsed <= 1900 || busYearParsed > new Date().getFullYear() + 5) {
        setNotification('Tahun bus tidak valid untuk pembaruan.');
        return;
    }
     if (new Date(editingDriver.kirExpiration).toString() === "Invalid Date") {
        setNotification('Tanggal Masa Berlaku KIR tidak valid untuk pembaruan.');
        return;
    }

    try {
      const res = await fetch(`/api/drivers/${editingDriver._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverName: editingDriver.driverName,
          plateNumber: editingDriver.plateNumber,
          kirExpiration: new Date(editingDriver.kirExpiration).toISOString(),
          busYear: busYearParsed,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData && isApiErrorWithDetails(errorData)) throw errorData;
        if (errorData && isApiErrorWithMessage(errorData)) throw errorData;
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setEditingDriver(null);
      setNotification('Data berhasil diperbarui!');
      await fetchAllDrivers();
    } catch (err: unknown) {
      let errorMessage = 'Gagal memperbarui data.';
      if (err instanceof Error) {
        errorMessage = `Gagal memperbarui data: ${err.message}`;
      } else if (isApiErrorWithDetails(err)) {
        errorMessage = `Gagal memperbarui data: ${err.details}`;
      } else if (isApiErrorWithMessage(err)) {
        errorMessage = `Gagal memperbarui data: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Gagal memperbarui data: ${err}`;
      }
      setError(errorMessage);
      console.error('Error updating driver:', err);
    }
  };
  
  // Renamed original handleDeleteDriver to this, to be called after confirmation
  const executeDeleteDriver = async (id: string) => {
    setNotification(null);
    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData && isApiErrorWithDetails(errorData)) throw errorData;
        if (errorData && isApiErrorWithMessage(errorData)) throw errorData;
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setNotification('Data berhasil dihapus!');
      await fetchAllDrivers();
    } catch (err: unknown) {
      let errorMessage = 'Gagal menghapus data.';
      if (err instanceof Error) {
        errorMessage = `Gagal menghapus data: ${err.message}`;
      } else if (isApiErrorWithDetails(err)) {
        errorMessage = `Gagal menghapus data: ${err.details}`;
      } else if (isApiErrorWithMessage(err)) {
        errorMessage = `Gagal menghapus data: ${err.message}`;
      } else if (typeof err === 'string') {
        errorMessage = `Gagal menghapus data: ${err}`;
      }
      setError(errorMessage);
      console.error('Error deleting driver:', err);
    } finally {
        setConfirmingDeleteId(null); // Always reset confirmation state
    }
  };

  const handleLogout = () => {
    document.cookie = "isAuthenticated=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    router.push('/login');
  };

  // Helper to format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString; // Fallback
    }
  };


  if (loading && drivers.length === 0) return <p className="text-center mt-8 text-lg text-gray-600">Memuat data admin...</p>;
  // Don't show global error if there's a more specific notification or if it's just a form validation error
  // Error state will primarily be for fetch/submit errors.
  // {error && <p className="text-center text-red-600 mt-8 bg-red-100 p-3 rounded-md">Error: {error}</p>}

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Logout
          </button>
        </div>

        {/* Global Notification Area */}
        {notification && (
          <div className={`p-4 mb-6 rounded-md text-white ${error ? 'bg-red-500' : 'bg-blue-500'}`}>
            {notification}
            <button onClick={() => setNotification(null)} className="float-right font-bold">X</button>
          </div>
        )}
         {error && (
          <div className="p-4 mb-6 rounded-md text-white bg-red-500">
            Error: {error}
            <button onClick={() => setError(null)} className="float-right font-bold">X</button>
          </div>
        )}


        {/* Form Tambah Data */}
        <div className="mb-10 p-6 bg-gray-50 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Tambah Data Baru</h2>
            <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div>
                <label htmlFor="addDriverName" className="block text-gray-700 text-sm font-bold mb-2">Nama Sopir</label>
                <input type="text" id="addDriverName" name="driverName" className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={newDriver.driverName} onChange={(e) => handleInputChange(e, 'new')} required />
            </div>
            <div>
                <label htmlFor="addPlateNumber" className="block text-gray-700 text-sm font-bold mb-2">Plat Nomor</label>
                <input type="text" id="addPlateNumber" name="plateNumber" className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={newDriver.plateNumber} onChange={(e) => handleInputChange(e, 'new')} required />
            </div>
            <div>
                <label htmlFor="addKirExpiration" className="block text-gray-700 text-sm font-bold mb-2">Masa Berlaku KIR</label>
                <input type="date" id="addKirExpiration" name="kirExpiration" className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={newDriver.kirExpiration} onChange={(e) => handleInputChange(e, 'new')} required />
            </div>
            <div>
                <label htmlFor="addBusYear" className="block text-gray-700 text-sm font-bold mb-2">Tahun Bus</label>
                <input type="number" id="addBusYear" name="busYear" placeholder="Contoh: 2020" className="shadow-sm border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={newDriver.busYear} onChange={(e) => handleInputChange(e, 'new')} required />
            </div>
            <div className="md:col-span-2 lg:col-span-4 mt-4">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                Tambah Data
                </button>
            </div>
            </form>
        </div>


        {/* Form Edit Data (Modal-like section, shown when editingDriver is not null) */}
        {editingDriver && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-6 text-gray-700">Edit Data Sopir</h2>
              <form onSubmit={handleUpdateDriver} className="space-y-4">
                <div>
                  <label htmlFor="editDriverName" className="block text-sm font-medium text-gray-700">Nama Sopir</label>
                  <input type="text" name="driverName" id="editDriverName" value={editingDriver.driverName} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                </div>
                <div>
                  <label htmlFor="editPlateNumber" className="block text-sm font-medium text-gray-700">Plat Nomor</label>
                  <input type="text" name="plateNumber" id="editPlateNumber" value={editingDriver.plateNumber} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                </div>
                <div>
                  <label htmlFor="editKirExpiration" className="block text-sm font-medium text-gray-700">Masa Berlaku KIR</label>
                  <input type="date" name="kirExpiration" id="editKirExpiration" value={editingDriver.kirExpiration} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                </div>
                <div>
                  <label htmlFor="editBusYear" className="block text-sm font-medium text-gray-700">Tahun Bus</label>
                  <input type="number" name="busYear" id="editBusYear" value={editingDriver.busYear} onChange={(e) => handleInputChange(e, 'edit')} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setEditingDriver(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Batal
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabel Data Sopir & Bus */}
        <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Daftar Data Sopir & Bus</h2>
            {loading && drivers.length > 0 && <p className="text-center text-blue-600 py-4">Memperbarui daftar...</p>}
            {!loading && drivers.length === 0 && (
                <p className="text-center text-gray-500 py-10 text-lg">Tidak ada data sopir ditemukan.</p>
            )}
            {drivers.length > 0 && (
                <div className="overflow-x-auto shadow-lg rounded-lg">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead className="bg-gray-100">
                    <tr className="text-left text-gray-600 uppercase text-xs tracking-wider">
                        <th className="py-3 px-5 border-b border-gray-200">Nama Sopir</th>
                        <th className="py-3 px-5 border-b border-gray-200">Plat Nomor</th>
                        <th className="py-3 px-5 border-b border-gray-200">Masa Berlaku KIR</th>
                        <th className="py-3 px-5 border-b border-gray-200">Tahun Bus</th>
                        <th className="py-3 px-5 border-b border-gray-200 text-center">Aksi</th>
                    </tr>
                    </thead>
                    <tbody className="text-gray-700 text-sm">
                    {drivers.map((driver) => (
                        <tr key={driver._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-3 px-5 whitespace-nowrap">{driver.driverName}</td>
                        <td className="py-3 px-5">{driver.plateNumber}</td>
                        <td className="py-3 px-5">{formatDateForDisplay(driver.kirExpiration)}</td>
                        <td className="py-3 px-5">{driver.busYear}</td>
                        <td className="py-3 px-5 text-center whitespace-nowrap">
                            {confirmingDeleteId === driver._id ? (
                            <>
                                <span className="text-sm text-gray-700 mr-2">Yakin hapus?</span>
                                <button
                                onClick={() => executeDeleteDriver(driver._id)}
                                className="text-red-600 hover:text-red-800 font-semibold py-1 px-2 rounded mr-1 text-xs"
                                >
                                Ya
                                </button>
                                <button
                                onClick={() => setConfirmingDeleteId(null)}
                                className="text-gray-600 hover:text-gray-800 font-semibold py-1 px-2 rounded text-xs"
                                >
                                Tidak
                                </button>
                            </>
                            ) : (
                            <>
                                <button
                                onClick={() => handleEditClick(driver)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:shadow-md transition-all duration-150 text-xs mr-2"
                                >
                                Edit
                                </button>
                                <button
                                onClick={() => setConfirmingDeleteId(driver._id)}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md shadow-sm hover:shadow-md transition-all duration-150 text-xs"
                                >
                                Hapus
                                </button>
                            </>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
