"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

const AddressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(2),
  country: z.string().min(2),
  isDefault: z.boolean().default(false)
})

export async function updateProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get("name")
  })

  if (!parsed.success) {
    throw new Error("Invalid profile data")
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name }
  })

  revalidatePath("/profile")
}

export async function addAddress(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const parsed = AddressSchema.safeParse({
    street: formData.get("street"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country"),
    isDefault: formData.get("isDefault") === "true",
  })

  if (!parsed.success) throw new Error("Invalid address data")

  if (parsed.data.isDefault) {
    // Unset other defaults
    await prisma.address.updateMany({
      where: { userId: session.user.id, isDefault: true },
      data: { isDefault: false }
    })
  }

  await prisma.address.create({
    data: {
      ...parsed.data,
      userId: session.user.id
    }
  })

  revalidatePath("/profile")
}

export async function deleteAddress(addressId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Ensure user owns address
  const address = await prisma.address.findUnique({
    where: { id: addressId }
  })

  if (address?.userId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await prisma.address.delete({ where: { id: addressId } })
  revalidatePath("/profile")
}
