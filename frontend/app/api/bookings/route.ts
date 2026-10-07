import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BookingModel } from '@/lib/models/booking.model';
import { VehicleModel } from '@/lib/models/vehicle.model';
import { vehicles as fallbackVehicles } from '@/data/vehicles';

export async function GET(request: NextRequest) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');

    const query: any = {};
    if (vehicleId) query.vehicleId = vehicleId;
    if (status) query.status = status;

    const bookings = await BookingModel.find(query).lean();
    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, customer, pickup, returnDate, totalAmount } = body;

    if (!vehicleId || !customer || !pickup || !returnDate) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_BOOKING_DATA',
          message: 'Vehicle ID, customer name, pickup date, and return date are required.',
        },
        { status: 400 }
      );
    }

    const conn = await connectDB();

    // 1. Verify vehicle
    let vehicle: any = null;
    if (conn) {
      vehicle = await VehicleModel.findOne({ id: vehicleId }).lean();
    }
    if (!vehicle) {
      vehicle = fallbackVehicles.find((v) => v.id === vehicleId);
    }

    if (!vehicle) {
      return NextResponse.json(
        { success: false, code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found.' },
        { status: 404 }
      );
    }

    // 2. Prevent Double Booking
    if (conn) {
      const existingActiveBooking = await BookingModel.findOne({
        vehicleId,
        status: { $in: ['Confirmed', 'Pending'] },
      }).lean();

      if (existingActiveBooking) {
        return NextResponse.json(
          {
            success: false,
            code: 'VEHICLE_ALREADY_BOOKED',
            message: 'This vehicle has already been booked by another customer.',
            existingBooking: {
              customer: existingActiveBooking.customer,
              pickup: existingActiveBooking.pickup,
              returnDate: existingActiveBooking.returnDate,
            },
          },
          { status: 409 }
        );
      }
    }

    // 3. Compute total amount
    let calculatedTotal = totalAmount;
    if (!calculatedTotal) {
      const start = new Date(`${pickup}T12:00:00`).getTime();
      const end = new Date(`${returnDate}T12:00:00`).getTime();
      const days = Math.max(1, Math.ceil((end - start) / 86400000));
      calculatedTotal = days * (vehicle.pricePerDay || 50);
    }

    // 4. Create Booking
    const bookingPayload = {
      id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      vehicleId,
      customer,
      pickup,
      returnDate,
      totalAmount: calculatedTotal,
      status: 'Confirmed',
    };

    let savedBooking = bookingPayload;
    if (conn) {
      const doc = new BookingModel(bookingPayload);
      await doc.save();
      savedBooking = doc.toObject();
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      data: savedBooking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
