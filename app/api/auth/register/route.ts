import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, password, contactMethod, registeredItems } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Username is required.' }, { status: 400 });
    }

    const finalPhone = phone?.trim() || `user_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const syntheticEmail = body.email || `user_${finalPhone.replace(/\D/g, '') || Date.now()}@deensdaily.local`;
    const method = ['messenger', 'phone', 'whatsapp'].includes(contactMethod) ? contactMethod : 'messenger';
    const finalPassword = password || 'default123';

    try {
      await dbConnect();

      // Deduplicate by name or phone
      const existingUser = await UserModel.findOne({
        $or: [{ name: name.trim() }, { phone: finalPhone }],
      });

      if (existingUser) {
        if (password) existingUser.password = finalPassword;
        existingUser.contactMethod = method;
        if (registeredItems && Array.isArray(registeredItems) && registeredItems.length > 0) {
          existingUser.registeredItems = [...(existingUser.registeredItems || []), ...registeredItems];
        }
        await existingUser.save();
        return NextResponse.json({ success: true, user: existingUser });
      }

      const maxUser = await UserModel.findOne({}).sort({ id: -1 }).exec();
      const nextId = maxUser ? maxUser.id + 1 : 1;

      const newUser = await UserModel.create({
        id: nextId,
        name: name.trim(),
        email: syntheticEmail,
        phone: finalPhone,
        contactMethod: method,
        password: finalPassword,
        registeredItems: registeredItems || [],
      });

      return NextResponse.json({ success: true, user: newUser }, { status: 201 });
    } catch (dbError: any) {
      console.warn('MongoDB register notice:', dbError?.message || dbError);
      // Fallback
      return NextResponse.json({
        success: true,
        user: {
          id: Date.now(),
          name: name.trim(),
          phone: finalPhone,
          contactMethod: method,
          registeredItems: registeredItems || [],
        },
      });
    }
  } catch (error: any) {
    console.error('Register API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
