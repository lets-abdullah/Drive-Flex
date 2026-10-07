import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BookingModel } from '@/lib/models/booking.model';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'Database not available' }, { status: 503 });
    }

    const booking = await BookingModel.findOne({ id }).lean();
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'Database not available' }, { status: 503 });
    }

    const body = await request.json();
    const updated = await BookingModel.findOneAndUpdate(
      { id },
      { ...body, updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'Database not available' }, { status: 503 });
    }

    const result = await BookingModel.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
