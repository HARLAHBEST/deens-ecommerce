import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { ProductModel } from '@/lib/models/Product';
import { products as initialProducts } from '@/data/products';

export async function GET() {
  try {
    await dbConnect();
    let productsList = await ProductModel.find({}).sort({ id: 1 }).lean();

    // Auto-seed initial products if database is empty
    if (productsList.length === 0) {
      await ProductModel.insertMany(initialProducts);
      productsList = await ProductModel.find({}).sort({ id: 1 }).lean();
    }

    return NextResponse.json({ success: true, products: productsList });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const maxProduct = await ProductModel.findOne({}).sort({ id: -1 }).exec();
    const nextId = maxProduct ? maxProduct.id + 1 : 1;

    const newProduct = await ProductModel.create({
      id: nextId,
      name: body.name,
      price: Number(body.price),
      category: body.category,
      rating: Number(body.rating) || 4.5,
      image: body.image,
      description: body.description,
      badge: body.badge || '',
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
