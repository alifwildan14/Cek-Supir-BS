// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [newDriver, setNewDriver] = useState({
    driverName: '',
    plateNumber: '',
    kirExpiration: '',
    busYear: '',
  });
  const router = useRouter();

  // Fungsi untuk fetch semua data sopir
  const fetchAllDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/drivers'); // Mengambil semua data
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

  useEffect(() => {
    // Cek autentikasi saat komponen dimuat
    const isAuthenticated = document.cookie.includes('isAuthenticated=true');
    if (!isAuthenticated) {
      router.replace('/login'); // Redirect ke login jika tidak terautentikasi
      return;
    }
    fetchAllDrivers();
  }, [router]);

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validasi sederhana
      if (!newDriver.driverName || !newDriver.plateNumber || !newDriver.kirExpiration || !newDriver.busYear) {
        alert('Semua kolom harus diisi!');
        return;
      }

      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDriver,
          kirExpiration: new Date(newDriver.kirExpiration).toISOString(), // Pastikan format tanggal benar
          busYear: parseInt(newDriver.busYear), // Pastikan tahun adalah angka
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || `HTTP error! status: ${res.status}`);
      }

      setNewDriver({ driverName: '', plateNumber: '', kirExpiration: '', busYear: '' });
      fetchAllDrivers(); // Refresh daftar setelah menambah
    } catch (err: any) {
      setError(`Gagal menambahkan data: ${err.message}`);
      console.error('Error adding driver:', err);
    }
  };

  const handleEditClick = (driver: Driver) => {
    setEditingDriver({
      ...driver,
      kirExpiration: driver.kirExpiration.split('T')[0], // Ubah ke format YYYY-MM-DD untuk input date
    });
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    try {
      const res = await fetch(`/api/drivers/${editingDriver._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editingDriver,
          kirExpiration: new Date(editingDriver.kirExpiration).toISOString(),
          busYear: parseInt(String(editingDriver.busYear)),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || `HTTP error! status: ${res.status}`);
      }

      setEditingDriver(null); // Keluar dari mode edit
      fetchAllDrivers(); // Refresh daftar
    } catch (err: any) {
      setError(`Gagal memperbarui data: ${err.message}`);
      console.error('Error updating driver:', err);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || `HTTP error! status: ${res.status}`);
      }

      fetchAllDrivers(); // Refresh daftar
    } catch (err: any) {
      setError(`Gagal menghapus data: ${err.message}`);
      console.error('Error deleting driver:', err);
    }
  };

  const handleLogout = () => {
    document.cookie = "isAuthenticated=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; // Hapus cookie
    router.push('/login');
  };

  if (loading) return <p className="text-center mt-8">Memuat data admin...</p>;
  if (error) return <p className="text-center text-red-600 mt-8">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>

        {/* Form Tambah Data */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Tambah Data Baru</h2>
        <form onSubmit={handleAddDriver} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div>
            <label htmlFor="addDriverName" className="block text-gray-700 text-sm font-bold mb-2">Nama Sopir</label>
            <input
              type="text"
              id="addDriverName"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newDriver.driverName}
              onChange={(e) => setNewDriver({ ...newDriver, driverName: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="addPlateNumber" className="block text-gray-700 text-sm font-bold mb-2">Plat Nomor</label>
            <input
              type="text"
              id="addPlateNumber"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newDriver.plateNumber}
              onChange={(e) => setNewDriver({ ...newDriver, plateNumber: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="addKirExpiration" className="block text-gray-700 text-sm font-bold mb-2">Masa Berlaku KIR</label>
            <input
              type="date"
              id="addKirExpiration"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newDriver.kirExpiration}
              onChange={(e) => setNewDriver({ ...newDriver, kirExpiration: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="addBusYear" className="block text-gray-700 text-sm font-bold mb-2">Tahun Bus</label>
            <input
              type="number"
              id="addBusYear"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newDriver.busYear}
              onChange={(e) => setNewDriver({ ...newDriver, busYear: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Tambah Data
            </button>
          </div>
        </form>

        {/* Tabel Data Sopir & Bus */}
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Daftar Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 border-b border-gray-200">Nama Sopir</th>
                <th className="py-3 px-6 border-b border-gray-200">Plat Nomor</th>
                <th className="py-3 px-6 border-b border-gray-200">Masa Berlaku KIR</th>
                <th className="py-3 px-6 border-b border-gray-200">Tahun Bus</th>
                <th className="py-3 px-6 border-b border-gray-200 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 whitespace-nowrap">
                    {editingDriver?._id === driver._id ? (
                      <input
                        type="text"
                        value={editingDriver.driverName}
                        onChange={(e) => setEditingDriver({ ...editingDriver, driverName: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      driver.driverName
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingDriver?._id === driver._id ? (
                      <input
                        type="text"
                        value={editingDriver.plateNumber}
                        onChange={(e) => setEditingDriver({ ...editingDriver, plateNumber: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      driver.plateNumber
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingDriver?._id === driver._id ? (
                      <input
                        type="date"
                        value={editingDriver.kirExpiration} // Sudah dalam format YYYY-MM-DD
                        onChange={(e) => setEditingDriver({ ...editingDriver, kirExpiration: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      new Date(driver.kirExpiration).toLocaleDateString('id-ID')
                    )}
                  </td>
                  <td className="py-3 px-6">
                    {editingDriver?._id === driver._id ? (
                      <input
                        type="number"
                        value={String(editingDriver.busYear)}
                        onChange={(e) => setEditingDriver({ ...editingDriver, busYear: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      driver.busYear
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {editingDriver?._id === driver._id ? (
                      <>
                        <button
                          onClick={handleUpdateDriver}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingDriver(null)}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditClick(driver)}
                          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver._id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
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
      </div>
    </div>
  );
}