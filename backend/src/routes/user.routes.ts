import { Hono } from "hono"
import prisma, { ConsultationStatus, Role } from "../lib/prisma.js"
import { authMiddleware, roleMiddleware } from "../middleware/auth.js"

const users = new Hono()
users.use("*", authMiddleware)

// GET /api/users/students - Guru BK views all registered students
users.get("/students", roleMiddleware([Role.GURU, Role.ADMIN]), async (c) => {
  try {
    const list = await prisma.user.findMany({
      where: { role: Role.SISWA },
      select: {
        id: true,
        name: true,
        email: true,
        kelas: true,
        nisn: true,
        phone: true,
        avatar: true,
        createdAt: true,
        consultationsAsStudent: {
          select: {
            id: true,
            status: true,
            topic: true,
            scheduledDate: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: {
          select: { consultationsAsStudent: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return c.json({ students: list })
  } catch (error) {
    console.error("Get students error:", error)
    return c.json({ error: "Gagal mengambil daftar siswa." }, 500)
  }
})

// GET /api/users/stats - Dashboard analytics
users.get("/stats", async (c) => {
  try {
    const user = c.get("user")
    const isGuru = user.role === Role.GURU

    if (isGuru) {
      const [totalKonsultasi, pendingRequests, activeConsultations, totalStudents] =
        await Promise.all([
          prisma.consultation.count(),
          prisma.consultation.count({ where: { status: ConsultationStatus.MENUNGGU } }),
          prisma.consultation.count({ where: { status: ConsultationStatus.DITERIMA } }),
          prisma.user.count({ where: { role: Role.SISWA } }),
        ])

      return c.json({
        stats: {
          totalKonsultasi,
          pendingRequests,
          activeConsultations,
          totalStudents,
        },
      })
    } else {
      const [myConsultations, myActive, unreadNotifs] = await Promise.all([
        prisma.consultation.count({ where: { studentId: user.id } }),
        prisma.consultation.count({
          where: { studentId: user.id, status: ConsultationStatus.DITERIMA },
        }),
        prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      ])

      return c.json({
        stats: {
          myConsultations,
          myActive,
          unreadNotifs,
        },
      })
    }
  } catch (error) {
    console.error("Get stats error:", error)
    return c.json({ error: "Gagal mengambil data statistik." }, 500)
  }
})

// PATCH /api/users/profile - Update profile
users.patch("/profile", async (c) => {
  try {
    const user = c.get("user")
    const body = await c.req.json()
    const { name, phone, bio, kelas, nisn } = body

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(kelas !== undefined ? { kelas } : {}),
        ...(nisn !== undefined ? { nisn } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        kelas: true,
        nisn: true,
        phone: true,
        bio: true,
      },
    })

    return c.json({ message: "Profil berhasil diperbarui.", user: updated })
  } catch (error) {
    console.error("Update profile error:", error)
    return c.json({ error: "Gagal memperbarui profil." }, 500)
  }
})

export default users
