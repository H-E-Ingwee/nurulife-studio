import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const contentType = req.headers.get('content-type') || ''

    let imageUrl = ''
    let caption  = ''
    let aiGenerated = false

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      caption     = (formData.get('caption') as string) || ''
      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await uploadImage(buffer, 'nurulife-studio/moodboards')
        imageUrl = result.url
      }
    } else {
      const body = await req.json()
      imageUrl    = body.imageUrl    || ''
      caption     = body.caption     || ''
      aiGenerated = body.aiGenerated || false
    }

    if (!imageUrl) return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })

    const count = await prisma.moodBoardItem.count({ where: { moodBoardId: params.id } })
    const item  = await prisma.moodBoardItem.create({
      data: { moodBoardId: params.id, imageUrl, caption, aiGenerated, order: count },
    })
    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const items = await prisma.moodBoardItem.findMany({
      where: { moodBoardId: params.id },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json({ data: items })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}