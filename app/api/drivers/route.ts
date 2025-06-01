// app/api/drivers/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    let drivers;
    if (query) {
      drivers = await Driver.find({
        $or: [
          { driverName: { $regex: query, $options: 'i' } }, // Case-insensitive search
          { plateNumber: { $regex: query, $options: 'i' } },
        ],
      });
    } else {
      drivers = await Driver.find({}); // Ambil semua data jika tidak ada query
    }

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const newDriver = new Driver(body);
    await newDriver.save();
    return NextResponse.json(newDriver, { status: 201 });
  } catch (error) {
    console.error('Error adding driver:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}