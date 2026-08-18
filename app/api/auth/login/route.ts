import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with that email.' }, { status: 404 });
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
