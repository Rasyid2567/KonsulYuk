import { useState, useEffect } from "react"
import {
  GraduationCap,
  Plus,
  Edit,
  Eye,
  Trash2,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  Layers,
  Lock,
  UserCheck,
  UserX,
  Loader2,
  X,
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

export default function OperatorStudents() {
  const { showToast } = useOperatorToast()

  const [students, setStudents] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [kelasOptions, setKelasOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedKelas, setSelectedKelas] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<User | null>(null)
  const [detailStudent, setDetailStudent] = useState<User | null>(null)
  const [detailTab, setDetailTab] = useState<"profil" | "konsultasi" | "aktivitas">("profil")
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    student: User
    newStatus: UserStatus
  } | null>(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  // Form states
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formKelas, setFormKelas] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formStatus, setFormStatus] = useState<UserStatus>("AKTIF")

  const loadStudents = async (page = 1) => {
    try {
      setLoading(true)
      const res = await api.operator.students.list({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        kelas: selectedKelas || undefined,
        status: selectedStatus || undefined,
      })
      setStudents(res.students)
      setPagination(res.pagination)
      if (res.kelasOptions) setKelasOptions(res.kelasOptions)
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data siswa", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [search, selectedKelas, selectedStatus])

  const openCreateModal = () => {
    setFormName("")
    setFormEmail("")
    setFormPassword("password123")
    setFormKelas("X IPA 1")
    setFormPhone("")
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
      await api.operator.students.create({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword || "password123",
        kelas: formKelas || undefined,
        phone: formPhone.trim() || undefined,
      })
      showToast("Akun siswa berhasil ditambahkan!")
      setShowCreateModal(false)
      loadStudents(1)
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan siswa", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  const openEditModal = (student: User) => {
    setEditingStudent(student)
    setFormName(student.name)
    setFormEmail(student.email)
    setFormKelas(student.kelas || "")
    setFormPhone(student.phone || "")
    setFormStatus(student.status || "AKTIF")
    setFormPassword("")
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStudent) return

    try {
      setModalSubmitting(true)
      await api.operator.students.update(editingStudent.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        kelas: formKelas || undefined,
        phone: formPhone.trim() || undefined,
        status: formStatus,
        password: formPassword.trim() || undefined,
      })
      showToast("Data siswa berhasil diperbarui!")
      setEditingStudent(null)
      loadStudents(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui siswa", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  const handleStatusChangeConfirm = async () => {
    if (!confirmStatusModal) return
    const { student, newStatus } = confirmStatusModal

    try {
      setModalSubmitting(true)
      await api.operator.students.update(student.id, {
        status: newStatus,
      })
      showToast(`Status akun ${student.name} diubah menjadi ${newStatus}`)
      setConfirmStatusModal(null)
      loadStudents(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui status", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER & ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <GraduationCap className="text-[#16A765]" size={24} />
            Manajemen Akun Siswa
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kelola data registrasi siswa, status akun, dan riwayat konsultasi sekolah
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#16A765] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#118451] transition shrink-0"
        >
          <Plus size={16} />
          Tambah Siswa Baru
        </button>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-[#E2E8F0] shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari siswa berdasarkan nama, email, atau kelas..."
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Kelas */}
          <div className="relative">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#123E46] focus:border-[#16A765] transition"
            >
              <option value="">Semua Kelas</option>
              {kelasOptions.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="relative">
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
      </div>

      {/* TABLE DATA */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">Email & Kontak</th>
                <th className="py-3 px-4 text-center">Konsultasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Terdaftar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <LoadingSkeleton rows={5} />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="Tidak ada data siswa ditemukan"
                      description="Coba ubah kata kunci pencarian atau sesuaikan filter kelas/status."
                    />
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-[#F8FAF9] transition">
                    <td className="py-3.5 px-4 text-center font-bold text-[#94A3B8]">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#16A765] font-black text-xs shrink-0">
                          {student.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#123E46]">{student.name}</p>
                          <p className="text-[10px] text-[#94A3B8]">
                            ID: {student.id.substring(student.id.length - 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#123E46]">
                      {student.kelas ? (
                        <span className="inline-block rounded-md bg-[#F1F5F9] px-2 py-0.5 text-xs text-[#334155]">
                          {student.kelas}
                        </span>
                      ) : (
                        <span className="text-[#94A3B8] italic">Belum diisi</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-[#123E46] font-medium">{student.email}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {student.phone || "No HP (-)"}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-[#E8F7EF] px-2 py-0.5 text-xs font-bold text-[#16A765]">
                        {student._count?.studentConsultations ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={student.status || "AKTIF"} />
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailStudent(student)
                            setDetailTab("profil")
                          }}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                          title="Lihat Detail Profil Siswa"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(student)}
                          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0284C7] transition"
                          title="Edit Data Siswa"
                        >
                          <Edit size={16} />
                        </button>
                        {student.status === "AKTIF" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmStatusModal({
                                student,
                                newStatus: "NONAKTIF",
                              })
                            }
                            className="rounded-lg p-1.5 text-[#64748B] hover:bg-red-50 hover:text-[#DC5757] transition"
                            title="Nonaktifkan Akun"
                          >
                            <UserX size={16} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmStatusModal({
                                student,
                                newStatus: "AKTIF",
                              })
                            }
                            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                            title="Aktifkan Kembali Akun"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
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
          onPageChange={(p) => loadStudents(p)}
          onLimitChange={(lim) => {
            setPagination((prev) => ({ ...prev, limit: lim }))
            loadStudents(1)
          }}
        />
      </div>

      {/* CREATE MODAL */}
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
                Tambah Akun Siswa Baru
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
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765] focus:ring-2 focus:ring-[#16A765]/15"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Email Siswa *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="rizki@sekolah.sch.id"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765] focus:ring-2 focus:ring-[#16A765]/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    placeholder="Contoh: X IPA 1"
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765] focus:ring-2 focus:ring-[#16A765]/15"
                  />
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
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765] focus:ring-2 focus:ring-[#16A765]/15"
                  />
                </div>
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
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765] focus:ring-2 focus:ring-[#16A765]/15"
                />
                <p className="mt-1 text-[10px] text-[#64748B]">
                  Siswa dapat mengubah kata sandi setelah masuk ke akun KonsulYuk!.
                </p>
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
                  Simpan Akun Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => !modalSubmitting && setEditingStudent(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#123E46] flex items-center gap-2">
                <Edit size={18} className="text-[#0284C7]" />
                Perbarui Akun Siswa
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Nama Lengkap *
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#123E46] mb-1">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                  />
                </div>

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
                  onClick={() => setEditingStudent(null)}
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

      {/* DETAIL MODAL (PRIVACY-PRESERVING) */}
      {detailStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => setDetailStudent(null)}
          />
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F7EF] text-[#16A765] font-black text-lg">
                  {detailStudent.name[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#123E46]">
                    {detailStudent.name}
                  </h3>
                  <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                    <span>{detailStudent.kelas || "Kelas Belum Diisi"}</span>
                    <span>•</span>
                    <StatusBadge status={detailStudent.status || "AKTIF"} />
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pt-3">
              {[
                { id: "profil", label: "Informasi Profil" },
                { id: "konsultasi", label: "Riwayat Konsultasi" },
                { id: "aktivitas", label: "Aktivitas Akun" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDetailTab(t.id as any)}
                  className={`border-b-2 px-3 py-2 text-xs font-bold transition ${
                    detailTab === t.id
                      ? "border-[#16A765] text-[#16A765]"
                      : "border-transparent text-[#64748B] hover:text-[#123E46]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="py-4 text-xs">
              {detailTab === "profil" && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                    <div>
                      <p className="text-[11px] text-[#64748B]">Email Resmi</p>
                      <p className="font-bold text-[#123E46] mt-0.5">
                        {detailStudent.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B]">No. WhatsApp / Telepon</p>
                      <p className="font-bold text-[#123E46] mt-0.5">
                        {detailStudent.phone || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                    <div>
                      <p className="text-[11px] text-[#64748B]">Tanggal Registrasi</p>
                      <p className="font-bold text-[#123E46] mt-0.5">
                        {detailStudent.createdAt
                          ? new Date(detailStudent.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#64748B]">Total Sesi Konsultasi</p>
                      <p className="font-bold text-[#16A765] mt-0.5">
                        {detailStudent._count?.studentConsultations ?? 0} Sesi Terdata
                      </p>
                    </div>
                  </div>

                  {detailStudent.bio && (
                    <div className="bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                      <p className="text-[11px] text-[#64748B]">Biodata / Catatan Siswa</p>
                      <p className="font-medium text-[#123E46] mt-1 leading-relaxed">
                        {detailStudent.bio}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {detailTab === "konsultasi" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-[#FEF3C7] p-3 text-[11px] text-[#92400E] border border-[#F59E0B]/30 flex items-start gap-2">
                    <Shield size={16} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>Privasi Terlindungi:</strong> Sesuai kode etik konseling
                      sekolah, isi percakapan privat antara siswa dan Guru BK tidak
                      ditampilkan kepada operator. Operator hanya dapat melihat metadata sesi.
                    </span>
                  </div>
                  <p className="text-center text-[#64748B] py-6">
                    Siswa telah mengajukan{" "}
                    <strong>
                      {detailStudent._count?.studentConsultations ?? 0}
                    </strong>{" "}
                    sesi konsultasi bimbingan. Kelola status konsultasi melalui menu{" "}
                    <strong>Manajemen Konsultasi</strong>.
                  </p>
                </div>
              )}

              {detailTab === "aktivitas" && (
                <div className="space-y-2">
                  <p className="text-[#64748B] text-center py-6">
                    Status akun saat ini:{" "}
                    <strong className="text-[#123E46]">
                      {detailStudent.status || "AKTIF"}
                    </strong>
                    . Perubahan akun terakhir dicatat dalam sistem Audit Log.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setDetailStudent(null)}
                className="rounded-xl border border-[#E2E8F0] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAF9]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM STATUS MODAL */}
      <ConfirmationModal
        isOpen={!!confirmStatusModal}
        title={`Konfirmasi Perubahan Status Akun`}
        message={
          <span>
            Apakah Anda yakin ingin mengubah status akun{" "}
            <strong>{confirmStatusModal?.student.name}</strong> menjadi{" "}
            <strong>{confirmStatusModal?.newStatus}</strong>?
            {confirmStatusModal?.newStatus === "NONAKTIF" && (
              <span className="block mt-2 text-red-600 font-semibold">
                Siswa tidak akan dapat masuk atau mengajukan sesi baru selama akun nonaktif. Riwayat konsultasi tetap tersimpan aman.
              </span>
            )}
          </span>
        }
        confirmText="Ubah Status"
        isDanger={confirmStatusModal?.newStatus !== "AKTIF"}
        isLoading={modalSubmitting}
        onConfirm={handleStatusChangeConfirm}
        onClose={() => setConfirmStatusModal(null)}
      />
    </div>
  )
}
