import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username and password are required.' }, { status: 400 });
    }

    const identifier = username.trim();
    const cleanDigits = identifier.replace(/\D/g, '');
    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Search by name (case-insensitive) or phone (exact, case-insensitive, or digit substring)
    const orConditions: any[] = [
      { name: { $regex: new RegExp(`^${escaped}$`, 'i') } },
      { phone: { $regex: new RegExp(`^${escaped}$`, 'i') } },
    ];

    if (cleanDigits.length >= 6) {
      orConditions.push({ phone: { $regex: new RegExp(cleanDigits) } });
      if (cleanDigits.length >= 8) {
        const suffix = cleanDigits.slice(-7);
        orConditions.push({ phone: { $regex: new RegExp(suffix) } });
      }
    }

    const user = await UserModel.findOne({ $or: orConditions });

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with that username or phone number.' }, { status: 404 });
    }

    if (user.password && user.password !== password) {
      return NextResponse.json({ success: false, error: 'Incorrect password.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
