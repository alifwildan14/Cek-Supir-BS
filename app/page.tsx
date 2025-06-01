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

// Define a more specific type for the Mongoose document if possible,
// otherwise, we'll handle the properties we expect.
// This helps with the 'driver._id.toString()' and other property accesses.
interface MongooseDriver {
  _id: { toString: () => string }; // Or import ObjectId from 'mongoose' and use it
  driverName: string;
  plateNumber: string;
  kirExpiration: string | Date; // Can be a string or Date from the DB
  busYear: number;
  [key: string]: any; // Allow other Mongoose properties like __v, etc.
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams secara eksplisit untuk Next.js App Router yang ketat
  const resolvedSearchParams = await searchParams; // searchParams is already an object, no need to await it directly unless it's a Promise itself.
                                                  // If it's from Next.js App Router, it's typically available directly.
  const query = (resolvedSearchParams?.query as string || '') || '';

  let drivers: DriverData[] = [];
  let error: string | null = null;

  // HANYA AMBIL DATA DARI DATABASE JIKA ADA QUERY
  if (query) {
    try {
      await dbConnect();
      // Explicitly type the result of Driver.find if possible, or cast to MongooseDriver[]
      const rawDrivers: MongooseDriver[] = await Driver.find({
        $or: [
          { driverName: { $regex: query, $options: 'i' } },
          { plateNumber: { $regex: query, $options: 'i' } },
        ],
      }).lean(); // Menggunakan .lean() untuk mendapatkan plain JavaScript objects

      // Kunci untuk mengatasi "Only plain objects can be passed..."
      // Konversi ObjectId dan Date menjadi string secara eksplisit
      // dan pastikan hanya properti yang diperlukan yang ada.
      drivers = rawDrivers.map((driver: MongooseDriver) => ({
        _id: driver._id.toString(), // Konversi ObjectId Mongoose menjadi string
        driverName: driver.driverName,
        plateNumber: driver.plateNumber,
        // Pastikan kirExpiration adalah string ISO atau tangani jika masih Date object
        kirExpiration: driver.kirExpiration instanceof Date ? driver.kirExpiration.toISOString() : String(driver.kirExpiration),
        busYear: driver.busYear,
        // Hindari properti Mongoose lainnya seperti __v
      }));

      // Langkah pengaman tambahan: Stringify dan parse untuk memastikan benar-benar plain object
      // This step is generally good for ensuring serializability.
      drivers = JSON.parse(JSON.stringify(drivers));

    } catch (e: unknown) { // Explicitly type the caught error as unknown
      console.error('Error fetching drivers on server:', e);
      // Type guard to check if 'e' is an instance of Error
      if (e instanceof Error) {
        error = `Failed to fetch data on server. Error: ${e.message}`;
      } else {
        error = 'Failed to fetch data on server due to an unknown error. Please try again.';
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Cek Data Sopir & Bus</h1>

        {/* Komponen Pencarian (Client Component) */}
        {/* Pastikan SearchAndDisplay can handle driversInitialData being potentially empty if no query */}
        <SearchAndDisplay driversInitialData={drivers} initialError={error} />

      </div>
    </div>
  );
}
