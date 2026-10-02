import { Hono } from "hono"
import prisma, { ConsultationStatus, ConsultationType, Role } from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const consultations = new Hono()
consultations.use("*", authMiddleware)

// GET /api/consultations - List consultations for the current user
consultations.get("/", async (c) => {
  try {
    const user = c.get("user")
    const isGuru = user.role === Role.GURU

    const list = await prisma.consultation.findMany({
      where: isGuru
        ? {
            OR: [
              { teacherId: user.id },
              { teacherId: null },
              { status: ConsultationStatus.MENUNGGU },
            ],
          }
        : { studentId: user.id },
      include: {
        student: {
          select: { id: true, name: true, email: true, kelas: true, phone: true, avatar: true },
        },
        teacher: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return c.json({ consultations: list })
  } catch (error) {
    console.error("List consultations error:", error)
    return c.json({ error: "Gagal memuat daftar konsultasi." }, 500)
  }
})

// GET /api/consultations/:id - Get consultation details with messages
consultations.get("/:id", async (c) => {
  try {
    const user = c.get("user")
    const id = c.req.param("id")

    const item = await prisma.consultation.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, name: true, email: true, kelas: true, phone: true, avatar: true, bio: true },
        },
        teacher: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, bio: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            senderId: true,
            senderRole: true,
            text: true,
            createdAt: true,
          },
        },
      },
    })

    if (!item) {
      return c.json({ error: "Konsultasi tidak ditemukan." }, 404)
    }

    // Authorization check
    if (user.role === Role.SISWA && item.studentId !== user.id) {
      return c.json({ error: "Anda tidak berhak mengakses sesi konsultasi ini." }, 403)
    }

    return c.json({ consultation: item })
  } catch (error) {
    console.error("Get consultation error:", error)
    return c.json({ error: "Gagal mengambil data konsultasi." }, 500)
  }
})

// POST /api/consultations - Student requests a new consultation
consultations.post("/", async (c) => {
  try {
    const user = c.get("user")
    const body = await c.req.json()
    const { teacherId, topic, type = "CHAT", scheduledDate, scheduledTime, studentNotes } = body

    if (!topic || !scheduledDate || !scheduledTime) {
      return c.json({ error: "Topik, tanggal, dan waktu konsultasi wajib diisi." }, 400)
    }

    const created = await prisma.consultation.create({
      data: {
        studentId: user.id,
        teacherId: teacherId || null,
        topic,
        type: type === "TATAP_MUKA" ? ConsultationType.TATAP_MUKA : ConsultationType.CHAT,
        scheduledDate,
        scheduledTime,
        studentNotes: studentNotes || null,
        status: ConsultationStatus.MENUNGGU,
      },
      include: {
        student: { select: { id: true, name: true, kelas: true } },
        teacher: { select: { id: true, name: true } },
      },
    })

    // If teacher is specified, create notification for teacher
    if (teacherId) {
      await prisma.notification.create({
        data: {
          userId: teacherId,
          title: "Pengajuan Konsultasi Baru",
          message: `${user.name} mengajukan konsultasi baru pada topik "${topic}".`,
          type: "CONSULTATION",
          link: "/guru/permintaan",
        },
      })
    }

    return c.json({
      message: "Konsultasi berhasil diajukan! Menunggu konfirmasi Guru BK.",
      consultation: created,
    }, 201)
  } catch (error) {
    console.error("Create consultation error:", error)
    return c.json({ error: "Gagal mengajukan jadwal konsultasi." }, 500)
  }
})

// PATCH /api/consultations/:id/status - Guru accepts / rejects / completes consultation
consultations.patch("/:id/status", async (c) => {
  try {
    const user = c.get("user")
    const id = c.req.param("id")
    const body = await c.req.json()
    const { status, notes } = body

    if (!status) {
      return c.json({ error: "Status baru wajib ditentukan." }, 400)
    }

    const validStatuses: Record<string, ConsultationStatus> = {
      DITERIMA: ConsultationStatus.DITERIMA,
      DITOLAK: ConsultationStatus.DITOLAK,
      SELESAI: ConsultationStatus.SELESAI,
      DIBATALKAN: ConsultationStatus.DIBATALKAN,
    }

    const targetStatus = validStatuses[status.toUpperCase()]
    if (!targetStatus) {
      return c.json({ error: "Status tidak valid." }, 400)
    }

    const current = await prisma.consultation.findUnique({
      where: { id },
      include: { student: true, teacher: true },
    })

    if (!current) {
      return c.json({ error: "Konsultasi tidak ditemukan." }, 404)
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: {
        status: targetStatus,
        notes: notes !== undefined ? notes : current.notes,
        teacherId: current.teacherId || (user.role === Role.GURU ? user.id : current.teacherId),
      },
      include: {
        student: { select: { id: true, name: true, email: true, kelas: true } },
        teacher: { select: { id: true, name: true } },
      },
    })

    // Create notification for student
    const notifMsg =
      targetStatus === ConsultationStatus.DITERIMA
        ? "Jadwal konsultasimu telah disetujui Guru BK. Ruang cerita sudah dibuka."
        : targetStatus === ConsultationStatus.DITOLAK
          ? "Jadwal konsultasimu belum dapat diterima saat ini. Silakan pilih waktu lain."
          : targetStatus === ConsultationStatus.SELESAI
            ? "Sesi konsultasimu telah selesai. Terima kasih sudah bercerita."
            : "Status konsultasi diperbarui."

    await prisma.notification.create({
      data: {
        userId: current.studentId,
        title: `Konsultasi: ${targetStatus}`,
        message: notifMsg,
        type: "CONSULTATION",
        link: "/siswa/konsultasi",
      },
    })

    return c.json({
      message: `Status konsultasi berhasil diperbarui menjadi ${targetStatus}`,
      consultation: updated,
    })
  } catch (error) {
    console.error("Update consultation status error:", error)
    return c.json({ error: "Gagal memperbarui status konsultasi." }, 500)
  }
})

export default consultations
