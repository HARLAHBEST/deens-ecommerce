import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ProductModel } from '@/lib/models/Product';
import { products as initialProducts } from '@/data/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    let productsList = await ProductModel.find({}).sort({ id: 1 }).lean();

    // Auto-seed initial products if database has no products yet
    if (productsList.length === 0) {
      await ProductModel.insertMany(initialProducts);
      productsList = await ProductModel.find({}).sort({ id: 1 }).lean();
    }

    return NextResponse.json({ success: true, products: productsList });
  } catch (error: any) {
    console.error('Fetch products database notice:', error?.message || error);
    // Return fallback initial products if database connection fails during static export
    return NextResponse.json({ success: true, products: initialProducts });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const count = await ProductModel.countDocuments();
    if (count === 0) {
      await ProductModel.insertMany(initialProducts);
    }

    const body = await request.json();

    const maxProduct = await ProductModel.findOne({}).sort({ id: -1 }).exec();
    const nextId = maxProduct ? maxProduct.id + 1 : 1;

    // Build images array: if images[] provided use it, otherwise derive from single image
    const imagesArray: string[] = Array.isArray(body.images) && body.images.length > 0
      ? body.images
      : body.image ? [body.image] : [];

    const newProduct = await ProductModel.create({
      id: nextId,
      name: body.name,
      price: Number(body.price),
      category: body.category,
      rating: Number(body.rating) || 4.5,
      image: imagesArray[0] || body.image || '',
      images: imagesArray,
      description: body.description,
      badge: body.badge || '',
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await dbConnect();
    await ProductModel.deleteMany({});
    return NextResponse.json({ success: true, message: 'All products deleted from database' });
  } catch (error: any) {
    console.error('Clear products error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
