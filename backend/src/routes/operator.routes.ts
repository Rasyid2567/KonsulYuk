import { Hono } from "hono"
import bcrypt from "bcryptjs"
import prisma, { ConsultationStatus, Role, UserStatus } from "../lib/prisma.js"
import { authMiddleware, roleMiddleware } from "../middleware/auth.js"

const operator = new Hono()

// Guard: Only ADMIN (Operator) can access this router
operator.use("*", authMiddleware)
operator.use("*", roleMiddleware([Role.ADMIN]))

// Helper to record audit logs
async function logAudit(
  userId: string | undefined,
  action: string,
  target: string | null,
  details: string,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        details,
        ipAddress: ipAddress || "127.0.0.1",
      },
    })
  } catch (err) {
    console.error("Failed to log audit:", err)
  }
}

// ==========================================
// 1. BERANDA / STATS & RINGKASAN
// ==========================================
operator.get("/stats", async (c) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalOperators,
      totalConsultations,
      pendingConsultations,
      acceptedConsultations,
      completedConsultations,
      rejectedConsultations,
      cancelledConsultations,
      recentActivities,
      recentConsultations,
      allConsultationsForTrend,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.SISWA } }),
      prisma.user.count({ where: { role: Role.GURU } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.consultation.count(),
      prisma.consultation.count({ where: { status: ConsultationStatus.MENUNGGU } }),
      prisma.consultation.count({ where: { status: ConsultationStatus.DITERIMA } }),
      prisma.consultation.count({ where: { status: ConsultationStatus.SELESAI } }),
      prisma.consultation.count({ where: { status: ConsultationStatus.DITOLAK } }),
      prisma.consultation.count({ where: { status: ConsultationStatus.DIBATALKAN } }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, role: true } } },
      }),
      prisma.consultation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { id: true, name: true, kelas: true, avatar: true } },
          teacher: { select: { id: true, name: true, avatar: true } },
        },
      }),
      prisma.consultation.findMany({
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
    ])

    // Generate daily consultation trend for the last 7 days & 30 days
    const now = new Date()
    const last7Days: { date: string; label: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" })
      const count = allConsultationsForTrend.filter(
        (c) => c.createdAt.toISOString().split("T")[0] === dateStr
      ).length
      last7Days.push({ date: dateStr, label, count })
    }

    return c.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalOperators,
        totalConsultations,
        statusBreakdown: {
          menunggu: pendingConsultations,
          diterima: acceptedConsultations,
          selesai: completedConsultations,
          ditolak: rejectedConsultations,
          dibatalkan: cancelledConsultations,
        },
        chartData: last7Days,
      },
      recentActivities,
      recentConsultations,
    })
  } catch (error) {
    console.error("Operator stats error:", error)
    return c.json({ error: "Gagal mengambil data statistik operator." }, 500)
  }
})

// ==========================================
// 2. MANAJEMEN SISWA
// ==========================================
operator.get("/students", async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")))
    const search = (c.req.query("search") || "").trim()
    const kelas = c.req.query("kelas") || ""
    const status = c.req.query("status") as UserStatus | ""

    const where: any = { role: Role.SISWA }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    if (kelas) {
      where.kelas = { contains: kelas, mode: "insensitive" }
    }

    if (status) {
      where.status = status
    }

    const [total, students] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          kelas: true,
          nisn: true,
          phone: true,
          status: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { consultationsAsStudent: true } },
          consultationsAsStudent: {
            take: 3,
            orderBy: { createdAt: "desc" },
            select: { id: true, topic: true, status: true, scheduledDate: true },
          },
        },
      }),
    ])

    return c.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    console.error("Operator get students error:", error)
    return c.json({ error: "Gagal memuat daftar siswa." }, 500)
  }
})

operator.post("/students", async (c) => {
  try {
    const admin = c.get("user")
    const body = await c.req.json()
    const { name, email, password, kelas, phone, nisn, status = "AKTIF" } = body

    if (!name || !email) {
      return c.json({ error: "Nama lengkap dan email wajib diisi." }, 400)
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return c.json({ error: "Email sudah digunakan oleh akun lain." }, 409)
    }

    const passwordHash = await bcrypt.hash(password || "password123", 10)

    const student = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: Role.SISWA,
        status: status as UserStatus,
        kelas: kelas ? kelas.trim() : null,
        phone: phone ? phone.trim() : null,
        nisn: nisn ? nisn.trim() : null,
      },
    })

    await logAudit(
      admin.id,
      "TAMBAH_SISWA",
      student.name,
      `Operator menambahkan akun siswa baru: ${student.email} (Kelas: ${student.kelas || "-"})`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Siswa berhasil ditambahkan.", student }, 201)
  } catch (error) {
    console.error("Operator create student error:", error)
    return c.json({ error: "Gagal menambahkan akun siswa." }, 500)
  }
})

operator.patch("/students/:id", async (c) => {
  try {
    const admin = c.get("user")
    const id = c.req.param("id")
    const body = await c.req.json()
    const { name, email, kelas, phone, nisn, status, password } = body

    const existing = await prisma.user.findUnique({
      where: { id },
    })

    if (!existing || existing.role !== Role.SISWA) {
      return c.json({ error: "Data siswa tidak ditemukan." }, 404)
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name.trim()
    if (email && email.toLowerCase().trim() !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
      if (emailTaken) return c.json({ error: "Email sudah digunakan oleh akun lain." }, 409)
      dataToUpdate.email = email.toLowerCase().trim()
    }
    if (kelas !== undefined) dataToUpdate.kelas = kelas ? kelas.trim() : null
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null
    if (nisn !== undefined) dataToUpdate.nisn = nisn ? nisn.trim() : null
    if (status) dataToUpdate.status = status as UserStatus
    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10)
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    })

    const changes = Object.keys(dataToUpdate).join(", ")
    await logAudit(
      admin.id,
      status && status !== existing.status ? "UBAH_STATUS_SISWA" : "UPDATE_SISWA",
      updated.name,
      `Memperbarui profil siswa (${changes}). Status: ${updated.status}`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Data siswa berhasil diperbarui.", student: updated })
  } catch (error) {
    console.error("Operator update student error:", error)
    return c.json({ error: "Gagal memperbarui data siswa." }, 500)
  }
})

// ==========================================
// 3. MANAJEMEN GURU BK
// ==========================================
operator.get("/teachers", async (c) => {
  try {
    const search = (c.req.query("search") || "").trim()
    const status = c.req.query("status") as UserStatus | ""

    const where: any = { role: Role.GURU }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { nip: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }
    if (status) {
      where.status = status
    }

    const teachers = await prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        nip: true,
        phone: true,
        bio: true,
        status: true,
        avatar: true,
        createdAt: true,
        schedules: {
          select: { id: true, day: true, timeSlot: true, isAvailable: true },
          orderBy: { day: "asc" },
        },
        _count: {
          select: {
            consultationsAsTeacher: true,
          },
        },
      },
    })

    return c.json({ teachers })
  } catch (error) {
    console.error("Operator get teachers error:", error)
    return c.json({ error: "Gagal memuat data guru BK." }, 500)
  }
})

operator.post("/teachers", async (c) => {
  try {
    const admin = c.get("user")
    const body = await c.req.json()
    const { name, email, password, nip, phone, bio, schedules } = body

    if (!name || !email) {
      return c.json({ error: "Nama lengkap dan email Guru BK wajib diisi." }, 400)
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (existing) {
      return c.json({ error: "Email sudah terdaftar di sistem." }, 409)
    }

    const passwordHash = await bcrypt.hash(password || "password123", 10)

    const teacher = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: Role.GURU,
        status: UserStatus.AKTIF,
        nip: nip ? nip.trim() : null,
        phone: phone ? phone.trim() : null,
        bio: bio ? bio.trim() : "Guru Bimbingan Konseling",
        ...(schedules && Array.isArray(schedules) && schedules.length > 0
          ? {
              schedules: {
                createMany: {
                  data: schedules.map((s: any) => ({
                    day: s.day,
                    timeSlot: s.timeSlot,
                    isAvailable: s.isAvailable ?? true,
                  })),
                },
              },
            }
          : {}),
      },
      include: { schedules: true },
    })

    await logAudit(
      admin.id,
      "TAMBAH_GURU_BK",
      teacher.name,
      `Operator mendaftarkan Guru BK baru: ${teacher.name} (${teacher.email})`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Akun Guru BK berhasil ditambahkan.", teacher }, 201)
  } catch (error) {
    console.error("Operator create teacher error:", error)
    return c.json({ error: "Gagal mendaftarkan Guru BK baru." }, 500)
  }
})

operator.patch("/teachers/:id", async (c) => {
  try {
    const admin = c.get("user")
    const id = c.req.param("id")
    const body = await c.req.json()
    const { name, email, nip, phone, bio, status, password, schedules } = body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing || existing.role !== Role.GURU) {
      return c.json({ error: "Data Guru BK tidak ditemukan." }, 404)
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name.trim()
    if (email && email.toLowerCase().trim() !== existing.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
      if (emailTaken) return c.json({ error: "Email sudah digunakan oleh akun lain." }, 409)
      dataToUpdate.email = email.toLowerCase().trim()
    }
    if (nip !== undefined) dataToUpdate.nip = nip ? nip.trim() : null
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null
    if (bio !== undefined) dataToUpdate.bio = bio ? bio.trim() : null
    if (status) dataToUpdate.status = status as UserStatus
    if (password) dataToUpdate.passwordHash = await bcrypt.hash(password, 10)

    // Update schedules if passed
    if (schedules && Array.isArray(schedules)) {
      await prisma.teacherSchedule.deleteMany({ where: { teacherId: id } })
      if (schedules.length > 0) {
        await prisma.teacherSchedule.createMany({
          data: schedules.map((s: any) => ({
            teacherId: id,
            day: s.day,
            timeSlot: s.timeSlot,
            isAvailable: s.isAvailable ?? true,
          })),
        })
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { schedules: true },
    })

    await logAudit(
      admin.id,
      status && status !== existing.status ? "UBAH_STATUS_GURU" : "UPDATE_GURU_BK",
      updated.name,
      `Memperbarui profil atau ketersediaan jadwal Guru BK (${updated.name})`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Data Guru BK berhasil diperbarui.", teacher: updated })
  } catch (error) {
    console.error("Operator update teacher error:", error)
    return c.json({ error: "Gagal memperbarui data Guru BK." }, 500)
  }
})

// ==========================================
// 4. MANAJEMEN OPERATOR
// ==========================================
operator.get("/operators", async (c) => {
  try {
    const operators = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { auditLogs: true } },
      },
    })
    return c.json({ operators })
  } catch (error) {
    console.error("Operator get list error:", error)
    return c.json({ error: "Gagal memuat daftar operator." }, 500)
  }
})

operator.post("/operators", async (c) => {
  try {
    const admin = c.get("user")
    const body = await c.req.json()
    const { name, email, phone, password } = body

    if (!name || !email || !password) {
      return c.json({ error: "Nama lengkap, email, dan kata sandi wajib diisi." }, 400)
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })
    if (existing) {
      return c.json({ error: "Email sudah digunakan." }, 409)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newOperator = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: Role.ADMIN,
        status: UserStatus.AKTIF,
        phone: phone ? phone.trim() : null,
      },
    })

    await logAudit(
      admin.id,
      "TAMBAH_OPERATOR",
      newOperator.name,
      `Operator mendaftarkan akun operator baru: ${newOperator.email}`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Operator baru berhasil ditambahkan.", operator: newOperator }, 201)
  } catch (error) {
    console.error("Operator create operator error:", error)
    return c.json({ error: "Gagal menambahkan akun operator." }, 500)
  }
})

operator.patch("/operators/:id", async (c) => {
  try {
    const admin = c.get("user")
    const id = c.req.param("id")
    const body = await c.req.json()
    const { name, email, phone, status, password } = body

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing || existing.role !== Role.ADMIN) {
      return c.json({ error: "Operator tidak ditemukan." }, 404)
    }

    // Protection: If attempting to deactivate, check that it is not the last active operator
    if (status === UserStatus.NONAKTIF || status === UserStatus.DITANGGUHKAN) {
      const activeCount = await prisma.user.count({
        where: { role: Role.ADMIN, status: UserStatus.AKTIF },
      })
      if (activeCount <= 1 && existing.status === UserStatus.AKTIF) {
        return c.json(
          { error: "Tindakan ditolak. Tidak dapat menonaktifkan satu-satunya operator aktif di sistem." },
          400
        )
      }
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name.trim()
    if (email && email.toLowerCase().trim() !== existing.email) {
      const taken = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })
      if (taken) return c.json({ error: "Email sudah digunakan." }, 409)
      dataToUpdate.email = email.toLowerCase().trim()
    }
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null
    if (status) dataToUpdate.status = status as UserStatus
    if (password) dataToUpdate.passwordHash = await bcrypt.hash(password, 10)

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    })

    await logAudit(
      admin.id,
      "UPDATE_OPERATOR",
      updated.name,
      `Memperbarui data akun operator (${updated.email}). Status: ${updated.status}`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Data operator berhasil diperbarui.", operator: updated })
  } catch (error) {
    console.error("Operator update operator error:", error)
    return c.json({ error: "Gagal memperbarui akun operator." }, 500)
  }
})

// ==========================================
// 5. MANAJEMEN KONSULTASI & JADWAL
// ==========================================
operator.get("/consultations", async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"))
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")))
    const search = (c.req.query("search") || "").trim()
    const status = c.req.query("status") as ConsultationStatus | ""
    const teacherId = c.req.query("teacherId") || ""
    const dateFrom = c.req.query("dateFrom") || ""
    const dateTo = c.req.query("dateTo") || ""

    const where: any = {}
    if (status) where.status = status
    if (teacherId) where.teacherId = teacherId
    if (dateFrom && dateTo) {
      where.scheduledDate = { gte: dateFrom, lte: dateTo }
    } else if (dateFrom) {
      where.scheduledDate = { gte: dateFrom }
    }

    if (search) {
      where.OR = [
        { topic: { contains: search, mode: "insensitive" } },
        { student: { name: { contains: search, mode: "insensitive" } } },
        { student: { kelas: { contains: search, mode: "insensitive" } } },
        { teacher: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [total, consultations] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: { id: true, name: true, email: true, kelas: true, phone: true, avatar: true },
          },
          teacher: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
          _count: { select: { messages: true } },
        },
      }),
    ])

    return c.json({
      consultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    console.error("Operator get consultations error:", error)
    return c.json({ error: "Gagal memuat daftar konsultasi." }, 500)
  }
})

operator.patch("/consultations/:id", async (c) => {
  try {
    const admin = c.get("user")
    const id = c.req.param("id")
    const body = await c.req.json()
    const { status, teacherId, scheduledDate, scheduledTime, notes } = body

    const existing = await prisma.consultation.findUnique({
      where: { id },
      include: { student: true, teacher: true },
    })

    if (!existing) {
      return c.json({ error: "Konsultasi tidak ditemukan." }, 404)
    }

    const dataToUpdate: any = {}
    if (status) dataToUpdate.status = status as ConsultationStatus
    if (teacherId !== undefined) dataToUpdate.teacherId = teacherId || null
    if (scheduledDate) dataToUpdate.scheduledDate = scheduledDate
    if (scheduledTime) dataToUpdate.scheduledTime = scheduledTime
    if (notes !== undefined) dataToUpdate.notes = notes

    const updated = await prisma.consultation.update({
      where: { id },
      data: dataToUpdate,
      include: { student: true, teacher: true },
    })

    // Log action to audit
    let actionType = "UPDATE_KONSULTASI"
    let detailMsg = `Status diubah menjadi ${updated.status}`
    if (teacherId && teacherId !== existing.teacherId) {
      actionType = "PENUGASAN_ULANG_GURU"
      detailMsg = `Guru BK dialihkan ke ${updated.teacher?.name || "-"}`
    }

    await logAudit(
      admin.id,
      actionType,
      `Konsultasi #${id.slice(-6)} (${updated.student.name})`,
      `${detailMsg} • Jadwal: ${updated.scheduledDate} ${updated.scheduledTime}`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    // Notify student about consultation status update
    try {
      await prisma.notification.create({
        data: {
          userId: updated.studentId,
          title: "Pembaruan Jadwal Konsultasi",
          message: `Konsultasi Anda telah diperbarui oleh operator ke status: ${updated.status}.`,
          type: "SCHEDULE",
          link: "/siswa/konsultasi",
        },
      })
    } catch {}

    return c.json({ message: "Konsultasi berhasil diperbarui.", consultation: updated })
  } catch (error) {
    console.error("Operator update consultation error:", error)
    return c.json({ error: "Gagal memperbarui data konsultasi." }, 500)
  }
})

// ==========================================
// 6. AUDIT LOGS
// ==========================================
operator.get("/audit-logs", async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(c.req.query("limit") || "15")))
    const search = (c.req.query("search") || "").trim()
    const action = c.req.query("action") || ""
    const dateFrom = c.req.query("dateFrom") || ""
    const dateTo = c.req.query("dateTo") || ""

    const where: any = {}
    if (action) where.action = action
    if (dateFrom && dateTo) {
      where.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo + "T23:59:59.999Z"),
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { target: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
    ])

    return c.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    })
  } catch (error) {
    console.error("Operator audit logs error:", error)
    return c.json({ error: "Gagal memuat catatan audit log." }, 500)
  }
})

// ==========================================
// 7. PENGATURAN SISTEM
// ==========================================
operator.get("/settings", async (c) => {
  try {
    const list = await prisma.systemSetting.findMany({
      orderBy: { key: "asc" },
    })

    const settingsMap: Record<string, string> = {}
    for (const item of list) {
      settingsMap[item.key] = item.value
    }

    return c.json({ settings: settingsMap, raw: list })
  } catch (error) {
    console.error("Operator get settings error:", error)
    return c.json({ error: "Gagal memuat pengaturan sistem." }, 500)
  }
})

operator.patch("/settings", async (c) => {
  try {
    const admin = c.get("user")
    const body = await c.req.json()
    const { settings } = body

    if (!settings || typeof settings !== "object") {
      return c.json({ error: "Data pengaturan tidak valid." }, 400)
    }

    const updates = []
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: {
            key,
            value: String(value),
            description: `Pengaturan ${key}`,
          },
        })
      )
    }

    await Promise.all(updates)

    await logAudit(
      admin.id,
      "UPDATE_PENGATURAN",
      "Sistem",
      `Operator memperbarui konfigurasi sistem (${Object.keys(settings).join(", ")})`,
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Pengaturan sistem berhasil disimpan." })
  } catch (error) {
    console.error("Operator update settings error:", error)
    return c.json({ error: "Gagal menyimpan pengaturan sistem." }, 500)
  }
})

// ==========================================
// 8. PROFIL OPERATOR
// ==========================================
operator.get("/profile", async (c) => {
  try {
    const user = c.get("user")
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    })
    return c.json({ user: profile })
  } catch (error) {
    return c.json({ error: "Gagal memuat profil operator." }, 500)
  }
})

operator.patch("/profile", async (c) => {
  try {
    const admin = c.get("user")
    const body = await c.req.json()
    const { name, phone, bio, currentPassword, newPassword } = body

    const userInDb = await prisma.user.findUnique({ where: { id: admin.id } })
    if (!userInDb) return c.json({ error: "Pengguna tidak ditemukan." }, 404)

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = name.trim()
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null
    if (bio !== undefined) dataToUpdate.bio = bio ? bio.trim() : null

    if (newPassword) {
      if (!currentPassword) {
        return c.json({ error: "Kata sandi lama wajib diisi untuk mengubah kata sandi." }, 400)
      }
      const match = await bcrypt.compare(currentPassword, userInDb.passwordHash)
      if (!match) {
        return c.json({ error: "Kata sandi lama salah." }, 400)
      }
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: admin.id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, phone: true, bio: true, avatar: true },
    })

    await logAudit(
      admin.id,
      "UPDATE_PROFIL_OPERATOR",
      updated.name,
      "Operator memperbarui profil pribadinya",
      c.req.header("x-forwarded-for") || "127.0.0.1"
    )

    return c.json({ message: "Profil berhasil diperbarui.", user: updated })
  } catch (error) {
    console.error("Operator update profile error:", error)
    return c.json({ error: "Gagal memperbarui profil operator." }, 500)
  }
})

export default operator
