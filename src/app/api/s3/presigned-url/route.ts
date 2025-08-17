import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// AWS Configuration
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || '';

// File type validation
const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  videos: ['video/mp4', 'video/webm', 'video/mpeg', 'video/quicktime'],
  documents: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  videos: 100 * 1024 * 1024, // 100MB
  documents: 5 * 1024 * 1024, // 5MB
};

export async function POST(request: NextRequest) {
  try {
    // Validate AWS configuration
    if (!BUCKET_NAME || !process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'AWS configuration is missing' },
        { status: 500 }
      );
    }

    const { fileName, fileType, folder } = await request.json();

    // Validate input
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const baseName = fileName.split('.').slice(0, -1).join('.');
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '-');
    
    const key = folder 
      ? `${folder}/${sanitizedBaseName}-${timestamp}-${randomString}.${extension}`
      : `${sanitizedBaseName}-${timestamp}-${randomString}.${extension}`;

    // Create the command for generating presigned URL
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Metadata: {
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate presigned URL (valid for 15 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 15 * 60, // 15 minutes
    });

    return NextResponse.json({
      presignedUrl,
      key,
      bucketName: BUCKET_NAME,
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    });

  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}

// Optional: GET method for getting presigned URLs for downloads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'key parameter is required' },
        { status: 400 }
      );
    }

    // This would be for getting download URLs if needed
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour for downloads
    });

    return NextResponse.json({
      presignedUrl,
      key,
    });

  } catch (error: any) {
    console.error('Error generating download presigned URL:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
