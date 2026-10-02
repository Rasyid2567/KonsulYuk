import { Hono } from "hono"
import prisma, { Role } from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const messages = new Hono()
messages.use("*", authMiddleware)

// GET /api/consultations/:id/messages
messages.get("/:id/messages", async (c) => {
  try {
    const user = c.get("user")
    const consultationId = c.req.param("id")

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: { studentId: true, teacherId: true },
    })

    if (!consultation) {
      return c.json({ error: "Konsultasi tidak ditemukan." }, 404)
    }

    if (user.role === Role.SISWA && consultation.studentId !== user.id) {
      return c.json({ error: "Akses ditolak." }, 403)
    }

    const list = await prisma.message.findMany({
      where: { consultationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatar: true },
        },
      },
    })

    return c.json({ messages: list })
  } catch (error) {
    console.error("Get messages error:", error)
    return c.json({ error: "Gagal memuat pesan percakapan." }, 500)
  }
})

// POST /api/consultations/:id/messages
messages.post("/:id/messages", async (c) => {
  try {
    const user = c.get("user")
    const consultationId = c.req.param("id")
    const body = await c.req.json()
    const { text } = body

    if (!text || !text.trim()) {
      return c.json({ error: "Pesan tidak boleh kosong." }, 400)
    }

    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
    })

    if (!consultation) {
      return c.json({ error: "Konsultasi tidak ditemukan." }, 404)
    }

    const senderRole = user.role === Role.GURU ? "teacher" : "student"

    const created = await prisma.message.create({
      data: {
        consultationId,
        senderId: user.id,
        senderRole,
        text: text.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatar: true },
        },
      },
    })

    // Notify the other participant
    const targetUserId = user.role === Role.GURU ? consultation.studentId : consultation.teacherId
    if (targetUserId) {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: `Pesan baru dari ${user.name}`,
          message: text.trim().slice(0, 80) + (text.length > 80 ? "..." : ""),
          type: "MESSAGE",
          link: user.role === Role.GURU ? "/siswa/konsultasi" : "/guru/konsultasi",
        },
      })
    }

    return c.json({ message: created }, 201)
  } catch (error) {
    console.error("Send message error:", error)
    return c.json({ error: "Gagal mengirim pesan." }, 500)
  }
})

export default messages
