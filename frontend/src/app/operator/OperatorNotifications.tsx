import { useState, useEffect } from "react"
import { Link } from "react-router"
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  MessagesSquare,
  AlertTriangle,
  Calendar,
  Filter,
} from "lucide-react"
import { api, type NotificationItem } from "../../services/api"
import { EmptyState, LoadingSkeleton } from "./OperatorCommon"
import { useOperatorToast } from "./OperatorLayout"

export default function OperatorNotifications() {
  const { showToast } = useOperatorToast()

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "unread">("all")

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const res = await api.notifications.list()
      setNotifications(res.notifications || [])
      setUnreadCount(res.unreadCount || 0)
    } catch (err: any) {
      showToast(err.message || "Gagal memuat notifikasi", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await api.notifications.markRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
      showToast("Notifikasi ditandai dibaca")
    } catch {
      // quiet
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
      showToast("Semua notifikasi ditandai telah dibaca!")
    } catch {
      // quiet
    }
  }

  const filtered = notifications.filter((n) => {
    if (filterType === "unread") return !n.isRead
    return true
  })

  const getNotifIcon = (type: string) => {
    const t = type.toLowerCase()
    if (t.includes("consultation") || t.includes("konsultasi")) {
      return <MessagesSquare size={18} className="text-[#16A765]" />
    }
    if (t.includes("user") || t.includes("siswa") || t.includes("akun")) {
      return <GraduationCap size={18} className="text-[#0284C7]" />
    }
    if (t.includes("jadwal") || t.includes("schedule")) {
      return <Calendar size={18} className="text-[#D97706]" />
    }
    return <Bell size={18} className="text-[#16A765]" />
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <Bell className="text-[#16A765]" size={24} />
            Pusat Notifikasi Operator
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Pemberitahuan resmi pengajuan bimbingan siswa, aktivasi akun, dan peringatan sistem
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-[#16A765] hover:bg-[#E8F7EF] transition shadow-xs shrink-0"
          >
            <CheckCircle2 size={16} />
            Tandai Semua Dibaca ({unreadCount})
          </button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filterType === "all"
              ? "bg-[#16A765] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#123E46] hover:bg-white"
          }`}
        >
          Semua Notifikasi ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType("unread")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
            filterType === "unread"
              ? "bg-[#16A765] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#123E46] hover:bg-white"
          }`}
        >
          Belum Dibaca ({unreadCount})
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8">
            <EmptyState
              title={
                filterType === "unread"
                  ? "Tidak ada notifikasi yang belum dibaca"
                  : "Belum ada notifikasi tersimpan"
              }
              description="Notifikasi dari siswa, guru BK, dan aktivitas operasional akan muncul di sini secara otomatis."
            />
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4.5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.isRead
                  ? "bg-white border-[#16A765]/40 shadow-xs"
                  : "bg-white/70 border-[#E2E8F0] opacity-85"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    !n.isRead
                      ? "bg-[#E8F7EF] text-[#16A765]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {getNotifIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-xs text-[#123E46]">
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-[#16A765]" />
                    )}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-[#94A3B8] mt-1.5">
                    {new Date(n.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#F8FAF9] px-3 py-1.5 text-xs font-bold text-[#123E46] border border-[#E2E8F0] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                  >
                    Buka
                    <ExternalLink size={12} />
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#64748B] hover:bg-slate-50"
                  >
                    Tandai Dibaca
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
