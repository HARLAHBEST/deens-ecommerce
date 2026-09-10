import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ProductModel } from '@/lib/models/Product';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const numericId = Number(params.id);
    const body = await request.json();

    // Build images array
    const imagesArray: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : body.image ? [body.image] : [];

    const updateData: Record<string, any> = {
      name: body.name,
      price: Number(body.price),
      category: body.category,
      rating: Number(body.rating),
      image: imagesArray[0] || body.image || '',
      images: imagesArray,
      description: body.description,
      badge: body.badge || '',
    };

    if (typeof body.isArchived === 'boolean') {
      updateData.isArchived = body.isArchived;
    }

    const updatedProduct = await ProductModel.findOneAndUpdate(
      { id: numericId },
      updateData,
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

// PATCH to quickly restore or archive a product
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const numericId = Number(params.id);
    const body = await request.json();

    const isArchived = typeof body.isArchived === 'boolean' ? body.isArchived : false;

    const product = await ProductModel.findOneAndUpdate(
      { id: numericId },
      { isArchived },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Patch product error:', error);
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
    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';

    if (permanent) {
      const deleted = await ProductModel.findOneAndDelete({ id: numericId });
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Product permanently erased' });
    } else {
      // Soft-delete: Save to Trash / Archived so it can be restored anytime
      const archived = await ProductModel.findOneAndUpdate(
        { id: numericId },
        { isArchived: true },
        { new: true }
      );
      if (!archived) {
        return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Product saved to Trash bin', product: archived });
    }
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
