import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { CategoryModel } from '@/lib/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const categories = await CategoryModel.find({}).sort({ name: 1 }).lean();
    return NextResponse.json({
      success: true,
      categories: categories.map((c) => c.name),
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ success: false, categories: [] });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    await dbConnect();

    // Check if category already exists (case-insensitive)
    const existing = await CategoryModel.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This category already exists.' },
        { status: 400 }
      );
    }

    const newCategory = await CategoryModel.create({ name: cleanName });

    return NextResponse.json({
      success: true,
      category: newCategory.name,
    });
  } catch (error: any) {
    console.error('Failed to create category:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create category.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required.' },
        { status: 400 }
      );
    }

    await dbConnect();
    await CategoryModel.deleteOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });

    return NextResponse.json({ success: true, deleted: name });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
