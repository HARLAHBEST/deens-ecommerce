import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { UserModel } from '@/lib/models/User';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const numericId = Number(params.id);

    const deleted = await UserModel.findOneAndDelete({ id: numericId });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
