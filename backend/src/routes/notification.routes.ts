import { Hono } from "hono"
import prisma from "../lib/prisma.js"
import { authMiddleware } from "../middleware/auth.js"

const notifications = new Hono()
notifications.use("*", authMiddleware)

// GET /api/notifications
notifications.get("/", async (c) => {
  try {
    const user = c.get("user")
    const list = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    })

    return c.json({ notifications: list, unreadCount })
  } catch (error) {
    console.error("Get notifications error:", error)
    return c.json({ error: "Gagal memuat notifikasi." }, 500)
  }
})

// PATCH /api/notifications/:id/read
notifications.patch("/:id/read", async (c) => {
  try {
    const user = c.get("user")
    const id = c.req.param("id")

    const updated = await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    })

    return c.json({ success: true, updatedCount: updated.count })
  } catch (error) {
    console.error("Mark notification read error:", error)
    return c.json({ error: "Gagal memperbarui notifikasi." }, 500)
  }
})

// POST /api/notifications/read-all
notifications.post("/read-all", async (c) => {
  try {
    const user = c.get("user")

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    })

    return c.json({ success: true, message: "Semua notifikasi ditandai dibaca." })
  } catch (error) {
    console.error("Mark all notifications read error:", error)
    return c.json({ error: "Gagal memperbarui notifikasi." }, 500)
  }
})

export default notifications
