import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from "uuid"

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "mock-account-id"
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "mock-access-key"
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "mock-secret-key"
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "mock-bucket"
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || `https://${R2_BUCKET_NAME}.r2.dev`

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadImageToR2(file: Buffer, fileName: string, contentType: string): Promise<string> {
  if (R2_ACCOUNT_ID === "mock-account-id") {
    console.warn("Using mock R2 credentials. Upload bypassed.")
    return `https://mock-r2-domain.com/uploads/${uuidv4()}-${fileName}`
  }

  const key = `uploads/${uuidv4()}-${fileName}`

  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  return `${R2_PUBLIC_DOMAIN}/${key}`
}

export async function uploadMultipleImagesToR2(files: { buffer: Buffer; fileName: string; contentType: string }[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImageToR2(file.buffer, file.fileName, file.contentType))
  return Promise.all(uploadPromises)
}

export async function deleteImageFromR2(fileUrl: string): Promise<boolean> {
  if (R2_ACCOUNT_ID === "mock-account-id" || fileUrl.includes("mock-r2-domain.com")) {
    return true; // Mock success
  }

  try {
    const key = fileUrl.replace(`${R2_PUBLIC_DOMAIN}/`, "")
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error("Failed to delete image from R2:", error)
    return false
  }
}

export async function generatePresignedUploadUrl(fileName: string, contentType: string): Promise<{ uploadUrl: string; finalUrl: string }> {
  if (R2_ACCOUNT_ID === "mock-account-id") {
    const key = `uploads/${uuidv4()}-${fileName}`
    return {
      uploadUrl: `https://mock-r2-domain.com/presigned/${key}`,
      finalUrl: `${R2_PUBLIC_DOMAIN}/${key}`
    }
  }

  const key = `uploads/${uuidv4()}-${fileName}`
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  return {
    uploadUrl,
    finalUrl: `${R2_PUBLIC_DOMAIN}/${key}`
  }
}
