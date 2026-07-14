import { NextResponse } from 'next/server'
import { generateStoryboardPanel } from '@/lib/ai'
import { uploadImageFromBlob } from '@/lib/cloudinary'

export async function POST(req: Request) {
  try {
    const { sceneDescription, style } = await req.json()
    if (!sceneDescription) {
      return NextResponse.json({ error: 'sceneDescription is required' }, { status: 400 })
    }

    // Generate image via Hugging Face
    const imageBlob = await generateStoryboardPanel(sceneDescription, style || 'cinematic')

    // Upload to Cloudinary
    const { url, publicId } = await uploadImageFromBlob(imageBlob, 'nurulife-studio/storyboards')

    return NextResponse.json({
      imageUrl: url,
      publicId,
      style: style || 'cinematic',
      prompt: sceneDescription,
    })
  } catch (error: any) {
    console.error('Storyboard generator error:', error)
    // Return a placeholder if generation fails (e.g. rate limit)
    return NextResponse.json({
      imageUrl: `https://placehold.co/800x450/032940/F27D16?text=Storyboard+Panel`,
      error: 'Generation rate limited — try again in a moment',
    })
  }
}