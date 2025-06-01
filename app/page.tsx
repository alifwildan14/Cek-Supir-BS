// app/page.tsx (ubah ini)
import Driver from '@/models/Driver'; // Impor model Driver
import dbConnect from '@/lib/dbConnect'; // Impor dbConnect

interface DriverData {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string;
  busYear: number;
}

// Ini sekarang adalah SERVER COMPONENT
export default async function HomePage({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';
  let drivers: DriverData[] = [];
  let error: string | null = null;

  try {
    await dbConnect(); // Pastikan koneksi DB dibuat
    // Ambil data langsung dari database di server
    drivers = await Driver.find({
      $or: [
        { driverName: { $regex: query, $options: 'i' } },
        { plateNumber: { $regex: query, $options: 'i' } },
      ],
    }).lean(); // Gunakan .lean() untuk mendapatkan plain JavaScript object

    // Konversi Date ke string di server untuk konsistensi
    drivers = drivers.map(driver => ({
      ...driver,
      kirExpiration: driver.kirExpiration.toISOString(), // Ubah Date menjadi string ISO 8601
    }));

  } catch (err) {
    console.error('Error fetching drivers on server:', err);
    error = 'Failed to fetch data on server. Please try again.';
  }

  // Komponen client untuk input pencarian dan tampilan hasil
  // Kita akan memisahkan ini menjadi komponen terpisah
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Cek Data Sopir & Bus</h1>

        {/* Komponen Pencarian (Client Component) */}
        <SearchAndDisplay driversInitialData={drivers} initialError={error} />

      </div>
    </div>
  );
}