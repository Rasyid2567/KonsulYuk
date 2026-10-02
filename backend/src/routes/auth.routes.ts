import { Hono } from "hono"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma, { Role } from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const JWT_SECRET = process.env.JWT_SECRET || "konsulyuk_super_secret_jwt_key_2026"
const auth = new Hono()

// POST /api/auth/register
auth.post("/register", async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, password, role = "SISWA", kelas, phone, nisn } = body

    if (!name || !email || !password) {
      return c.json({ error: "Nama, email, dan kata sandi wajib diisi." }, 400)
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existing) {
      return c.json({ error: "Email sudah terdaftar. Silakan masuk." }, 409)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const userRole = role.toUpperCase() === "GURU" ? Role.GURU : Role.SISWA

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: userRole,
        kelas: kelas || null,
        phone: phone || null,
        nisn: nisn || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        kelas: true,
        phone: true,
        avatar: true,
      },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    return c.json({
      message: "Registrasi akun berhasil!",
      user,
      token,
    })
  } catch (error) {
    console.error("Register error:", error)
    return c.json({ error: "Terjadi kesalahan server saat mendaftarkan akun." }, 500)
  }
})

// POST /api/auth/login
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json()
    const { email, password } = body

    if (!email || !password) {
      return c.json({ error: "Email dan kata sandi wajib diisi." }, 400)
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return c.json({ error: "Email atau kata sandi tidak sesuai." }, 401)
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return c.json({ error: "Email atau kata sandi tidak sesuai." }, 401)
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    return c.json({
      message: "Berhasil masuk ke KonsulYuk!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kelas: user.kelas,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return c.json({ error: "Terjadi kesalahan server saat masuk." }, 500)
  }
})

// GET /api/auth/me
auth.get("/me", authMiddleware, async (c) => {
  const authUser = c.get("user")
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kelas: true,
      phone: true,
      nisn: true,
      avatar: true,
      bio: true,
      createdAt: true,
    },
  })

  if (!user) {
    return c.json({ error: "Pengguna tidak ditemukan." }, 404)
  }

  return c.json({ user })
})

// GET /api/auth/teachers
auth.get("/teachers", async (c) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: Role.GURU },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        schedules: {
          select: {
            id: true,
            day: true,
            timeSlot: true,
            isAvailable: true,
          },
        },
      },
    })
    return c.json({ teachers })
  } catch (error) {
    console.error("Get teachers error:", error)
    return c.json({ error: "Gagal mengambil daftar guru BK." }, 500)
  }
})

export default auth
