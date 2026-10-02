import { useState, useEffect } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  Calendar,
  List,
  Eye,
  Loader2,
  X,
  MessageCircle,
} from "lucide-react"
import {
  api,
  type Consultation,
  type TeacherInfo,
} from "../../services/api"
import { StatusBadge, EmptyState } from "./OperatorCommon"
import { useOperatorToast } from "./OperatorLayout"

export default function OperatorSchedule() {
  const { showToast } = useOperatorToast()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [teachers, setTeachers] = useState<TeacherInfo[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [viewMode, setViewMode] = useState<"bulan" | "minggu" | "agenda">("bulan")

  // Current calendar date pointer
  const [currentDate, setCurrentDate] = useState(new Date())

  // Detail item modal
  const [selectedSession, setSelectedSession] = useState<Consultation | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [cRes, tRes] = await Promise.all([
          api.operator.consultations.list({ limit: 100 }),
          api.auth.getTeachers(),
        ])
        setConsultations(cRes.consultations)
        setTeachers(tRes)
      } catch (err: any) {
        showToast(err.message || "Gagal memuat jadwal konsultasi", "error")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter consultations
  const filtered = consultations.filter((c) => {
    if (selectedTeacherId && c.teacherId !== selectedTeacherId) return false
    if (selectedStatus && c.status !== selectedStatus) return false
    return true
  })

  // Detect schedule conflicts (same teacher, same date, same timeSlot, status active/accepted/waiting)
  const conflicts: { [key: string]: Consultation[] } = {}
  filtered.forEach((c) => {
    if (c.status === "DIBATALKAN" || c.status === "DITOLAK") return
    if (!c.teacherId || !c.scheduledDate || !c.scheduledTime) return
    const key = `${c.teacherId}_${c.scheduledDate}_${c.scheduledTime}`
    if (!conflicts[key]) conflicts[key] = []
    conflicts[key].push(c)
  })

  const conflictKeys = Object.keys(conflicts).filter((k) => conflicts[k].length > 1)

  // Calendar calculations for Monthly View
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // 0 = Sunday, 1 = Monday, etc. Adjust for Monday start (0=Senin, 6=Minggu)
  const startDay = (firstDayOfMonth.getDay() + 6) % 7

  const daysArray: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    daysArray.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  const setToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const getSessionsForDate = (dayNum: number) => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      dayNum
    ).padStart(2, "0")}`
    return filtered.filter((c) => c.scheduledDate === dStr)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <CalendarDays className="text-[#16A765]" size={24} />
            Jadwal & Agenda Konsultasi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kalender visual seluruh agenda bimbingan konseling dan deteksi bentrok jadwal guru BK
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 border border-[#E2E8F0] shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("bulan")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "bulan"
                ? "bg-[#16A765] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#123E46]"
            }`}
          >
            <Calendar size={14} />
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => setViewMode("agenda")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "agenda"
                ? "bg-[#16A765] text-white shadow-xs"
                : "text-[#64748B] hover:text-[#123E46]"
            }`}
          >
            <List size={14} />
            Daftar Agenda
          </button>
        </div>
      </div>

      {/* CONFLICT BANNER IF ANY */}
      {conflictKeys.length > 0 && (
        <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-950">
              Peringatan: Ditemukan {conflictKeys.length} Bentrok Jadwal Konseling!
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Terdapat sesi bimbingan pada guru BK dan slot waktu yang bersamaan.
              Silakan periksa tanggal yang ditandai atau alihkan konselor di halaman Manajemen Konsultasi.
            </p>
          </div>
        </div>
      )}

      {/* FILTER BAR & CALENDAR NAV */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#E2E8F0] shadow-xs">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#123E46] hover:bg-[#F8FAF9]"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[170px] text-center font-extrabold text-sm text-[#123E46]">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] text-[#123E46] hover:bg-[#F8FAF9]"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={setToday}
            className="ml-2 rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-xs font-bold text-[#123E46] hover:bg-[#F8FAF9]"
          >
            Hari Ini
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2">
          <select
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#123E46] focus:border-[#16A765]"
          >
            <option value="">Semua Guru BK</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#123E46] focus:border-[#16A765]"
          >
            <option value="">Semua Status</option>
            <option value="MENUNGGU">Menunggu</option>
            <option value="DITERIMA">Diterima</option>
            <option value="SELESAI">Selesai</option>
          </select>
        </div>
      </div>

      {/* VIEW: BULANAN */}
      {viewMode === "bulan" && (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
          {/* Calendar Header Day Names */}
          <div className="grid grid-cols-7 border-b border-[#E2E8F0] bg-[#F8FAF9] text-center text-[11px] font-extrabold text-[#64748B] py-3">
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span className="text-[#DC5757]">Sabtu</span>
            <span className="text-[#DC5757]">Minggu</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E2E8F0]">
            {daysArray.map((dayNum, i) => {
              if (dayNum === null) {
                return (
                  <div
                    key={`empty-${i}`}
                    className="min-h-[110px] bg-slate-50/50 p-2"
                  />
                )
              }

              const sessions = getSessionsForDate(dayNum)
              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[110px] p-2 flex flex-col justify-between transition hover:bg-[#F8FAF9]/80 ${
                    isToday ? "bg-[#E8F7EF]/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? "bg-[#16A765] text-white"
                          : "text-[#123E46]"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {sessions.length > 0 && (
                      <span className="text-[10px] font-bold text-[#64748B]">
                        {sessions.length} sesi
                      </span>
                    )}
                  </div>

                  {/* Sessions items on day */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px]">
                    {sessions.map((sess) => {
                      const isConflict = conflictKeys.some((k) =>
                        conflicts[k].some((c) => c.id === sess.id)
                      )
                      return (
                        <button
                          key={sess.id}
                          type="button"
                          onClick={() => setSelectedSession(sess)}
                          className={`w-full text-left rounded-lg p-1 text-[10px] leading-tight font-medium transition truncate block ${
                            isConflict
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : sess.status === "DITERIMA"
                              ? "bg-[#E0F2FE] text-[#0284C7] hover:bg-sky-200"
                              : sess.status === "MENUNGGU"
                              ? "bg-[#FEF3C7] text-[#D97706] hover:bg-amber-200"
                              : sess.status === "SELESAI"
                              ? "bg-[#E8F7EF] text-[#16A765] hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {isConflict && (
                              <AlertTriangle size={10} className="shrink-0 text-amber-600" />
                            )}
                            <span className="font-bold truncate">
                              {sess.scheduledTime.split("–")[0]} • {sess.student?.name}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW: DAFTAR AGENDA */}
      {viewMode === "agenda" && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Tanggal & Jam</th>
                  <th className="py-3 px-4">Siswa</th>
                  <th className="py-3 px-4">Guru BK</th>
                  <th className="py-3 px-4">Topik</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="Tidak ada agenda konsultasi"
                        description="Belum ada jadwal sesi bimbingan pada filter ini."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAF9] transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#123E46]">{c.scheduledDate}</p>
                        <p className="text-[11px] text-[#64748B]">{c.scheduledTime}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#123E46]">
                        {c.student?.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#123E46]">
                        {c.teacher?.name || "Belum Ditugaskan"}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#123E46]">
                        {c.topic}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-semibold text-[#334155]">
                          {c.type === "CHAT" ? "Chat Online" : "Tatap Muka"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSession(c)}
                          className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-bold text-[#123E46] hover:bg-[#E8F7EF] hover:text-[#16A765]"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SESSION DETAIL MODAL */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => setSelectedSession(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#123E46]">
                  Rincian Sesi Konsultasi
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Topik: <strong>{selectedSession.topic}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Siswa</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {selectedSession.student?.name}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {selectedSession.student?.kelas || "Siswa"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Guru BK Ditugaskan</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {selectedSession.teacher?.name || "Belum Ditugaskan"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Tanggal & Jam</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {selectedSession.scheduledDate}
                  </p>
                  <p className="text-[#64748B] text-[11px]">
                    {selectedSession.scheduledTime}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Status Sesi</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedSession.status} />
                  </div>
                </div>
              </div>

              {selectedSession.studentNotes && (
                <div className="bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <p className="text-[11px] font-semibold text-[#123E46]">
                    Catatan Pengajuan Siswa:
                  </p>
                  <p className="text-[#64748B] mt-1 italic">
                    "{selectedSession.studentNotes}"
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0] mt-3">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAF9]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
