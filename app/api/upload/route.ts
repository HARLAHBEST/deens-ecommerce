import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fileStr = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/jpeg';
      fileStr = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      const json = await request.json();
      fileStr = json.image;
    }

    if (!fileStr) {
      return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: 'deensdaily_products',
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
