import { useState, useEffect } from "react"
import {
  Settings,
  School,
  Sliders,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Tag,
  Plus,
  X,
} from "lucide-react"
import { api } from "../../services/api"
import { ConfirmationModal } from "./OperatorCommon"
import { useOperatorToast } from "./OperatorLayout"

export default function OperatorSettings() {
  const { showToast } = useOperatorToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Settings state dictionary
  const [settings, setSettings] = useState<Record<string, string>>({
    app_name: "KonsulYuk!",
    school_name: "SMA Negeri 1 Talun",
    school_address: "Jl. Raya Talun No. 01, Blitar, Jawa Timur",
    school_phone: "(0342) 691234",
    school_email: "bk.sman1talun@sch.id",
    app_description: "Aplikasi Bimbingan & Konseling Sekolah Terpadu",
    consultations_enabled: "true",
    operating_hours: "07.30 - 15.30",
    operating_days: "Senin - Jumat",
    max_consultations_per_student: "3",
    categories: "Akademik, Pribadi, Karir & Masa Depan, Sosial & Pertemanan",
    in_app_notifications: "true",
    email_notifications: "true",
    privacy_policy_url: "Kebijakan kerahasiaan data siswa terlindungi UU Perlindungan Data Pribadi.",
  })

  // Tag categories editor state
  const [categoriesList, setCategoriesList] = useState<string[]>([])
  const [newCategoryInput, setNewCategoryInput] = useState("")

  const loadSettings = async () => {
    try {
      setLoading(true)
      const res = await api.operator.settings.get()
      if (res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }))
        if (res.settings.categories) {
          setCategoriesList(
            res.settings.categories.split(",").map((c) => c.trim()).filter(Boolean)
          )
        }
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memuat pengaturan sistem", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const addCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return
    if (categoriesList.includes(trimmed)) {
      showToast("Kategori sudah ada", "info")
      return
    }
    const updated = [...categoriesList, trimmed]
    setCategoriesList(updated)
    setSettings((prev) => ({ ...prev, categories: updated.join(", ") }))
    setNewCategoryInput("")
  }

  const removeCategory = (cat: string) => {
    const updated = categoriesList.filter((c) => c !== cat)
    setCategoriesList(updated)
    setSettings((prev) => ({ ...prev, categories: updated.join(", ") }))
  }

  const handleSave = async () => {
    try {
      setSubmitting(true)
      await api.operator.settings.update(settings)
      showToast("Seluruh pengaturan sistem berhasil disimpan ke database!")
      setShowConfirmModal(false)
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan pengaturan", "error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* HEADER & SAVE BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <Settings className="text-[#16A765]" size={24} />
            Pengaturan Sistem KonsulYuk!
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Konfigurasi identitas sekolah, jam layanan operasional, alur konsultasi, dan notifikasi
          </p>
        </div>

        <button
          type="button"
          disabled={loading || submitting}
          onClick={() => setShowConfirmModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#16A765] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#118451] transition disabled:opacity-50 shrink-0"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Simpan Semua Pengaturan
        </button>
      </div>

      {/* 1. INFORMASI APLIKASI & SEKOLAH */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F7EF] text-[#16A765]">
            <School size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#123E46]">
              Informasi Aplikasi & Sekolah
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Profil instansi yang ditampilkan pada antarmuka siswa dan guru BK
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#123E46] mb-1">
              Nama Aplikasi
            </label>
            <input
              type="text"
              value={settings.app_name || "KonsulYuk!"}
              onChange={(e) => handleChange("app_name", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123E46] mb-1">
              Nama Sekolah
            </label>
            <input
              type="text"
              value={settings.school_name || "SMA Negeri 1 Talun"}
              onChange={(e) => handleChange("school_name", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#123E46] mb-1">
              Deskripsi Singkat Aplikasi
            </label>
            <input
              type="text"
              value={
                settings.app_description ||
                "Aplikasi Bimbingan & Konseling Sekolah Terpadu"
              }
              onChange={(e) => handleChange("app_description", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-[#123E46] focus:border-[#16A765]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123E46] mb-1">
              Email Resmi BK / Sekolah
            </label>
            <input
              type="email"
              value={settings.school_email || "bk.sman1talun@sch.id"}
              onChange={(e) => handleChange("school_email", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-[#123E46] focus:border-[#16A765]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123E46] mb-1">
              No. Telepon / Hotline BK
            </label>
            <input
              type="text"
              value={settings.school_phone || "(0342) 691234"}
              onChange={(e) => handleChange("school_phone", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-[#123E46] focus:border-[#16A765]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[#123E46] mb-1">
              Alamat Instansi Sekolah
            </label>
            <input
              type="text"
              value={
                settings.school_address ||
                "Jl. Raya Talun No. 01, Blitar, Jawa Timur"
              }
              onChange={(e) => handleChange("school_address", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-[#123E46] focus:border-[#16A765]"
            />
          </div>
        </div>
      </div>

      {/* 2. PENGATURAN KONSULTASI */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0284C7]">
            <Sliders size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#123E46]">
              Pengaturan Alur Konsultasi Siswa
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Kontrol jadwal pengajuan bimbingan, jam operasional, dan topik layanan
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Toggle Enable Consultations */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0]">
            <div>
              <p className="font-bold text-[#123E46]">
                Penerimaan Pengajuan Konsultasi Baru
              </p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Jika dinonaktifkan, siswa sementara tidak dapat membuat janji baru (misal: saat libur semester).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.consultations_enabled === "true"}
                onChange={(e) =>
                  handleChange(
                    "consultations_enabled",
                    e.target.checked ? "true" : "false"
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A765]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Jam Operasional Layanan BK
              </label>
              <input
                type="text"
                value={settings.operating_hours || "07.30 - 15.30"}
                onChange={(e) => handleChange("operating_hours", e.target.value)}
                placeholder="Contoh: 07.30 - 15.30"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#123E46] mb-1">
                Hari Layanan Bimbingan
              </label>
              <input
                type="text"
                value={settings.operating_days || "Senin - Jumat"}
                onChange={(e) => handleChange("operating_days", e.target.value)}
                placeholder="Contoh: Senin - Jumat"
                className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 font-bold text-[#123E46] focus:border-[#16A765]"
              />
            </div>
          </div>

          {/* Kategori Konsultasi Tag Editor */}
          <div>
            <label className="block font-semibold text-[#123E46] mb-1">
              Topik & Kategori Konsultasi Aktif
            </label>
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0] mb-2">
              {categoriesList.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#123E46] border border-[#E2E8F0] shadow-2xs"
                >
                  <Tag size={12} className="text-[#16A765]" />
                  {cat}
                  <button
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className="ml-1 text-[#94A3B8] hover:text-[#DC5757]"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addCategory()
                  }
                }}
                placeholder="Tambah kategori baru (contoh: Minat & Bakat)..."
                className="flex-1 rounded-xl border border-[#E2E8F0] px-3.5 py-2 text-xs focus:border-[#16A765]"
              />
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1 rounded-xl bg-[#16A765] px-4 py-2 font-bold text-white hover:bg-[#118451] transition"
              >
                <Plus size={15} />
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PENGATURAN NOTIFIKASI & PRIVASI */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E8F0]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706]">
            <Bell size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#123E46]">
              Notifikasi & Kebijakan Privasi
            </h2>
            <p className="text-[11px] text-[#64748B]">
              Kelola pengiriman notifikasi otomatis dan pernyataan privasi data
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0]">
            <div>
              <p className="font-bold text-[#123E46]">Notifikasi Dalam Aplikasi</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Kirim pembaruan status konsultasi dan pesan langsung ke akun siswa.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.in_app_notifications === "true"}
                onChange={(e) =>
                  handleChange(
                    "in_app_notifications",
                    e.target.checked ? "true" : "false"
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A765]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAF9] border border-[#E2E8F0]">
            <div>
              <p className="font-bold text-[#123E46]">Pemberitahuan Email</p>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Kirim ringkasan sesi ke email terdaftar pengguna jika email service aktif.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_notifications === "true"}
                onChange={(e) =>
                  handleChange(
                    "email_notifications",
                    e.target.checked ? "true" : "false"
                  )
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A765]"></div>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-[#123E46] mb-1">
              Pernyataan Kebijakan Privasi Sekolah
            </label>
            <textarea
              rows={2}
              value={settings.privacy_policy_url || ""}
              onChange={(e) => handleChange("privacy_policy_url", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] px-3.5 py-2.5 text-[#123E46] focus:border-[#16A765]"
            />
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Simpan Perubahan Pengaturan Sistem?"
        message="Perubahan konfigurasi akan segera berdampak pada seluruh pengguna aktif sistem KonsulYuk!. Apakah Anda yakin ingin menerapkan perubahan ini?"
        confirmText="Ya, Terapkan"
        isLoading={submitting}
        onConfirm={handleSave}
        onClose={() => setShowConfirmModal(false)}
      />
    </div>
  )
}
