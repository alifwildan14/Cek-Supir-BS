import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';

// Gunakan Route Segment Config resmi dari Next.js
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    console.error('API GET Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    console.error('API PUT Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    console.error('API DELETE Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
