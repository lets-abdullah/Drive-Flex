import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { UserModel, type UserRole } from '@/lib/models/user.model';
import { verifyPassword } from '@/lib/auth-crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, expectedRole = 'renter' } = body;

    const normalizedRole = expectedRole === 'host' ? 'host' : 'renter';
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const conn = await connectDB();
    if (!conn) {
      // Offline fallback
      return NextResponse.json({
        success: true,
        message: 'Signed in (demo mode)',
        user: {
          id: `demo-${normalizedRole}`,
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          role: normalizedRole,
        },
      });
    }

    // 1. Look for user with exact email AND expected role
    const user = await UserModel.findOne({
      email: normalizedEmail,
      role: normalizedRole,
    }).lean();

    // 2. If not found, check if they are registered under the OTHER role
    if (!user) {
      const otherRole = normalizedRole === 'host' ? 'renter' : 'host';
      const userOtherRole = await UserModel.findOne({
        email: normalizedEmail,
        role: otherRole,
      }).lean();

      if (userOtherRole) {
        return NextResponse.json(
          {
            success: false,
            code: 'ROLE_MISMATCH',
            message: `Cross-Role Login Blocked: This email is registered as a ${
              otherRole === 'host' ? 'Host/Lister' : 'Renter'
            }. You cannot sign in to the ${
              normalizedRole === 'host' ? 'Host' : 'Renter'
            } portal with this account. Please use the ${
              otherRole === 'host' ? 'Host portal' : 'Renter portal'
            }.`,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 3. Verify password
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      businessName: user.businessName,
      ownerId: user.role === 'host' ? user.id : undefined,
    };

    return NextResponse.json({
      success: true,
      message: `Signed in as ${user.role === 'host' ? 'Host' : 'Renter'}`,
      user: userResponse,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
