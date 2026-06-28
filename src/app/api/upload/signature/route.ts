import { NextRequest, NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

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

    const body = await request.json()
    const folder = (body.folder as string) || 'kalakriti/courses'
    const resourceType = (body.resource_type as string) || 'image'

    if (resourceType !== 'image' && resourceType !== 'video' && resourceType !== 'auto') {
      return NextResponse.json(
        { error: 'Invalid resource_type. Use "image", "video", or "auto".' },
        { status: 400 },
      )
    }

    const timestamp = Math.round(new Date().getTime() / 1000)

    const paramsToSign = {
      folder,
      timestamp,
      resource_type: resourceType,
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      apiSecret,
    )

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    })
  } catch (error) {
    console.error('Signature generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate signature'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}