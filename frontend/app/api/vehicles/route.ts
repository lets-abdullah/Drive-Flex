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

export async function POST(request: Request) {
  try {
    const conn = await connectDB();
    if (!conn) {
      return NextResponse.json({ success: false, message: 'Database connection failed' }, { status: 503 });
    }

    const body = await request.json();
    const {
      brand,
      model,
      category = 'Premium',
      location,
      pricePerDay,
      seats = 5,
      transmission = 'Automatic',
      fuelType = 'Gasoline',
      description = '',
      image,
      gallery,
      ownerId = 'demo-owner',
      provider = 'Drive Flex verified host',
      features = [],
      range = null,
    } = body;

    if (!brand || !model || !location || !pricePerDay) {
      return NextResponse.json(
        { success: false, message: 'Brand, model, location, and pricePerDay are required' },
        { status: 400 }
      );
    }

    const id = body.id || `veh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = body.slug || `${brand}-${model}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const defaultImg = image || 'https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg?auto=compress&cs=tinysrgb&w=1600';
    const vehicleDoc = new VehicleModel({
      id,
      slug,
      brand,
      model,
      category,
      location,
      pricePerDay: Number(pricePerDay),
      seats: Number(seats) || 5,
      transmission,
      fuelType,
      description,
      image: defaultImg,
      gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : [defaultImg],
      ownerId,
      provider,
      features: Array.isArray(features) ? features : [],
      range,
    });

    await vehicleDoc.save();

    return NextResponse.json({
      success: true,
      message: 'Vehicle listed successfully in database',
      data: vehicleDoc.toObject(),
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle in MongoDB:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}
