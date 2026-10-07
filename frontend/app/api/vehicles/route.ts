import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { VehicleModel } from '@/lib/models/vehicle.model';
import { BookingModel } from '@/lib/models/booking.model';
import { vehicles as fallbackVehicles } from '@/data/vehicles';

export async function GET() {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, data: fallbackVehicles, count: fallbackVehicles.length });
    }

    let dbVehicles = await VehicleModel.find().lean();
    if (!dbVehicles || dbVehicles.length === 0) {
      // Seed fallback vehicles into DB
      try {
        await VehicleModel.insertMany(fallbackVehicles);
        dbVehicles = await VehicleModel.find().lean();
      } catch (seedErr) {
        console.warn('Seeding failed:', seedErr);
      }
    }

    const activeBookings = await BookingModel.find({
      status: { $in: ['Confirmed', 'Pending'] },
    }).lean();

    const activeBookingsMap = new Map();
    activeBookings.forEach((b) => {
      activeBookingsMap.set(b.vehicleId, b);
    });

    const enriched = (dbVehicles && dbVehicles.length > 0 ? dbVehicles : fallbackVehicles).map((v: any) => {
      const activeBooking = activeBookingsMap.get(v.id);
      const isBooked = !!activeBooking || v.status === 'booked';
      return {
        ...v,
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
          : v.currentBooking || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error('Error in /api/vehicles:', error);
    return NextResponse.json({
      success: true,
      data: fallbackVehicles,
      count: fallbackVehicles.length,
    });
  }
}
