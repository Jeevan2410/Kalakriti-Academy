import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

const IMAGE_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024 // 100MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

function fileToBuffer(file: File): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(Buffer.from(reader.result))
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsArrayBuffer(file)
  })
}

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env' },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'image'

    if (type !== 'image' && type !== 'video') {
      return NextResponse.json(
        { error: 'Invalid type. Use "image" or "video".' },
        { status: 400 },
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type "${file.type}" not allowed for ${type} uploads. Allowed: ${allowedTypes.join(', ')}` },
        { status: 400 },
      )
    }

    // Validate file size
    const maxSize = type === 'image' ? IMAGE_MAX_SIZE : VIDEO_MAX_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size for ${type}s is ${type === 'image' ? '10MB' : '100MB'}.` },
        { status: 400 },
      )
    }

    // Convert File to Buffer for SDK upload
    const fileBuffer = await fileToBuffer(file)

    // Build upload options based on type
    const uploadOptions: cloudinary.UploadApiOptions = {
      folder: type === 'image' ? 'kalakriti/courses' : 'kalakriti/videos',
      resource_type: type === 'video' ? 'video' : 'image',
    }

    // Add image-specific transformations (thumbnail size)
    if (type === 'image') {
      uploadOptions.transformation = [
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
        },
      ]
    }

    const result = await cloudinary.uploader.upload(
      `data:${file.type};base64,${fileBuffer.toString('base64')}`,
      uploadOptions,
    )

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    })
  } catch (error) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}