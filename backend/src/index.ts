import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import authRoutes from "./routes/auth.routes.js"
import consultationRoutes from "./routes/consultation.routes.js"
import messageRoutes from "./routes/message.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import userRoutes from "./routes/user.routes.js"
import operatorRoutes from "./routes/operator.routes.js"
import prisma from "./lib/prisma.js"

const app = new Hono()

// Middleware
app.use("*", logger())
app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
)

// Health Check
app.get("/api/health", async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return c.json({
      status: "ok",
      service: "KonsulYuk Backend API (Deno / PostgreSQL)",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: "connected",
    })
  } catch (err) {
    return c.json(
      {
        status: "degraded",
        service: "KonsulYuk Backend API",
        database: "disconnected",
        error: String(err),
      },
      503,
    )
  }
})

// Sub-routes
app.route("/api/auth", authRoutes)
app.route("/api/consultations", consultationRoutes)
app.route("/api/consultations", messageRoutes)
app.route("/api/notifications", notificationRoutes)
app.route("/api/users", userRoutes)
app.route("/api/operator", operatorRoutes)

// 404 Handler
app.notFound((c) => {
  return c.json({ error: "Endpoint API tidak ditemukan", path: c.req.path }, 404)
})

// Global Error Handler
app.onError((err, c) => {
  console.error("Unhandled error:", err)
  return c.json({ error: "Terjadi kesalahan internal server", message: err.message }, 500)
})

const PORT = parseInt(process.env.PORT || "5000")

console.log(`
🚀 KonsulYuk Backend Server (Deno / Bun + PostgreSQL)
📡 Berjalan di: http://localhost:${PORT}
🩺 Health Check: http://localhost:${PORT}/api/health
⚡ Siap melayani permintaan API!
`)

if (typeof (globalThis as any).Deno !== "undefined") {
  ;(globalThis as any).Deno.serve({ port: PORT, hostname: "0.0.0.0" }, app.fetch)
}

export default {
  port: PORT,
  hostname: "0.0.0.0",
  fetch: app.fetch,
}
