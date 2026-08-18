import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, phone, password, registeredItems } = body;

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 });
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      if (registeredItems && Array.isArray(registeredItems) && registeredItems.length > 0) {
        existingUser.registeredItems = [...existingUser.registeredItems, ...registeredItems];
        await existingUser.save();
      }
      return NextResponse.json({ success: true, user: existingUser });
    }

    const maxUser = await UserModel.findOne({}).sort({ id: -1 }).exec();
    const nextId = maxUser ? maxUser.id + 1 : 1;

    const newUser = await UserModel.create({
      id: nextId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: password || 'default123',
      registeredItems: registeredItems || [],
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
