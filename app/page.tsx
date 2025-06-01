// app/page.tsx
import Driver from '@/models/Driver';
import dbConnect from '@/lib/dbConnect';
import SearchAndDisplay from '@/components/SearchAndDisplay'; // Pastikan ini sudah ada

interface DriverData {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string;
  busYear: number;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams secara eksplisit untuk Next.js App Router yang ketat
  const resolvedSearchParams = await searchParams;
  const query = (resolvedSearchParams?.query as string || '') || '';

  let drivers: DriverData[] = [];
  let error: string | null = null;

  // HANYA AMBIL DATA DARI DATABASE JIKA ADA QUERY
  if (query) {
    try {
      await dbConnect();
      drivers = await Driver.find({
        $or: [
          { driverName: { $regex: query, $options: 'i' } },
          { plateNumber: { $regex: query, $options: 'i' } },
        ],
      }).lean(); // Menggunakan .lean() untuk mendapatkan plain JavaScript objects

      // Kunci untuk mengatasi "Only plain objects can be passed..."
      // Konversi ObjectId dan Date menjadi string secara eksplisit
      // dan pastikan hanya properti yang diperlukan yang ada.
      drivers = drivers.map(driver => ({
        _id: driver._id.toString(), // Konversi ObjectId Mongoose menjadi string
        driverName: driver.driverName,
        plateNumber: driver.plateNumber,
        // Pastikan kirExpiration adalah string ISO atau tangani jika masih Date object
        kirExpiration: driver.kirExpiration instanceof Date ? driver.kirExpiration.toISOString() : driver.kirExpiration,
        busYear: driver.busYear,
        // Hindari properti Mongoose lainnya seperti __v
      }));

      // Langkah pengaman tambahan: Stringify dan parse untuk memastikan benar-benar plain object
      drivers = JSON.parse(JSON.stringify(drivers));

    } catch (err) {
      console.error('Error fetching drivers on server:', err);
      error = 'Failed to fetch data on server. Please try again.';
    }
  }

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