import { useState, useEffect } from "react"
import {
  ShieldAlert,
  Plus,
  Edit,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  Lock,
  Loader2,
  X,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import {
  api,
  getStoredUser,
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

export default function OperatorOperators() {
  const { showToast } = useOperatorToast()
  const currentUser = getStoredUser()

  const [operators, setOperators] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOperator, setEditingOperator] = useState<User | null>(null)
  const [confirmStatusModal, setConfirmStatusModal] = useState<{
    operator: User
    newStatus: UserStatus
  } | null>(null)
  const [modalSubmitting, setModalSubmitting] = useState(false)

  // Form states
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formStatus, setFormStatus] = useState<UserStatus>("AKTIF")

  const loadOperators = async (page = 1) => {
    try {
      setLoading(true)
      const res = await api.operator.operators.list({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
      })
      setOperators(res.operators)
      setPagination(res.pagination)
    } catch (err: any) {
      showToast(err.message || "Gagal memuat data operator", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOperators(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [search])

  const openCreateModal = () => {
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormPassword("password123")
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
      await api.operator.operators.create({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword || "password123",
        phone: formPhone.trim() || undefined,
      })
      showToast("Akun operator baru berhasil didaftarkan!")
      setShowCreateModal(false)
      loadOperators(1)
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan operator", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  const openEditModal = (op: User) => {
    setEditingOperator(op)
    setFormName(op.name)
    setFormEmail(op.email)
    setFormPhone(op.phone || "")
    setFormStatus(op.status || "AKTIF")
    setFormPassword("")
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOperator) return

    try {
      setModalSubmitting(true)
      await api.operator.operators.update(editingOperator.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || undefined,
        status: formStatus,
        password: formPassword.trim() || undefined,
      })
      showToast("Data operator berhasil diperbarui!")
      setEditingOperator(null)
      loadOperators(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui data operator", "error")
    } finally {
      setModalSubmitting(false)
    }
  }

  const handleStatusChangeConfirm = async () => {
    if (!confirmStatusModal) return
    const { operator, newStatus } = confirmStatusModal

    try {
      setModalSubmitting(true)
      await api.operator.operators.update(operator.id, {
        status: newStatus,
      })
      showToast(`Status operator ${operator.name} diubah menjadi ${newStatus}`)
      setConfirmStatusModal(null)
      loadOperators(pagination.page)
    } catch (err: any) {
      showToast(err.message || "Gagal mengubah status operator", "error")
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
            <ShieldAlert className="text-[#16A765]" size={24} />
            Manajemen Akun Operator & Admin
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Kelola hak akses administrator sekolah yang bertanggung jawab atas operasional KonsulYuk!
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#16A765] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#118451] transition shrink-0"
        >
          <Plus size={16} />
          Tambah Operator Baru
        </button>
      </div>

      {/* SECURITY NOTICE */}
      <div className="rounded-2xl bg-[#FEF3C7] p-4 text-xs text-[#92400E] border border-[#F59E0B]/30 flex items-start gap-3">
        <ShieldCheck size={20} className="shrink-0 mt-0.5 text-[#D97706]" />
        <div className="space-y-1">
          <p className="font-bold text-[#78350F]">Keamanan Hak Akses Operator</p>
          <p className="text-[11px] leading-relaxed">
            Operator memiliki akses mengelola data siswa, guru BK, jadwal, dan sistem aplikasi.
            Operator tidak dapat menonaktifkan akunnya sendiri atau menonaktifkan akun operator terakhir yang masih aktif.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="rounded-2xl bg-white p-4 border border-[#E2E8F0] shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Cari operator berdasarkan nama atau email..."
        />
      </div>

      {/* OPERATORS TABLE */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Operator</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">No. HP</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dibuat Pada</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <LoadingSkeleton rows={3} />
                  </td>
                </tr>
              ) : operators.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Tidak ada operator ditemukan"
                      description="Coba ubah kata kunci pencarian Anda."
                    />
                  </td>
                </tr>
              ) : (
                operators.map((op, idx) => {
                  const isSelf = currentUser?.id === op.id
                  return (
                    <tr key={op.id} className="hover:bg-[#F8FAF9] transition">
                      <td className="py-3.5 px-4 text-center font-bold text-[#94A3B8]">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706] font-black text-xs shrink-0">
                            {op.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#123E46] flex items-center gap-1.5">
                              {op.name}
                              {isSelf && (
                                <span className="rounded-md bg-[#E8F7EF] px-1.5 py-0.2 text-[10px] font-bold text-[#16A765]">
                                  Anda
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[#64748B]">Administrator</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#123E46]">
                        {op.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {op.phone || "No HP (-)"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={op.status || "AKTIF"} />
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] text-[11px]">
                        {op.createdAt
                          ? new Date(op.createdAt).toLocaleDateString("id-ID", {
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
                            onClick={() => openEditModal(op)}
                            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0284C7] transition"
                            title="Edit Operator"
                          >
                            <Edit size={16} />
                          </button>
                          {!isSelf && (
                            op.status === "AKTIF" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmStatusModal({
                                    operator: op,
                                    newStatus: "NONAKTIF",
                                  })
                                }
                                className="rounded-lg p-1.5 text-[#64748B] hover:bg-red-50 hover:text-[#DC5757] transition"
                                title="Nonaktifkan Akun Operator"
                              >
                                <UserX size={16} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmStatusModal({
                                    operator: op,
                                    newStatus: "AKTIF",
                                  })
                                }
                                className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                                title="Aktifkan Kembali Operator"
                              >
                                <UserCheck size={16} />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
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
          onPageChange={(p) => loadOperators(p)}
          onLimitChange={(lim) => {
            setPagination((prev) => ({ ...prev, limit: lim }))
            loadOperators(1)
          }}
        />
      </div>

      {/* CREATE OPERATOR MODAL */}
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
                Tambah Akun Operator Baru
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
                  Nama Lengkap Operator *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzi, S.Kom."
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#123E46] mb-1">
                  Alamat Email *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="operator2@konsulyuk.id"
                  className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
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
                  Daftarkan Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT OPERATOR MODAL */}
      {editingOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => !modalSubmitting && setEditingOperator(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#123E46] flex items-center gap-2">
                <Edit size={18} className="text-[#0284C7]" />
                Perbarui Akun Operator
              </h3>
              <button
                type="button"
                onClick={() => setEditingOperator(null)}
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
                    disabled={currentUser?.id === editingOperator.id}
                    onChange={(e) => setFormStatus(e.target.value as UserStatus)}
                    className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2.5 font-bold text-[#123E46] focus:border-[#16A765] disabled:bg-slate-100"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                    <option value="DITANGGUHKAN">Ditangguhkan</option>
                  </select>
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
                  onClick={() => setEditingOperator(null)}
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

      {/* CONFIRM STATUS MODAL */}
      <ConfirmationModal
        isOpen={!!confirmStatusModal}
        title={`Konfirmasi Perubahan Status Akun Operator`}
        message={
          <span>
            Apakah Anda yakin ingin mengubah status operator{" "}
            <strong>{confirmStatusModal?.operator.name}</strong> menjadi{" "}
            <strong>{confirmStatusModal?.newStatus}</strong>? Tindakan ini akan dicatat dalam Audit Log sistem.
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
