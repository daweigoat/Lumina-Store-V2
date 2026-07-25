"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { AccountStatus, Role } from "@prisma/client"

async function isAdmin() {
  const session = await auth()
  return session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"
}

export async function updateUserStatus(userId: string, status: AccountStatus) {
  if (!(await isAdmin())) return { success: false, error: "Unauthorized" }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status }
    })
    
    // Log action
    const session = await auth()
    await prisma.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "UPDATE_USER_STATUS",
        entity: "User",
        entityId: userId,
        details: JSON.stringify({ status })
      }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateUserRole(userId: string, role: Role) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    return { success: false, error: "Only SUPER_ADMIN can change roles" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    await prisma.auditLog.create({
      data: {
        userId: session!.user!.id,
        action: "UPDATE_USER_ROLE",
        entity: "User",
        entityId: userId,
        details: JSON.stringify({ role })
      }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
