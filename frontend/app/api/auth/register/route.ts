import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, type UserRole } from '@/lib/models/user.model';
import { hashPassword } from '@/lib/auth-crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role = 'renter',
      phone = '',
      city = '',
      businessName = '',
      cnic = '',
      ownerType = 'Individual',
      description = '',
      profileImage = '',
    } = body;

    const normalizedRole = role === 'host' ? 'host' : 'renter';
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return NextResponse.json({ success: false, message: 'Valid email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (normalizedRole === 'host') {
      if (!businessName && !name) {
        return NextResponse.json(
          { success: false, message: 'Host/business name is required for car listers' },
          { status: 400 }
        );
      }
    }

    const conn = await connectDB();
    if (!conn) {
      // Return local memory fallback session if DB is offline
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        role: normalizedRole,
        phone,
        city,
        businessName: businessName || name,
      };
      return NextResponse.json({
        success: true,
        message: 'Account registered locally',
        user: fallbackUser,
      });
    }

    // Check if account with same email AND role already exists
    const existing = await UserModel.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    }).lean();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          code: 'USER_EXISTS',
          message: `An account with this email already exists as a ${
            normalizedRole === 'host' ? 'Host/Lister' : 'Renter'
          }. Please sign in instead.`,
        },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(password);
    const userId = `usr-${normalizedRole}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser = new UserModel({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hash,
      salt,
      role: normalizedRole,
      phone,
      city,
      businessName: businessName || name,
      cnic,
      ownerType,
      description,
      profileImage,
    });

    await newUser.save();

    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      city: newUser.city,
      businessName: newUser.businessName,
      ownerId: normalizedRole === 'host' ? newUser.id : undefined,
    };

    return NextResponse.json({
      success: true,
      message: `Account created successfully as ${normalizedRole === 'host' ? 'Host' : 'Renter'}`,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
