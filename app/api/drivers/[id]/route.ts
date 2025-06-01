// app/api/drivers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

// Handler untuk GET request (Mengambil satu driver berdasarkan ID)
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Validasi apakah ID adalah format ObjectId yang valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid driver ID format' }, { status: 400 });
  }

  try {
    await dbConnect();

    const driver = await Driver.findById(id);

    if (!driver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(driver, { status: 200 });
  } catch (error) {
    console.error('API GET Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

// Handler untuk PUT request (Memperbarui satu driver berdasarkan ID)
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Validasi apakah ID adalah format ObjectId yang valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid driver ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    await dbConnect();

    // Validasi dasar untuk body request
    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
        return NextResponse.json({ message: 'Request body is empty or invalid' }, { status: 400 });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      body,
      {
        new: true, // Mengembalikan dokumen yang sudah diperbarui
        runValidators: true, // Menjalankan validator schema Mongoose saat update
      }
    );

    if (!updatedDriver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error) {
    console.error('API PUT Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

// Handler untuk DELETE request (Menghapus satu driver berdasarkan ID)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Validasi apakah ID adalah format ObjectId yang valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid driver ID format' }, { status: 400 });
  }

  try {
    await dbConnect();

    const deletedDriver = await Driver.findByIdAndDelete(id);

    if (!deletedDriver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Driver deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('API DELETE Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
