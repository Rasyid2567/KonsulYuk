import { type ReactNode } from "react"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react"

// ==========================================
// 1. STATUS BADGE
// ==========================================
export function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase()

  if (s === "AKTIF") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F7EF] px-2.5 py-0.5 text-xs font-semibold text-[#16A765] border border-[#16A765]/20">
        <span className="h-1.5 w-1.5 rounded-full bg-[#16A765]" />
        Aktif
      </span>
    )
  }

  if (s === "NONAKTIF") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#64748B] border border-[#CBD5E1]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]" />
        Nonaktif
      </span>
    )
  }

  if (s === "DITANGGUHKAN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#D97706] border border-[#F59E0B]/30">
        <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
        Ditangguhkan
      </span>
    )
  }

  if (s === "MENUNGGU") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold text-[#D97706] border border-[#F59E0B]/30">
        <Clock size={12} />
        Menunggu
      </span>
    )
  }

  if (s === "DITERIMA") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-semibold text-[#0284C7] border border-[#38BDF8]/30">
        <CheckCircle2 size={12} />
        Diterima
      </span>
    )
  }

  if (s === "SELESAI") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F7EF] px-2.5 py-0.5 text-xs font-semibold text-[#16A765] border border-[#16A765]/20">
        <CheckCircle2 size={12} />
        Selesai
      </span>
    )
  }

  if (s === "DITOLAK") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-xs font-semibold text-[#DC2626] border border-[#EF4444]/30">
        <XCircle size={12} />
        Ditolak
      </span>
    )
  }

  if (s === "DIBATALKAN") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-xs font-semibold text-[#64748B] border border-[#CBD5E1]">
        <AlertCircle size={12} />
        Dibatalkan
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {status}
    </span>
  )
}

// ==========================================
// 2. STATISTIC CARD
// ==========================================
export function StatisticCard({
  title,
  value,
  description,
  icon: Icon,
  badgeText,
  badgePositive = true,
  bgClass = "bg-white",
  iconBgClass = "bg-[#E8F7EF] text-[#16A765]",
}: {
  title: string
  value: number | string
  description?: string
  icon: any
  badgeText?: string
  badgePositive?: boolean
  bgClass?: string
  iconBgClass?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-[#E2E8F0] p-5 shadow-xs transition hover:shadow-md ${bgClass}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgClass}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
        {badgeText && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              badgePositive
                ? "bg-[#E8F7EF] text-[#16A765]"
                : "bg-red-50 text-red-600"
            }`}
          >
            {badgeText}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-[#64748B]">{title}</p>
        <p className="mt-1 text-2xl font-black text-[#123E46] tracking-tight">{value}</p>
        {description && (
          <p className="mt-1.5 text-[11px] text-[#64748B] leading-relaxed line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// ==========================================
// 3. SEARCH & FILTER BAR
// ==========================================
export function SearchBar({
  value,
  onChange,
  placeholder = "Cari data...",
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-xs font-medium placeholder:text-[#94A3B8] focus:border-[#16A765] focus:ring-2 focus:ring-[#16A765]/15 transition"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

// ==========================================
// 4. PAGINATION
// ==========================================
export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (newPage: number) => void
  onLimitChange?: (newLimit: number) => void
}) {
  if (total === 0) return null

  const startIdx = (page - 1) * limit + 1
  const endIdx = Math.min(page * limit, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] px-4 py-3.5 bg-white rounded-b-2xl">
      <div className="flex items-center gap-2 text-xs text-[#64748B]">
        <span>
          Menampilkan <strong className="text-[#123E46]">{startIdx}</strong>–
          <strong className="text-[#123E46]">{endIdx}</strong> dari{" "}
          <strong className="text-[#123E46]">{total}</strong> data
        </span>
        {onLimitChange && (
          <div className="ml-3 flex items-center gap-1.5">
            <span className="text-[11px]">Baris:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs font-semibold text-[#123E46]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#123E46] transition hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p = i + 1
          if (totalPages > 5 && page > 3) {
            p = page - 2 + i
            if (p > totalPages) p = totalPages - (4 - i)
          }
          if (p < 1 || p > totalPages) return null

          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                page === p
                  ? "bg-[#16A765] text-white shadow-xs"
                  : "border border-[#E2E8F0] bg-white text-[#123E46] hover:bg-[#F8FAF9]"
              }`}
            >
              {p}
            </button>
          )
        })}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-xs font-semibold text-[#123E46] transition hover:bg-[#F8FAF9] disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 5. CONFIRMATION MODAL
// ==========================================
export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  confirmColor = "bg-[#16A765] hover:bg-[#118451]",
  isDanger = false,
  isLoading = false,
  onConfirm,
  onClose,
}: {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  isDanger?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isDanger
                ? "bg-red-50 text-[#DC5757]"
                : "bg-[#E8F7EF] text-[#16A765]"
            }`}
          >
            {isDanger ? <AlertTriangle size={22} /> : <Shield size={22} />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#123E46]">{title}</h3>
            <div className="mt-2 text-xs text-[#64748B] leading-relaxed">
              {message}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-xs font-bold text-[#64748B] transition hover:bg-[#F8FAF9] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 ${
              isDanger ? "bg-[#DC5757] hover:bg-red-700" : confirmColor
            }`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 6. EMPTY & LOADING STATES
// ==========================================
export function EmptyState({
  title = "Tidak ada data ditemukan",
  description = "Belum ada catatan yang cocok dengan filter atau pencarian saat ini.",
  icon: Icon = Search,
  actionButton,
}: {
  title?: string
  description?: string
  icon?: any
  actionButton?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F7EF] text-[#16A765] mb-4">
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h3 className="text-sm font-bold text-[#123E46]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs text-[#64748B] leading-relaxed">
        {description}
      </p>
      {actionButton && <div className="mt-5">{actionButton}</div>}
    </div>
  )
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-11 w-full animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  )
}
