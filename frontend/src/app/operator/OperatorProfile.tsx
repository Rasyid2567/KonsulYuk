import { useState, useEffect } from "react"
import {
  UserRound,
  Mail,
  Phone,
  Lock,
  Calendar,
  Shield,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react"
import { api, getStoredUser, type User } from "../../services/api"
import { StatusBadge } from "./OperatorCommon"
import { useOperatorToast } from "./OperatorLayout"

export default function OperatorProfile() {
  const { showToast } = useOperatorToast()

  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [loading, setLoading] = useState(true)
  const [profileSubmitting, setProfileSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  // Profile Form
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const res = await api.operator.profile.get()
        if (res.user) {
          setUser(res.user)
          setName(res.user.name || "")
          setPhone(res.user.phone || "")
          setBio(res.user.bio || "")
        }
      } catch (err: any) {
        showToast(err.message || "Gagal memuat profil operator", "error")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast("Nama lengkap tidak boleh kosong", "error")
      return
    }

    try {
      setProfileSubmitting(true)
      const res = await api.operator.profile.update({
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      })
      setUser(res.user)
      showToast("Profil operator berhasil diperbarui!")
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui profil", "error")
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      showToast("Masukkan kata sandi saat ini", "error")
      return
    }
    if (newPassword.length < 8) {
      showToast("Kata sandi baru minimal 8 karakter", "error")
      return
    }
    if (newPassword !== confirmPassword) {
      showToast("Konfirmasi kata sandi baru tidak cocok", "error")
      return
    }

    try {
      setPasswordSubmitting(true)
      await api.operator.profile.update({
        currentPassword,
        newPassword,
      })
      showToast("Kata sandi berhasil diperbarui!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      showToast(err.message || "Gagal mengubah kata sandi", "error")
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
          <UserRound className="text-[#16A765]" size={24} />
          Profil Saya (Operator)
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Kelola informasi identitas akun administrator dan keamanan kata sandi Anda
        </p>
      </div>

      {/* USER CARD SUMMARY */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[#123E46] text-white text-3xl font-black shadow-md">
          {user?.name ? user.name[0].toUpperCase() : "O"}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#123E46]">
              {user?.name || "Operator Sekolah"}
            </h2>
            <StatusBadge status={user?.status || "AKTIF"} />
          </div>
          <p className="text-xs text-[#64748B] flex items-center justify-center sm:justify-start gap-1.5">
            <Mail size={14} className="text-[#16A765]" />
            {user?.email}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-[#16A765]" />
              Role: <strong>Administrator Sistem</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#16A765]" />
              Terdaftar:{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "2026"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* EDIT PROFILE FORM */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#16A765]">
              <UserRound size={17} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#123E46]">
                Perbarui Informasi Pribadi
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Nama lengkap dan nomor kontak resmi
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Email Terdaftar (Tidak dapat diubah)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-3.5 py-2.5 text-[#64748B] cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                No. Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-3456-7890"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Catatan / Bio Operator
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Catatan tanggung jawab operasional"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A765] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#118451] transition disabled:opacity-50"
              >
                {profileSubmitting && <Loader2 size={14} className="animate-spin" />}
                Simpan Profil
              </button>
            </div>
          </form>
        </div>

        {/* CHANGE PASSWORD FORM */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
              <KeyRound size={17} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#123E46]">
                Ganti Kata Sandi
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Pastikan menggunakan kombinasi kata sandi yang kuat
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Kata Sandi Saat Ini *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi lama"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Kata Sandi Baru *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Konfirmasi Kata Sandi Baru *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 focus:border-[#16A765]"
              />
            </div>

            <div className="rounded-xl bg-[#F8FAF9] p-3 border border-[#E2E8F0] text-[11px] text-[#64748B]">
              Perubahan kata sandi akan segera berlaku untuk sesi login berikutnya.
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#123E46] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d555f] transition disabled:opacity-50"
              >
                {passwordSubmitting && <Loader2 size={14} className="animate-spin" />}
                Perbarui Kata Sandi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
