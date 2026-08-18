import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ProductModel } from '@/lib/models/Product';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const numericId = Number(params.id);
    const body = await request.json();

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { id: numericId },
      {
        name: body.name,
        price: Number(body.price),
        category: body.category,
        rating: Number(body.rating),
        image: body.image,
        description: body.description,
        badge: body.badge || '',
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const numericId = Number(params.id);

    const deleted = await ProductModel.findOneAndDelete({ id: numericId });

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
