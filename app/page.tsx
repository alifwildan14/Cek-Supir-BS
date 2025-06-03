// app/page.tsx
import Driver from '@/models/Driver';
import dbConnect from '@/lib/dbConnect';
import SearchAndDisplay from '@/components/SearchAndDisplay';

interface DriverData {
  _id: string;
  driverName: string;
  plateNumber: string;
  kirExpiration: string;
  busYear: number;
}

export default async function HomePage({
  searchParams = {},
}: {
  searchParams: { [key: string]: string | string[] };
}) {
  const query = (searchParams.query as string || '').trim();

  let drivers: DriverData[] = [];
  let error: string | null = null;

  if (query) {
    try {
      await dbConnect();
      const rawDrivers = await Driver.find({
        $or: [
          { driverName: { $regex: query, $options: 'i' } },
          { plateNumber: { $regex: query, $options: 'i' } },
        ],
      }).lean();

      drivers = JSON.parse(JSON.stringify(rawDrivers));
    } catch (e: unknown) {
      console.error('Error fetching drivers on server:', e);
      if (e instanceof Error) {
        error = `Failed to fetch data. Error: ${e.message}`;
      } else {
        error = 'An unknown error occurred while fetching data.';
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Cek Data Sopir &amp; Bus</h1>
        <SearchAndDisplay driversInitialData={drivers} initialError={error} />
      </div>
    </div>
  );
}
