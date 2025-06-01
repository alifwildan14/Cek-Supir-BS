// app/api/drivers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

// Interface untuk konteks params
interface Params {
  params: {
    id: string;
  };
}

// Handler untuk GET request (Mengambil satu driver berdasarkan ID)
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const { id } = params;

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

// Handler untuk PUT request (Memperbarui satu driver berdasarkan ID)
export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid driver ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    await dbConnect();

    if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
      return NextResponse.json({ message: 'Request body is empty or invalid' }, { status: 400 });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDriver) {
      return NextResponse.json({ message: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(updatedDriver, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}

// Handler untuk DELETE request (Menghapus satu driver berdasarkan ID)
export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  const { id } = params;

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}
