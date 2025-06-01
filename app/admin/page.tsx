// app/admin/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface ApiError {
  details?: string;
  message?: string;
  [key: string]: unknown;
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null;
}

interface Driver {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string;
  busYear: number;
}

export default function AdminDashboardPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [newDriver, setNewDriver] = useState({
    driverName: '', plateNumber: '', kirExpiration: '', busYear: '',
  });
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const fetchAllDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drivers');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: Driver[] = await res.json();
      setDrivers(data);
    } catch (err) {
      setError('Gagal mengambil data. Silakan coba lagi.');
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = document.cookie.includes('isAuthenticated=true');
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchAllDrivers();
  }, [router, fetchAllDrivers]);
  
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.driverName || !newDriver.plateNumber || !newDriver.kirExpiration || !newDriver.busYear) {
      setNotification('Semua kolom harus diisi!');
      return;
    }
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newDriver,
          kirExpiration: new Date(newDriver.kirExpiration).toISOString(),
          busYear: parseInt(newDriver.busYear),
        }),
      });
      if (!res.ok) {
        const errorData: unknown = await res.json();
        if (isApiError(errorData) && (errorData.details || errorData.message)) {
          throw new Error(errorData.details || errorData.message);
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setNewDriver({ driverName: '', plateNumber: '', kirExpiration: '', busYear: '' });
      await fetchAllDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambahkan data.');
      console.error('Error adding driver:', err);
    }
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver({
      ...driver,
      kirExpiration: driver.kirExpiration.split('T')[0],
    });
  };
  
  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;
    try {
      const res = await fetch(`/api/drivers/${editingDriver._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingDriver,
          kirExpiration: new Date(editingDriver.kirExpiration).toISOString(),
          busYear: parseInt(String(editingDriver.busYear)),
        }),
      });
      if (!res.ok) {
         const errorData: unknown = await res.json();
        if (isApiError(errorData) && (errorData.details || errorData.message)) {
          throw new Error(errorData.details || errorData.message);
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setEditingDriver(null);
      await fetchAllDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui data.');
      console.error('Error updating driver:', err);
    }
  };
  
  const executeDeleteDriver = async (id: string) => {
    try {
      const res = await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errorData: unknown = await res.json();
        if (isApiError(errorData) && (errorData.details || errorData.message)) {
          throw new Error(errorData.details || errorData.message);
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      await fetchAllDrivers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data.');
      console.error('Error deleting driver:', err);
    } finally {
      setConfirmingDeleteId(null);
    }
  };
  
  const handleLogout = () => {
    document.cookie = "isAuthenticated=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push('/login');
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateString; }
  };

  if (loading) return <p className="text-center mt-8">Memuat data admin...</p>;
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</button>
        </div>
        
        {notification && <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4">{notification}</div>}
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">Error: {error}</div>}

        <h2 className="text-2xl font-semibold mb-4">Tambah Data Baru</h2>
        <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <input type="text" placeholder="Nama Sopir" className="border p-2 rounded" value={newDriver.driverName} onChange={(e) => setNewDriver({ ...newDriver, driverName: e.target.value })} required />
            <input type="text" placeholder="Plat Nomor" className="border p-2 rounded" value={newDriver.plateNumber} onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value })} required />
            <input type="date" placeholder="Masa Berlaku KIR" className="border p-2 rounded" value={newDriver.kirExpiration} onChange={(e) => setNewDriver({ ...newDriver, kirExpiration: e.target.value })} required />
            <input type="number" placeholder="Tahun Bus" className="border p-2 rounded" value={newDriver.busYear} onChange={(e) => setNewDriver({ ...newDriver, busYear: e.target.value })} required />
            <button type="submit" className="bg-green-500 text-white p-2 rounded col-span-full">Tambah Data</button>
        </form>

        <h2 className="text-2xl font-semibold mb-4">Daftar Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Nama Sopir</th>
                <th className="py-2 px-4 border-b">Plat Nomor</th>
                <th className="py-2 px-4 border-b">Masa Berlaku KIR</th>
                <th className="py-2 px-4 border-b">Tahun Bus</th>
                <th className="py-2 px-4 border-b">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver._id}>
                  <td className="py-2 px-4 border-b">{editingDriver?._id === driver._id ? <input type="text" value={editingDriver.driverName} onChange={(e) => setEditingDriver({...editingDriver, driverName: e.target.value})} className="border p-1 w-full" /> : driver.driverName}</td>
                  <td className="py-2 px-4 border-b">{editingDriver?._id === driver._id ? <input type="text" value={editingDriver.plateNumber} onChange={(e) => setEditingDriver({...editingDriver, plateNumber: e.target.value})} className="border p-1 w-full" /> : driver.plateNumber}</td>
                  <td className="py-2 px-4 border-b">{editingDriver?._id === driver._id ? <input type="date" value={editingDriver.kirExpiration} onChange={(e) => setEditingDriver({...editingDriver, kirExpiration: e.target.value})} className="border p-1 w-full" /> : formatDateForDisplay(driver.kirExpiration)}</td>
                  <td className="py-2 px-4 border-b">{editingDriver?._id === driver._id ? <input type="number" value={editingDriver.busYear} onChange={(e) => setEditingDriver({...editingDriver, busYear: parseInt(e.target.value)})} className="border p-1 w-full" /> : driver.busYear}</td>
                  <td className="py-2 px-4 border-b">
                    {editingDriver?._id === driver._id ? (
                      <>
                        <button onClick={handleUpdateDriver} className="bg-blue-500 text-white py-1 px-2 rounded mr-2">Simpan</button>
                        <button onClick={() => setEditingDriver(null)} className="bg-gray-500 text-white py-1 px-2 rounded">Batal</button>
                      </>
                    ) : confirmingDeleteId === driver._id ? (
                      <>
                        <span className="mr-2">Yakin?</span>
                        <button onClick={() => executeDeleteDriver(driver._id)} className="text-red-600 mr-2">Ya</button>
                        <button onClick={() => setConfirmingDeleteId(null)}>Tidak</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditClick(driver)} className="bg-yellow-500 text-white py-1 px-2 rounded mr-2">Edit</button>
                        <button onClick={() => setConfirmingDeleteId(driver._id)} className="bg-red-500 text-white py-1 px-2 rounded">Hapus</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
