import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  GraduationCap,
  UsersRound,
  ShieldCheck,
  MessagesSquare,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  Calendar,
  Activity,
  UserCheck,
  RefreshCw,
  FileText,
} from "lucide-react"
import { api, type OperatorStats, type Consultation, type AuditLog } from "../../services/api"
import {
  StatisticCard,
  StatusBadge,
  EmptyState,
  LoadingSkeleton,
} from "./OperatorCommon"

export default function OperatorHome() {
  const [data, setData] = useState<OperatorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState("7d")
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string
    label: string
    count: number
    x: number
    y: number
  } | null>(null)

  const fetchStats = async (selectedRange: string) => {
    try {
      setLoading(true)
      const res = await api.operator.stats(selectedRange)
      setData(res)
    } catch (err) {
      console.error("Gagal memuat statistik operator:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(range)
  }, [range])

  const stats = data?.stats
  const chartData = stats?.chartData || []

  // SVG Chart calculation
  const maxVal = Math.max(5, ...chartData.map((d) => d.count))
  const chartWidth = 600
  const chartHeight = 220
  const paddingX = 40
  const paddingY = 30
  const effectiveWidth = chartWidth - paddingX * 2
  const effectiveHeight = chartHeight - paddingY * 2

  const points = chartData.map((d, idx) => {
    const x =
      chartData.length > 1
        ? paddingX + (idx / (chartData.length - 1)) * effectiveWidth
        : chartWidth / 2
    const y =
      chartHeight - paddingY - (d.count / maxVal) * effectiveHeight
    return { ...d, x, y }
  })

  const pathD =
    points.length > 1
      ? points.reduce((acc, p, i) => {
          if (i === 0) return `M ${p.x} ${p.y}`
          // Curve interpolation
          const prev = points[i - 1]
          const cx1 = prev.x + (p.x - prev.x) / 2
          const cy1 = prev.y
          const cx2 = prev.x + (p.x - prev.x) / 2
          const cy2 = p.y
          return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`
        }, "")
      : ""

  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${
          chartHeight - paddingY
        } L ${points[0].x} ${chartHeight - paddingY} Z`
      : ""

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#123E46] to-[#1d555f] text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#E8F7EF] mb-3">
            <span className="h-2 w-2 rounded-full bg-[#16A765] animate-pulse" />
            Sistem KonsulYuk! Beroperasi Normal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Pusat Kendali Operasional
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed">
            Pantau dan kelola seluruh aktivitas bimbingan konseling sekolah, data siswa,
            guru BK, dan konsultasi secara terpadu langsung dari database.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchStats(range)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Perbarui Data
          </button>
        </div>
      </div>

      {/* 2. STATISTIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticCard
          title="Total Siswa Terdaftar"
          value={stats ? stats.totalStudents : "..."}
          description="Siswa dengan akun aktif dan profil terdata"
          icon={GraduationCap}
          iconBgClass="bg-[#E8F7EF] text-[#16A765]"
        />
        <StatisticCard
          title="Guru Bimbingan Konseling"
          value={stats ? stats.totalTeachers : "..."}
          description="Konselor BK sekolah yang siap melayani"
          icon={UsersRound}
          iconBgClass="bg-[#E0F2FE] text-[#0284C7]"
        />
        <StatisticCard
          title="Operator & Administrator"
          value={stats ? stats.totalOperators : "..."}
          description="Pengelola operasional sistem KonsulYuk!"
          icon={ShieldCheck}
          iconBgClass="bg-[#FEF3C7] text-[#D97706]"
        />
        <StatisticCard
          title="Total Pengajuan Konsultasi"
          value={stats ? stats.totalConsultations : "..."}
          description="Akumulasi sesi bimbingan yang terdaftar"
          icon={MessagesSquare}
          iconBgClass="bg-[#F3E8FF] text-[#9333EA]"
        />
      </div>

      {/* 3. STATUS BREAKDOWN TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center shadow-xs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706] mb-2">
            <Clock size={18} />
          </div>
          <p className="text-xl font-black text-[#123E46]">
            {stats?.statusBreakdown.menunggu ?? 0}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B]">Menunggu Konfirmasi</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center shadow-xs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0284C7] mb-2">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-xl font-black text-[#123E46]">
            {stats?.statusBreakdown.diterima ?? 0}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B]">Diterima / Terjadwal</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center shadow-xs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F7EF] text-[#16A765] mb-2">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-xl font-black text-[#123E46]">
            {stats?.statusBreakdown.selesai ?? 0}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B]">Selesai Konsultasi</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center shadow-xs">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#DC2626] mb-2">
            <XCircle size={18} />
          </div>
          <p className="text-xl font-black text-[#123E46]">
            {stats?.statusBreakdown.ditolak ?? 0}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B]">Permintaan Ditolak</p>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 text-center shadow-xs col-span-2 sm:col-span-1">
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F5F9] text-[#64748B] mb-2">
            <XCircle size={18} />
          </div>
          <p className="text-xl font-black text-[#123E46]">
            {stats?.statusBreakdown.dibatalkan ?? 0}
          </p>
          <p className="text-[11px] font-semibold text-[#64748B]">Dibatalkan Siswa</p>
        </div>
      </div>

      {/* 4. GRAFIK KONSULTASI & AKTIVITAS TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-sm font-extrabold text-[#123E46] flex items-center gap-2">
                <TrendingUp size={18} className="text-[#16A765]" />
                Tren Aktivitas Konsultasi
              </h2>
              <p className="text-[11px] text-[#64748B] mt-0.5">
                Jumlah pengajuan sesi konsultasi berdasarkan waktu
              </p>
            </div>

            {/* Time Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-[#F8FAF9] p-1 border border-[#E2E8F0]">
              {[
                { id: "7d", label: "7 Hari" },
                { id: "30d", label: "30 Hari" },
                { id: "3m", label: "3 Bulan" },
                { id: "year", label: "Tahun Ini" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRange(t.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    range === t.id
                      ? "bg-white text-[#16A765] shadow-xs"
                      : "text-[#64748B] hover:text-[#123E46]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* SVG CHART CONTAINER */}
          <div className="relative my-4 w-full overflow-x-auto">
            {chartData.length === 0 ? (
              <EmptyState
                title="Belum ada data grafik"
                description="Aktivitas konsultasi akan digambarkan secara otomatis seiring berjalannya sesi."
              />
            ) : (
              <div className="min-w-[450px]">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-56 overflow-visible"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A765" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#16A765" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                    const y = chartHeight - paddingY - pct * effectiveHeight
                    const labelVal = Math.round(pct * maxVal)
                    return (
                      <g key={i}>
                        <line
                          x1={paddingX}
                          y1={y}
                          x2={chartWidth - paddingX}
                          y2={y}
                          stroke="#E2E8F0"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                        <text
                          x={paddingX - 10}
                          y={y + 3}
                          fill="#94A3B8"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          {labelVal}
                        </text>
                      </g>
                    )
                  })}

                  {/* Area fill */}
                  {areaD && <path d={areaD} fill="url(#chartGrad)" />}

                  {/* Line path */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#16A765"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data Points */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint?.date === p.date ? 6 : 4}
                        fill="#FFFFFF"
                        stroke="#16A765"
                        strokeWidth="2.5"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      {/* X Axis Label */}
                      {(chartData.length <= 8 || idx % Math.ceil(chartData.length / 7) === 0) && (
                        <text
                          x={p.x}
                          y={chartHeight - 8}
                          fill="#64748B"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {p.label.split(",")[0] || p.label}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>

                {/* Hover Tooltip */}
                {hoveredPoint && (
                  <div
                    className="absolute pointer-events-none rounded-xl bg-[#123E46] text-white px-3 py-1.5 text-[11px] font-bold shadow-lg -translate-x-1/2 -translate-y-full mb-2"
                    style={{
                      left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                      top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                    }}
                  >
                    <p className="text-[10px] text-white/70 font-medium">
                      {hoveredPoint.label}
                    </p>
                    <p className="text-xs text-[#E8F7EF] font-bold">
                      {hoveredPoint.count} Konsultasi
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#64748B] pt-3 border-t border-[#E2E8F0]">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#16A765]" />
              Volume Konsultasi Masuk
            </span>
            <span className="text-[11px] font-medium">
              Data sinkron otomatis dengan PostgreSQL
            </span>
          </div>
        </div>

        {/* RECENT ACTIVITIES / AUDIT LOG (1 Col) */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-extrabold text-[#123E46] flex items-center gap-2">
                <Activity size={18} className="text-[#16A765]" />
                Aktivitas Terbaru
              </h2>
              <Link
                to="/operator/audit-log"
                className="text-xs font-bold text-[#16A765] hover:underline"
              >
                Semua
              </Link>
            </div>

            <div className="mt-4 space-y-3.5">
              {!data?.recentActivities || data.recentActivities.length === 0 ? (
                <p className="text-xs text-[#94A3B8] py-8 text-center">
                  Belum ada aktivitas tercatat
                </p>
              ) : (
                data.recentActivities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8F7EF] text-[#16A765] mt-0.5">
                      <FileText size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#123E46] truncate">
                        {act.user?.name || "Operator"}
                      </p>
                      <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                        {act.details}
                      </p>
                      <span className="text-[10px] text-[#94A3B8]">
                        {new Date(act.createdAt).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] mt-4">
            <Link
              to="/operator/audit-log"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F8FAF9] py-2.5 text-xs font-bold text-[#123E46] hover:bg-[#E8F7EF] hover:text-[#16A765] transition border border-[#E2E8F0]"
            >
              Lihat Seluruh Audit Log
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. RECENT CONSULTATIONS TABLE */}
      <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-sm font-extrabold text-[#123E46] flex items-center gap-2">
              <MessagesSquare size={18} className="text-[#16A765]" />
              Pengajuan Konsultasi Terbaru
            </h2>
            <p className="text-[11px] text-[#64748B] mt-0.5">
              Daftar sesi bimbingan yang baru diajukan oleh siswa
            </p>
          </div>

          <Link
            to="/operator/konsultasi"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A765] hover:underline"
          >
            Lihat Semua Konsultasi
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#94A3B8] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Siswa</th>
                <th className="py-3 px-3">Guru BK Dituju</th>
                <th className="py-3 px-3">Topik / Masalah</th>
                <th className="py-3 px-3">Jadwal Sesi</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {!data?.recentConsultations || data.recentConsultations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94A3B8]">
                    Belum ada pengajuan konsultasi
                  </td>
                </tr>
              ) : (
                data.recentConsultations.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F8FAF9] transition">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-[#123E46]">{c.student?.name}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {c.student?.kelas || "Siswa"}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-[#123E46]">
                        {c.teacher?.name || "Belum Ditugaskan"}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block rounded-lg bg-[#E8F7EF] px-2 py-0.5 text-[11px] font-semibold text-[#16A765]">
                        {c.topic}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-[#64748B]">
                      <p className="font-semibold text-[#123E46]">{c.scheduledDate}</p>
                      <p className="text-[11px]">{c.scheduledTime}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/operator/konsultasi?id=${c.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-bold text-[#123E46] hover:bg-[#E8F7EF] hover:text-[#16A765] transition"
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
