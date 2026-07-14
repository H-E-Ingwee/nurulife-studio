import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadImage(
  file: Buffer | string,
  folder: string = 'nurulife-studio',
  publicId?: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const options: any = {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    }
    if (publicId) options.public_id = publicId

    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) return reject(error)
      resolve({ url: result.secure_url, publicId: result.public_id })
    }).end(file)
  })
}

export async function uploadImageFromBlob(
  blob: Blob,
  folder: string = 'nurulife-studio'
): Promise<{ url: string; publicId: string }> {
  const buffer = Buffer.from(await blob.arrayBuffer())
  return uploadImage(buffer, folder)
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(
  publicId: string,
  width?: number,
  height?: number
): string {
  const transforms: any[] = [{ quality: 'auto', fetch_format: 'auto' }]
  if (width) transforms.push({ width, crop: 'fill' })
  if (height) transforms.push({ height, crop: 'fill' })
  return cloudinary.url(publicId, { transformation: transforms, secure: true })
}