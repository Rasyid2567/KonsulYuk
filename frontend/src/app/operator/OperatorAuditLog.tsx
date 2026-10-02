import { useState, useEffect } from "react"
import {
  History,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Shield,
  FileText,
  User,
  ExternalLink,
  X,
} from "lucide-react"
import {
  api,
  type AuditLog,
  type PaginationMeta,
} from "../../services/api"
import {
  SearchBar,
  Pagination,
  EmptyState,
  LoadingSkeleton,
} from "./OperatorCommon"
import { useOperatorToast } from "./OperatorLayout"

export default function OperatorAuditLog() {
  const { showToast } = useOperatorToast()

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [actionTypes, setActionTypes] = useState<string[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState("")
  const [selectedAction, setSelectedAction] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const loadAuditLogs = async (page = 1) => {
    try {
      setLoading(true)
      const res = await api.operator.auditLogs.list({
        page,
        limit: pagination.limit,
        search: search.trim() || undefined,
        action: selectedAction || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      })
      setLogs(res.auditLogs)
      setPagination(res.pagination)
      if (res.actionTypes) setActionTypes(res.actionTypes)
    } catch (err: any) {
      showToast(err.message || "Gagal memuat audit log", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAuditLogs(1)
    }, 250)
    return () => clearTimeout(timer)
  }, [search, selectedAction, startDate, endDate])

  const getActionBadgeColor = (action: string) => {
    const a = action.toUpperCase()
    if (a.includes("TAMBAH") || a.includes("BUAT")) {
      return "bg-[#E8F7EF] text-[#16A765] border-[#16A765]/20"
    }
    if (a.includes("UPDATE") || a.includes("UBAH")) {
      return "bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20"
    }
    if (a.includes("HAPUS") || a.includes("NONAKTIF")) {
      return "bg-red-50 text-red-600 border-red-200"
    }
    if (a.includes("INISIALISASI")) {
      return "bg-purple-50 text-purple-700 border-purple-200"
    }
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#123E46] flex items-center gap-2">
            <History className="text-[#16A765]" size={24} />
            Sistem Audit Log & Rekam Jejak
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Catatan permanen hanya-baca (read-only) untuk seluruh aktivitas administratif sistem KonsulYuk!
          </p>
        </div>
      </div>

      {/* COMPLIANCE NOTICE */}
      <div className="rounded-2xl bg-[#E8F7EF] p-4 text-xs text-[#12804f] border border-[#16A765]/20 flex items-start gap-3">
        <Shield size={20} className="shrink-0 text-[#16A765] mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#103D32]">Integritas Data Terjamin</p>
          <p className="text-[11px] leading-relaxed text-[#103D32]/80">
            Catatan audit log bersifat permanen dan tidak dapat diubah maupun dihapus melalui antarmuka
            operator guna mematuhi standar akuntabilitas operasional sekolah.
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="rounded-2xl bg-white p-4 border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari audit log berdasarkan target, detail, atau nama operator..."
          />

          <div className="flex items-center gap-2">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-bold text-[#123E46] focus:border-[#16A765]"
            >
              <option value="">Semua Jenis Tindakan</option>
              {actionTypes.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter */}
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
          {(selectedAction || startDate || endDate || search) && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setSelectedAction("")
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

      {/* AUDIT TABLE */}
      <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAF9] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Waktu (WIB)</th>
                <th className="py-3 px-4">Pengguna / Pelaku</th>
                <th className="py-3 px-4">Jenis Tindakan</th>
                <th className="py-3 px-4">Target Entitas</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4">Alamat IP</th>
                <th className="py-3 px-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <LoadingSkeleton rows={6} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="Tidak ada log audit ditemukan"
                      description="Ubah kata kunci pencarian atau sesuaikan filter jenis tindakan."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAF9] transition">
                    <td className="py-3 px-4 whitespace-nowrap text-[#64748B]">
                      <p className="font-semibold text-[#123E46]">
                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[10px] text-[#94A3B8]">
                        {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#123E46]">
                        {log.user?.name || "Sistem"}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {log.user?.role || "SYSTEM"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-bold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#123E46] max-w-[150px] truncate">
                      {log.target || "-"}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] max-w-[280px]">
                      <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#94A3B8]">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                        title="Lihat Detail Log"
                      >
                        <Eye size={16} />
                      </button>
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
          onPageChange={(p) => loadAuditLogs(p)}
          onLimitChange={(lim) => {
            setPagination((prev) => ({ ...prev, limit: lim }))
            loadAuditLogs(1)
          }}
        />
      </div>

      {/* DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#123E46]/40 backdrop-blur-xs"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#E2E8F0]">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-[#64748B]">
                  ID: {selectedLog.id}
                </span>
                <h3 className="text-base font-extrabold text-[#123E46] mt-0.5">
                  Rincian Catatan Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-[#94A3B8] hover:text-[#123E46]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Waktu Pencatatan</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {new Date(selectedLog.createdAt).toLocaleString("id-ID", {
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Alamat IP</p>
                  <p className="font-mono font-bold text-[#123E46] mt-0.5">
                    {selectedLog.ipAddress || "127.0.0.1"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <div>
                  <p className="text-[11px] text-[#64748B]">Pelaku Tindakan</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {selectedLog.user?.name || "Sistem"}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Role: {selectedLog.user?.role || "SYSTEM"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#64748B]">Target Entitas</p>
                  <p className="font-bold text-[#123E46] mt-0.5">
                    {selectedLog.target || "-"}
                  </p>
                </div>
              </div>

              <div className="bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E2E8F0]">
                <p className="text-[11px] font-semibold text-[#123E46]">
                  Keterangan Lengkap:
                </p>
                <p className="text-[#64748B] mt-1.5 leading-relaxed font-mono text-[11px] bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0] mt-3">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
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
