import { useState, useEffect } from "react"
import { useSearchParams } from "react-router"
import {
  MessagesSquare,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageCircle,
  Users,
  Shield,
  Loader2,
  X,
  ArrowRight,
  FileText,
  UserPlus,
} from "lucide-react"
import {
  api,
  type Consultation,
  type TeacherInfo,
  type PaginationMeta,
} from "../../services/api"
import {
  StatusBadge,
  SearchBar,
  Pagination,
  ConfirmationModal,
  EmptyState,
  LoadingSkeleton,
} from "./OperatorCommon"
import { useOperatorToast } from "./OperatorLayout"

const TIME_SLOTS = [
  "08.00 – 08.30",
  "09.00 – 09.30",
  "10.00 – 10.30",
  "11.00 – 11.30",
  "13.00 – 13.30",
  "14.00 – 14.30",
]

export default function OperatorConsultations() {
  const { showToast } = useOperatorToast()
  const [searchParams] = useSearchParams()

  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [teachers, setTeachers] = useState<TeacherInfo[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Modals
  const [detailItem, setDetailItem] = useState<Consultation | null>(null)
  const [editingItem, setEditingItem] = useState<Consultation | null>(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  // Edit / Reassign form state
  const [formStatus, setFormStatus] = useState<string>("")
  const [formTeacherId, setFormTeacherId] = useState<string>("")
  const [formDate, setFormDate] = useState<string>("")
  const [formTime, setFormTime] = useState<string>("")
  const [formNotes, setFormNotes] = useState<string>("")
  const [formReason, setFormReason] = useState<string>("")

  // Load teachers list for dropdown filter & reassign
  useEffect(() => {
    async function loadTeachers() {
      try {
        const list = await api.auth.getTeachers()
        setTeachers(list)
      } catch {
        // quiet
      }
    }
    loadTeachers()
  }, [])

  const loadConsultations = async (page = 1) => {
    try {
      setLoading(true)
      const res = await api.operator.consultations.list({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
        teacherId: selectedTeacherId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setConsultations(res.consultations)
      setPagination(res.pagination)

      // Auto-open detail if query param 'id' is present
      const queryId = searchParams.get("id")
      if (queryId) {
        const found = res.consultations.find((c) => c.id === queryId)
        if (found) setDetailItem(found)
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memuat konsultasi", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadConsultations(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [search, selectedStatus, selectedTeacherId, startDate, endDate])

  const openEditModal = (c: Consultation) => {
    setEditingItem(c)
    setFormStatus(c.status)
    setFormTeacherId(c.teacherId || "")
    setFormDate(c.scheduledDate || "")
    setFormTime(c.scheduledTime || "")
    setFormNotes(c.notes || "")
    setFormReason("")
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return

    try {
      setModalSubmitting(true)
      await api.operator.consultations.update(editingItem.id, {
        status: formStatus,
        teacherId: formTeacherId || undefined,
        scheduledDate: formDate || undefined,
        scheduledTime: formTime || undefined,
        notes: formNotes || undefined,
        reason: formReason.trim() || undefined,
      })
      showToast("Data konsultasi berhasil diperbarui!")
      setEditingItem(null)
      loadConsultations(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui konsultasi", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <MessagesSquare className="text-[#16A765]" size={24} />
            Manajemen Sesi Konsultasi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Pantau seluruh pengajuan bimbingan konseling, penugasan guru BK, dan kelola status sesi
          </p>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="rounded-2xl bg-white p-4 border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari ID konsultasi, nama siswa, guru BK, atau topik..."
          />

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#123E46] focus:border-[#16A765]"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU">Menunggu</option>
              <option value="DITERIMA">Diterima</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>

            {/* Teacher Filter */}
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
          </div>
        </div>

        {/* Date range filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E2E8F0] text-xs text-[#64748B]">
          <span className="font-semibold text-[#123E46]">Rentang Tanggal:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#123E46]"
            />
            <span>s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-[#123E46]"
            />
          </div>
          {(selectedStatus || selectedTeacherId || startDate || endDate || search) && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedStatus("")
                setSelectedTeacherId("")
                setStartDate("")
                setEndDate("")
              }}
              className="ml-auto text-[11px] font-bold text-[#16A765] hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* CONSULTATIONS TABLE */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">ID Sesi</th>
                <th className="py-3 px-4">Siswa</th>
                <th className="py-3 px-4">Guru BK</th>
                <th className="py-3 px-4">Topik & Tipe</th>
                <th className="py-3 px-4">Jadwal Sesi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <LoadingSkeleton rows={5} />
                  </td>
                </tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Tidak ada sesi konsultasi ditemukan"
                      description="Sesuaikan filter pencarian atau tanggal Anda."
                    />
                  </td>
                </tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAF9] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#123E46]">
                      #{c.id.substring(c.id.length - 6).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#123E46]">{c.student?.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {c.student?.kelas || "Siswa"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      {c.teacher ? (
                        <p className="font-semibold text-[#123E46]">{c.teacher.name}</p>
                      ) : (
                        <span className="rounded-md bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#D97706]">
                          Belum Ditugaskan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#123E46]">{c.topic}</p>
                      <span className="text-[10px] text-[#64748B] flex items-center gap-1 mt-0.5">
                        <MessageCircle size={11} className="text-[#16A765]" />
                        {c.type === "CHAT" ? "Chat Online" : "Tatap Muka"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#123E46]">{c.scheduledDate}</p>
                      <p className="text-[11px] text-[#64748B]">{c.scheduledTime}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailItem(c)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                          title="Lihat Detail Konsultasi"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0284C7] transition"
                          title="Ubah Status / Tugaskan Guru"
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={(p) => loadConsultations(p)}
          onLimitChange={(lim) => {
            setPagination((prev) => ({ ...prev, limit: lim }))
            loadConsultations(1)
          }}
        />
      </div>

      {/* DETAIL MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => setDetailItem(null)}
          />
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#64748B]">
                  ID: {detailItem.id}
                </span>
                <h3 className="text-base font-extrabold text-[#123E46] mt-0.5">
                  Topik: {detailItem.topic}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Status Sesi</p>
                  <div className="mt-1">
                    <StatusBadge status={detailItem.status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#64748B]">Metode Konseling</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailItem.type === "CHAT" ? "Chat Konsultasi Online" : "Tatap Muka di Ruang BK"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Data Siswa</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailItem.student?.name}
                  </p>
                  <p className="text-[#64748B] text-[11px]">
                    {detailItem.student?.kelas || "Siswa"} • {detailItem.student?.email}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Guru BK Ditugaskan</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailItem.teacher?.name || "Belum Ditugaskan"}
                  </p>
                  <p className="text-[#64748B] text-[11px]">
                    {detailItem.teacher?.email || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Jadwal Pelaksanaan</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailItem.scheduledDate}
                  </p>
                  <p className="text-[#64748B] text-[11px]">{detailItem.scheduledTime}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Diajukan Pada</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {new Date(detailItem.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {detailItem.studentNotes && (
                <div className="bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                  <p className="text-[11px] font-semibold text-[#123E46]">
                    Catatan Awal Pengajuan Siswa:
                  </p>
                  <p className="text-[#64748B] mt-1 leading-relaxed italic">
                    "{detailItem.studentNotes}"
                  </p>
                </div>
              )}

              {detailItem.notes && (
                <div className="bg-[#E8F7EF]/50 p-3.5 rounded-xl border border-[#16A765]/20">
                  <p className="text-[11px] font-semibold text-[#16A765]">
                    Catatan Guru BK / Tindak Lanjut:
                  </p>
                  <p className="text-[#123E46] mt-1 leading-relaxed">
                    {detailItem.notes}
                  </p>
                </div>
              )}

              <div className="rounded-xl bg-[#FEF3C7] p-3 text-[11px] text-[#92400E] border border-[#F59E0B]/30 flex items-start gap-2">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <span>
                  Isi percakapan privat antara siswa dan konselor terlindungi oleh kebijakan kerahasiaan bimbingan konseling sekolah.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  const item = detailItem
                  setDetailItem(null)
                  openEditModal(item)
                }}
                className="rounded-xl bg-[#E0F2FE] px-4 py-2 text-xs font-bold text-[#0284C7] hover:bg-[#bae6fd] transition"
              >
                Ubah Status / Penugasan
              </button>
              <button
                type="button"
                onClick={() => setDetailItem(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAF9]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / REASSIGN MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => !modalSubmitting && setEditingItem(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#123E46] flex items-center gap-2">
                  <UserPlus size={18} className="text-[#16A765]" />
                  Kelola Sesi & Penugasan Konselor
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Siswa: <strong>{editingItem.student?.name}</strong> • Topik: {editingItem.topic}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Status Sesi *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
                  >
                    <option value="MENUNGGU">Menunggu</option>
                    <option value="DITERIMA">Diterima / Terjadwal</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DITOLAK">Ditolak</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Guru BK yang Ditugaskan
                  </label>
                  <select
                    value={formTeacherId}
                    onChange={(e) => setFormTeacherId(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
                  >
                    <option value="">Pilih Guru BK</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Tanggal Sesi
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Slot Waktu
                  </label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 text-[#123E46] focus:border-[#16A765]"
                  >
                    <option value="">Pilih Jam</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Alasan Perubahan / Penugasan Ulang (Tercatat di Audit Log)
                </label>
                <input
                  type="text"
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="Contoh: Mengalihkan ke konselor bidang karir"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Catatan Tambahan untuk Sesi
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Catatan administratif sesi konseling"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-[#E2E8F0] px-4 py-2 font-bold text-[#64748B] hover:bg-[#F8FAF9]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16A765] px-5 py-2 font-bold text-white hover:bg-[#118451] disabled:opacity-50"
                >
                  {modalSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
