import { useState, useEffect } from "react"
import {
  UsersRound,
  Plus,
  Edit,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Loader2,
  X,
  Briefcase,
  Sliders,
  Check,
} from "lucide-react"
import {
  api,
  type User,
  type UserStatus,
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

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
const TIME_SLOTS = [
  "08.00 – 08.30",
  "09.00 – 09.30",
  "10.00 – 10.30",
  "11.00 – 11.30",
  "13.00 – 13.30",
  "14.00 – 14.30",
]

export default function OperatorTeachers() {
  const { showToast } = useOperatorToast()

  const [teachers, setTeachers] = useState<
    (User & { totalConsultations: number; activeConsultations: number })[]
  >([])
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

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null)
  const [detailTeacher, setDetailTeacher] = useState<User | null>(null)
  const [scheduleModalTeacher, setScheduleModalTeacher] = useState<User | null>(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  // Form states
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formNip, setFormNip] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formBio, setFormBio] = useState("")
  const [formStatus, setFormStatus] = useState<UserStatus>("AKTIF")

  // Schedule editor state
  const [selectedSchedules, setSelectedSchedules] = useState<
    { day: string; timeSlot: string; isAvailable: boolean }[]
  >([])

  const loadTeachers = async (page = 1) => {
    try {
      setLoading(true)
      const res = await api.operator.teachers.list({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
      })
      setTeachers(res.teachers)
      setPagination(res.pagination)
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data guru BK", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTeachers(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [search, selectedStatus])

  const openCreateModal = () => {
    setFormName("")
    setFormEmail("")
    setFormPassword("password123")
    setFormNip("")
    setFormPhone("")
    setFormBio("Bimbingan Akademik, Pribadi, dan Karir Siswa")
    setShowCreateModal(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formEmail.trim()) {
      showToast("Nama dan email wajib diisi", "error")
      return
    }

    try {
      setModalSubmitting(true)
      await api.operator.teachers.create({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword || "password123",
        nip: formNip.trim() || undefined,
        phone: formPhone.trim() || undefined,
        bio: formBio.trim() || undefined,
      })
      showToast("Akun Guru BK berhasil didaftarkan!")
      setShowCreateModal(false)
      loadTeachers(1)
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan guru BK", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  const openEditModal = (teacher: User) => {
    setEditingTeacher(teacher)
    setFormName(teacher.name)
    setFormEmail(teacher.email)
    setFormNip(teacher.nip || "")
    setFormPhone(teacher.phone || "")
    setFormBio(teacher.bio || "")
    setFormStatus(teacher.status || "AKTIF")
    setFormPassword("")
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeacher) return

    try {
      setModalSubmitting(true)
      await api.operator.teachers.update(editingTeacher.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        nip: formNip.trim() || undefined,
        phone: formPhone.trim() || undefined,
        bio: formBio.trim() || undefined,
        status: formStatus,
        password: formPassword.trim() || undefined,
      })
      showToast("Data Guru BK berhasil diperbarui!")
      setEditingTeacher(null)
      loadTeachers(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui guru BK", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  // Open Schedule Editor Modal
  const openScheduleModal = (teacher: User) => {
    setScheduleModalTeacher(teacher)
    // Map existing schedules
    const existing = teacher.schedules || []
    const mapped: { day: string; timeSlot: string; isAvailable: boolean }[] = []

    DAYS_OF_WEEK.forEach((day) => {
      TIME_SLOTS.forEach((slot) => {
        const found = existing.find((s) => s.day === day && s.timeSlot === slot)
        mapped.push({
          day,
          timeSlot: slot,
          isAvailable: found ? found.isAvailable : true,
        })
      })
    })
    setSelectedSchedules(mapped)
  }

  const toggleScheduleSlot = (day: string, timeSlot: string) => {
    setSelectedSchedules((prev) =>
      prev.map((s) =>
        s.day === day && s.timeSlot === timeSlot
          ? { ...s, isAvailable: !s.isAvailable }
          : s
      )
    )
  }

  const handleSaveSchedules = async () => {
    if (!scheduleModalTeacher) return

    try {
      setModalSubmitting(true)
      await api.operator.teachers.update(scheduleModalTeacher.id, {
        schedules: selectedSchedules,
      })
      showToast("Jadwal ketersediaan Guru BK berhasil diperbarui!")
      setScheduleModalTeacher(null)
      loadTeachers(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan jadwal ketersediaan", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <UsersRound className="text-[#16A765]" size={24} />
            Manajemen Guru Bimbingan Konseling (BK)
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kelola profil konselor, NIP, bidang layanan, dan jam ketersediaan jadwal
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#16A765] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#118451] transition shrink-0"
        >
          <Plus size={16} />
          Tambah Guru BK
        </button>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#E2E8F0] shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari guru BK berdasarkan nama, NIP, email, atau bidang..."
        />

        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#123E46] focus:border-[#16A765] transition"
          >
            <option value="">Semua Status</option>
            <option value="AKTIF">Aktif</option>
            <option value="NONAKTIF">Nonaktif</option>
            <option value="DITANGGUHKAN">Ditangguhkan</option>
          </select>
        </div>
      </div>

      {/* TEACHERS TABLE */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Guru BK</th>
                <th className="py-3 px-4">NIP / Identitas</th>
                <th className="py-3 px-4">Kontak & Email</th>
                <th className="py-3 px-4">Bidang Layanan</th>
                <th className="py-3 px-4 text-center">Konsultasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <LoadingSkeleton rows={4} />
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="Tidak ada guru BK ditemukan"
                      description="Coba ubah kata kunci pencarian atau daftarkan guru BK baru."
                    />
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, idx) => (
                  <tr key={teacher.id} className="hover:bg-[#F8FAF9] transition">
                    <td className="py-3.5 px-4 text-center font-bold text-[#94A3B8]">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0284C7] font-black text-xs shrink-0">
                          {teacher.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#123E46]">{teacher.name}</p>
                          <p className="text-[10px] text-[#16A765] font-semibold">
                            Konselor Sekolah
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#123E46]">
                      {teacher.nip ? (
                        <span className="font-mono text-xs">{teacher.nip}</span>
                      ) : (
                        <span className="text-[#94A3B8] italic">Belum diset</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-[#123E46] font-medium">{teacher.email}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {teacher.phone || "No HP (-)"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="line-clamp-1 max-w-[200px] text-[#64748B]">
                        {teacher.bio || "Konseling Umum"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-[#E0F2FE] px-2 py-0.5 text-xs font-bold text-[#0284C7]">
                        {teacher.totalConsultations ?? 0} Sesi
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={teacher.status || "AKTIF"} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailTeacher(teacher)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                          title="Lihat Detail Guru BK"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openScheduleModal(teacher)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#FEF3C7] hover:text-[#D97706] transition"
                          title="Atur Ketersediaan Jadwal"
                        >
                          <Calendar size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(teacher)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0284C7] transition"
                          title="Edit Guru BK"
                        >
                          <Edit size={16} />
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
          onPageChange={(p) => loadTeachers(p)}
          onLimitChange={(lim) => {
            setPagination((prev) => ({ ...prev, limit: lim }))
            loadTeachers(1)
          }}
        />
      </div>

      {/* CREATE GURU MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => !modalSubmitting && setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#123E46] flex items-center gap-2">
                <Plus size={18} className="text-[#16A765]" />
                Tambah Akun Guru BK Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Dra. Siti Rahmawati, M.Pd., Kons."
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Email Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="siti.bk@sekolah.sch.id"
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    NIP / No. Pegawai
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    placeholder="19850101 201001 2 001"
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Bidang Layanan / Spesialisasi
                </label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Contoh: Bimbingan Karir & Studi Lanjut, Konseling Pribadi-Sosial"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Kata Sandi Sementara (Default: password123)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                  Daftarkan Guru BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GURU MODAL */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => !modalSubmitting && setEditingTeacher(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#123E46] flex items-center gap-2">
                <Edit size={18} className="text-[#0284C7]" />
                Perbarui Akun Guru BK
              </h3>
              <button
                type="button"
                onClick={() => setEditingTeacher(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    NIP / No. Pegawai
                  </label>
                  <input
                    type="text"
                    value={formNip}
                    onChange={(e) => setFormNip(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Status Akun
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                    <option value="DITANGGUHKAN">Ditangguhkan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Bidang Layanan / Bio
                </label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Reset Kata Sandi (Kosongkan jika tidak diubah)
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru jika ingin reset"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="rounded-xl border border-[#E2E8F0] px-4 py-2 font-bold text-[#64748B] hover:bg-[#F8FAF9]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0284C7] px-5 py-2 font-bold text-white hover:bg-sky-700 disabled:opacity-50"
                >
                  {modalSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE AVAILABILITY MODAL */}
      {scheduleModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => !modalSubmitting && setScheduleModalTeacher(null)}
          />
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#123E46] flex items-center gap-2">
                  <Calendar size={18} className="text-[#16A765]" />
                  Pengaturan Ketersediaan Jadwal Konseling
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Guru BK: <strong>{scheduleModalTeacher.name}</strong> • Klik slot untuk
                  mengaktifkan atau menonaktifkan jam layanan
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalTeacher(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto py-2">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9]">
                    <th className="py-2.5 px-3 text-left font-bold text-[#64748B]">
                      Waktu / Slot
                    </th>
                    {DAYS_OF_WEEK.map((day) => (
                      <th
                        key={day}
                        className="py-2.5 px-3 font-bold text-[#123E46]"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {TIME_SLOTS.map((slot) => (
                    <tr key={slot} className="hover:bg-[#F8FAF9]/50">
                      <td className="py-2.5 px-3 text-left font-semibold text-[#123E46]">
                        {slot}
                      </td>
                      {DAYS_OF_WEEK.map((day) => {
                        const item = selectedSchedules.find(
                          (s) => s.day === day && s.timeSlot === slot
                        )
                        const isAvail = item ? item.isAvailable : true
                        return (
                          <td key={day} className="py-2.5 px-2">
                            <button
                              type="button"
                              onClick={() => toggleScheduleSlot(day, slot)}
                              className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                                isAvail
                                  ? "bg-[#E8F7EF] text-[#16A765] border border-[#16A765]/20 hover:bg-[#d5f1e1]"
                                  : "bg-slate-100 text-[#94A3B8] border border-slate-200 line-through hover:bg-slate-200"
                              }`}
                            >
                              {isAvail ? (
                                <>
                                  <Check size={12} strokeWidth={2.5} />
                                  Tersedia
                                </>
                              ) : (
                                "Libur"
                              )}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] mt-4">
              <span className="text-[11px] text-[#64748B]">
                Siswa hanya dapat memilih jam konsultasi pada slot yang bertanda{" "}
                <strong className="text-[#16A765]">Tersedia</strong>.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalTeacher(null)}
                  className="rounded-xl border border-[#E2E8F0] px-4 py-2 font-bold text-[#64748B] hover:bg-[#F8FAF9]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={modalSubmitting}
                  onClick={handleSaveSchedules}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#16A765] px-5 py-2 font-bold text-white hover:bg-[#118451] disabled:opacity-50"
                >
                  {modalSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Simpan Jadwal Guru BK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => setDetailTeacher(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0284C7] font-black text-lg">
                  {detailTeacher.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#123E46]">
                    {detailTeacher.name}
                  </h3>
                  <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                    <span>NIP: {detailTeacher.nip || "-"}</span>
                    <span>•</span>
                    <StatusBadge status={detailTeacher.status || "AKTIF"} />
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailTeacher(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Email Resmi</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailTeacher.email}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">No. Telepon / WhatsApp</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailTeacher.phone || "-"}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <p className="text-[11px] text-[#64748B]">Bidang Layanan & Deskripsi</p>
                <p className="font-medium text-[#123E46] mt-1 leading-relaxed">
                  {detailTeacher.bio || "Konseling umum siswa sekolah."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Tanggal Pendaftaran</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {detailTeacher.createdAt
                      ? new Date(detailTeacher.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Total Konsultasi Ditangani</p>
                  <p className="font-bold text-[#16A765] mt-0.5">
                    {detailTeacher._count?.teacherConsultations ?? 0} Sesi
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setDetailTeacher(null)}
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
