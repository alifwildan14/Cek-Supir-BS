import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1]; // Ambil id dari URL path

    const driver = await Driver.findById(id);
    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const id = parts[parts.length - 1];

    const deleted = await Driver.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Driver deleted' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
