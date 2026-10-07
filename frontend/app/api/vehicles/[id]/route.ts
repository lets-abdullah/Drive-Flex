import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { VehicleModel } from '@/lib/models/vehicle.model';
import { BookingModel } from '@/lib/models/booking.model';
import { vehicles as fallbackVehicles } from '@/data/vehicles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const conn = await connectDB();
    let vehicle: any = null;

    if (conn) {
      vehicle = await VehicleModel.findOne({
        $or: [{ id }, { slug: id }],
      }).lean();
    }

    if (!vehicle) {
      vehicle = fallbackVehicles.find((v) => v.id === id || v.slug === id);
    }

    if (!vehicle) {
      return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
    }

    let activeBooking = null;
    if (conn) {
      activeBooking = await BookingModel.findOne({
        vehicleId: vehicle.id,
        status: { $in: ['Confirmed', 'Pending'] },
      }).lean();
    }

    const isBooked = !!activeBooking || vehicle.status === 'booked';
    const enriched = {
      ...vehicle,
      status: isBooked ? 'booked' : 'available',
      bookable: !isBooked,
      currentBooking: activeBooking
        ? {
            id: activeBooking.id,
            customer: activeBooking.customer,
            pickup: activeBooking.pickup,
            returnDate: activeBooking.returnDate,
            status: activeBooking.status,
          }
        : vehicle.currentBooking || null,
    };

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error(`Error in /api/vehicles/${id}:`, error);
    const fallback = fallbackVehicles.find((v) => v.id === id || v.slug === id);
    if (fallback) {
      return NextResponse.json({ success: true, data: fallback });
    }
    return NextResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
  }
}
