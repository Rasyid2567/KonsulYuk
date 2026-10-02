import pkg from "@prisma/client"

export const {
  PrismaClient,
  Role,
  UserStatus,
  ConsultationStatus,
  ConsultationType,
} = pkg

export type RoleType = "SISWA" | "GURU" | "ADMIN"
export type UserStatusType = "AKTIF" | "NONAKTIF" | "DITANGGUHKAN"
export type ConsultationStatusType =
  | "MENUNGGU"
  | "DITERIMA"
  | "DITOLAK"
  | "SELESAI"
  | "DIBATALKAN"
export type ConsultationTypeType = "CHAT" | "TATAP_MUKA"

const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
export default prisma
