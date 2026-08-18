import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

const initialMockUsers = [
  {
    id: 1,
    name: 'Amina Bello',
    email: 'amina.bello@example.com',
    phone: '+234 801 234 5678',
    password: 'password123',
    registeredItems: [
      { productId: 1, productName: 'Wireless Noise-Canceling Headphones', price: 99.99, quantity: 1 },
    ],
  },
  {
    id: 2,
    name: 'David Chen',
    email: 'david.chen@example.com',
    phone: '+1 415 555 0192',
    password: 'password123',
    registeredItems: [
      { productId: 2, productName: 'Minimalist Leather Smart Watch', price: 149.50, quantity: 1 },
      { productId: 3, productName: 'Ergonomic Executive Desk Chair', price: 289.00, quantity: 1 },
    ],
  },
];

export async function GET() {
  try {
    await dbConnect();
    let usersList = await UserModel.find({}).sort({ createdAt: -1 }).lean();

    if (usersList.length === 0) {
      await UserModel.insertMany(initialMockUsers);
      usersList = await UserModel.find({}).sort({ createdAt: -1 }).lean();
    }

    return NextResponse.json({ success: true, users: usersList });
  } catch (error: any) {
    console.error('Fetch users database notice:', error?.message || error);
    return NextResponse.json({ success: true, users: initialMockUsers });
  }
}
