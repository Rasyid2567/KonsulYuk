import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react"
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  Link,
} from "react-router"
import {
  LayoutDashboard,
  GraduationCap,
  UsersRound,
  ShieldAlert,
  MessagesSquare,
  CalendarDays,
  Bell,
  Settings,
  History,
  UserRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import logo from "../../imports/konsulyuk-logo.png"
import {
  api,
  clearToken,
  getStoredUser,
  type User,
  type NotificationItem,
} from "../../services/api"

// Toast Context for displaying notifications across operator pages
interface Toast {
  id: string
  type: "success" | "error" | "info"
  message: string
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
})

export const useOperatorToast = () => useContext(ToastContext)

interface NavItem {
  label: string
  path: string
  icon: any
  badgeKey?: string
}

const mainNav: NavItem[] = [
  { label: "Beranda", path: "/operator", icon: LayoutDashboard },
  { label: "Manajemen Siswa", path: "/operator/siswa", icon: GraduationCap },
  { label: "Manajemen Guru BK", path: "/operator/guru-bk", icon: UsersRound },
  { label: "Manajemen Operator", path: "/operator/operator", icon: ShieldAlert },
  { label: "Manajemen Konsultasi", path: "/operator/konsultasi", icon: MessagesSquare },
  { label: "Jadwal Konsultasi", path: "/operator/jadwal", icon: CalendarDays },
  { label: "Notifikasi", path: "/operator/notifikasi", icon: Bell },
]

const manageNav: NavItem[] = [
  { label: "Pengaturan Sistem", path: "/operator/pengaturan", icon: Settings },
  { label: "Audit Log", path: "/operator/audit-log", icon: History },
]

const accountNav: NavItem[] = [
  { label: "Profil Saya", path: "/operator/profil", icon: UserRound },
]

export default function OperatorLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Load operator profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const u = await api.auth.me()
        setUser(u)
        if (u.role !== "ADMIN") {
          navigate("/masuk", { replace: true })
        }
      } catch {
        const local = getStoredUser()
        if (!local || local.role !== "ADMIN") {
          navigate("/masuk", { replace: true })
        }
      }
    }
    loadProfile()
  }, [navigate])

  // Load notifications
  useEffect(() => {
    async function loadNotifs() {
      try {
        const data = await api.notifications.list()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } catch {
        // quiet error
      }
    }
    loadNotifs()
    const timer = setInterval(loadNotifs, 30000)
    return () => clearInterval(timer)
  }, [])

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false)
    setShowNotifMenu(false)
    setShowProfileMenu(false)
  }, [location.pathname])

  const handleLogout = () => {
    clearToken()
    navigate("/masuk", { replace: true })
  }

  // Indonesian localized date format
  const todayFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date())

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-[#F8FAF9] text-[#123E46] flex">
        {/* MOBILE OVERLAY */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-[#123E46]/50 backdrop-blur-xs lg:hidden transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#E2E8F0] bg-white transition-all duration-300 ease-in-out lg:static ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${collapsed ? "w-[84px]" : "w-[264px]"}`}
        >
          {/* SIDEBAR HEADER / BRAND */}
          <div className="flex h-[76px] items-center justify-between border-b border-[#E2E8F0] px-5">
            <Link to="/operator" className="flex items-center gap-3 overflow-hidden">
              <img
                src={logo}
                alt="Logo KonsulYuk!"
                className="h-9 w-auto shrink-0 object-contain"
              />
              {!collapsed && (
                <div className="min-w-0 transition-opacity">
                  <span className="text-base font-extrabold text-[#123E46] tracking-tight block">
                    KonsulYuk!
                  </span>
                  <span className="text-[10px] font-bold text-[#16A765] uppercase tracking-wider block">
                    Operator Panel
                  </span>
                </div>
              )}
            </Link>

            {/* Mobile close */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-[#64748B] hover:text-[#123E46] lg:hidden"
              aria-label="Tutup Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* NAV ITEMS */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
            {/* 1. MENU UTAMA */}
            <div>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  Menu Utama
                </p>
              )}
              <div className="space-y-1">
                {mainNav.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/operator"}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#E8F7EF] text-[#16A765] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F8FAF9] hover:text-[#123E46]"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                  >
                    <item.icon
                      size={19}
                      strokeWidth={2}
                      className="shrink-0 transition group-hover:scale-105"
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {item.label === "Notifikasi" && unreadCount > 0 && (
                      <span
                        className={`rounded-full bg-[#16A765] text-white text-[10px] font-extrabold px-1.5 py-0.2 ${
                          collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                        }`}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* 2. PENGELOLAAN */}
            <div>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  Pengelolaan
                </p>
              )}
              <div className="space-y-1">
                {manageNav.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#E8F7EF] text-[#16A765] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F8FAF9] hover:text-[#123E46]"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                  >
                    <item.icon
                      size={19}
                      strokeWidth={2}
                      className="shrink-0 transition group-hover:scale-105"
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* 3. AKUN */}
            <div>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">
                  Akun
                </p>
              )}
              <div className="space-y-1">
                {accountNav.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                        isActive
                          ? "bg-[#E8F7EF] text-[#16A765] shadow-xs"
                          : "text-[#64748B] hover:bg-[#F8FAF9] hover:text-[#123E46]"
                      } ${collapsed ? "justify-center" : ""}`
                    }
                  >
                    <item.icon
                      size={19}
                      strokeWidth={2}
                      className="shrink-0 transition group-hover:scale-105"
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}

                <button
                  type="button"
                  onClick={handleLogout}
                  title={collapsed ? "Keluar" : undefined}
                  className={`group w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#DC5757] hover:bg-red-50 transition ${
                    collapsed ? "justify-center" : ""
                  }`}
                >
                  <LogOut size={19} strokeWidth={2} className="shrink-0" />
                  {!collapsed && <span>Keluar</span>}
                </button>
              </div>
            </div>
          </div>

          {/* SIDEBAR FOOTER (USER & COLLAPSE TOGGLE) */}
          <div className="border-t border-[#E2E8F0] p-3">
            {!collapsed && (
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-[#F8FAF9] p-2.5 border border-[#E2E8F0]/60">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#123E46] text-white font-black text-sm">
                  {user?.name ? user.name[0].toUpperCase() : "O"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#123E46]">
                    {user?.name || "Operator Sekolah"}
                  </p>
                  <p className="text-[10px] font-semibold text-[#16A765] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A765] inline-block" />
                    Operator Aktif
                  </p>
                </div>
              </div>
            )}

            {/* Collapse toggle (Desktop only) */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] py-2 text-xs font-semibold text-[#64748B] hover:bg-[#F8FAF9] hover:text-[#123E46] transition"
              title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
            >
              {collapsed ? (
                <ChevronRight size={17} />
              ) : (
                <>
                  <ChevronLeft size={17} />
                  <span>Ciutkan Menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* TOP HEADER */}
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#E2E8F0] bg-white px-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl p-2 text-[#64748B] hover:bg-[#F8FAF9] hover:text-[#123E46] lg:hidden"
                aria-label="Buka Menu"
              >
                <Menu size={22} />
              </button>
              <div>
                <p className="text-xs font-bold text-[#123E46]">
                  Selamat Datang,{" "}
                  <span className="text-[#16A765]">
                    {user?.name?.split(" ")[0] || "Operator"}!
                  </span>
                </p>
                <p className="text-[11px] font-medium text-[#64748B] capitalize">
                  {todayFormatted}
                </p>
              </div>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-3">
              {/* Notification Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] transition hover:bg-[#F8FAF9] hover:text-[#123E46]"
                  aria-label="Pusat Notifikasi"
                >
                  <Bell size={18} strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#16A765] px-1 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowNotifMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 z-40 w-80 sm:w-96 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-[#16A765]" />
                          <span className="text-xs font-bold text-[#123E46]">
                            Notifikasi Terbaru
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={async () => {
                              await api.notifications.markAllRead()
                              setUnreadCount(0)
                              setNotifications((prev) =>
                                prev.map((n) => ({ ...n, isRead: true }))
                              )
                            }}
                            className="text-[11px] font-bold text-[#16A765] hover:underline"
                          >
                            Tandai Semua Dibaca
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-[#E2E8F0]">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-[#64748B]">
                            Belum ada notifikasi baru
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3.5 transition hover:bg-[#F8FAF9] ${
                                !n.isRead ? "bg-[#E8F7EF]/40" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-[#123E46]">
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-[#94A3B8] shrink-0">
                                  {new Date(n.createdAt).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-[#64748B] line-clamp-2">
                                {n.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="border-t border-[#E2E8F0] p-2 text-center bg-[#F8FAF9] rounded-b-2xl">
                        <Link
                          to="/operator/notifikasi"
                          onClick={() => setShowNotifMenu(false)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A765] hover:underline py-1"
                        >
                          Lihat Semua Notifikasi
                          <ExternalLink size={13} />
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile Avatar & Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2.5 rounded-xl border border-[#E2E8F0] bg-white p-1.5 pr-3 transition hover:bg-[#F8FAF9]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#123E46] text-white font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : "O"}
                  </div>
                  <span className="text-xs font-bold text-[#123E46] hidden sm:inline max-w-[120px] truncate">
                    {user?.name?.split(",")[0] || "Operator"}
                  </span>
                </button>

                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 z-40 w-52 rounded-2xl border border-[#E2E8F0] bg-white shadow-xl p-1.5 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                        <p className="text-xs font-bold text-[#123E46] truncate">
                          {user?.name}
                        </p>
                        <p className="text-[10px] text-[#64748B] truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/operator/profil"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#123E46] hover:bg-[#F8FAF9] transition"
                      >
                        <UserRound size={15} />
                        Profil Saya
                      </Link>
                      <Link
                        to="/operator/pengaturan"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#123E46] hover:bg-[#F8FAF9] transition"
                      >
                        <Settings size={15} />
                        Pengaturan Sistem
                      </Link>
                      <div className="border-t border-[#E2E8F0] my-1" />
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#DC5757] hover:bg-red-50 transition"
                      >
                        <LogOut size={15} />
                        Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>

        {/* TOAST CONTAINER */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold text-white shadow-lg pointer-events-auto transition-all animate-in slide-in-from-bottom-2 ${
                t.type === "success"
                  ? "bg-[#16A765]"
                  : t.type === "error"
                  ? "bg-[#DC5757]"
                  : "bg-[#123E46]"
              }`}
            >
              {t.type === "success" && <CheckCircle2 size={16} />}
              {t.type === "error" && <AlertCircle size={16} />}
              {t.type === "info" && <Sparkles size={16} />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}
