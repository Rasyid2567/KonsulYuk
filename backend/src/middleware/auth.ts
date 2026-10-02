import type { Context, Next } from "hono"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma.js"

const JWT_SECRET = process.env.JWT_SECRET || "konsulyuk_super_secret_jwt_key_2026"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "SISWA" | "GURU" | "ADMIN"
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

  if (!token) {
    return c.json({ error: "Akses ditolak. Token tidak ditemukan." }, 401)
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      return c.json({ error: "Pengguna tidak ditemukan." }, 401)
    }

    c.set("user", user)
    await next()
  } catch {
    return c.json({ error: "Token tidak valid atau kedaluwarsa." }, 401)
  }
}

export function roleMiddleware(allowedRoles: ("SISWA" | "GURU" | "ADMIN")[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user")
    if (!user || !allowedRoles.includes(user.role)) {
      return c.json({ error: "Izin tidak mencukupi untuk tindakan ini." }, 403)
    }
    await next()
  }
}
