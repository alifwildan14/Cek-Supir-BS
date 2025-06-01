// app/api/drivers/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

// Mendapatkan satu sopir berdasarkan ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const driver = await Driver.findById(id);
    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error fetching single driver:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Memperbarui sopir berdasarkan ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    const updatedDriver = await Driver.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updatedDriver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ message: 'Internal Server Error', details: (error as Error).message }, { status: 500 });
  }
}

// Menghapus sopir berdasarkan ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedDriver = await Driver.findByIdAndDelete(id);
    if (!deletedDriver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}