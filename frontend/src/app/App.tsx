import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react"
import {
  createBrowserRouter,
  RouterProvider,
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router"
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Heart,
  House,
  LockKeyhole,
  LogOut,
  Menu,
  MessageCircle,
  MessagesSquare,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Sparkles,
  UserRound,
  UsersRound,
  X,
  CircleCheck,
  Plus,
  History,
  Mail,
  GraduationCap,
  Info,
  Phone,
} from "lucide-react"
import logo from "../imports/konsulyuk-logo.png"
import {
  api,
  getStoredUser,
  clearToken,
  getToken,
  isRemembered,
  setRemembered,
  type User,
  type TeacherInfo,
  type Consultation,
  type Message as ApiMessage,
  type NotificationItem,
  type DashboardStats,
} from "../services/api"
import OperatorLayout from "./operator/OperatorLayout"
import OperatorHome from "./operator/OperatorHome"
import OperatorStudents from "./operator/OperatorStudents"
import OperatorTeachers from "./operator/OperatorTeachers"
import OperatorOperators from "./operator/OperatorOperators"
import OperatorConsultations from "./operator/OperatorConsultations"
import OperatorSchedule from "./operator/OperatorSchedule"
import OperatorNotifications from "./operator/OperatorNotifications"
import OperatorSettings from "./operator/OperatorSettings"
import OperatorAuditLog from "./operator/OperatorAuditLog"
import OperatorProfile from "./operator/OperatorProfile"

const buttonPrimary =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#118451] hover:-translate-y-0.5 disabled:opacity-50"
const buttonSecondary =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-foreground/15 bg-white/60 px-6 py-3 text-sm font-bold transition hover:bg-secondary"
const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3.5 text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"

function useModal(active: boolean, onClose: () => void) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!active) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeRef.current()
      if (event.key !== "Tab") return
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[role="dialog"] button:not(:disabled), [role="dialog"] input:not(:disabled), [role="dialog"] select:not(:disabled)',
        ),
      )
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKey)
      previousFocus?.focus()
    }
  }, [active])
}

function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="KonsulYuk! — Beranda"
      className={`block shrink-0 ${footer ? "rounded-xl bg-white" : ""}`}
    >
      <img
        src={logo}
        alt="Logo resmi KonsulYuk!"
        className="h-[84px] w-[112px] object-contain"
      />
    </Link>
  )
}
function Avatar({
  name,
  size = "md",
  teacher = false,
}: {
  name: string
  size?: "sm" | "md" | "lg"
  teacher?: boolean
}) {
  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${
        teacher ? "bg-[#e7ece0] text-[#547052]" : "bg-[#ffecd0] text-[#9d6826]"
      } ${
        size === "sm"
          ? "size-9 text-xs"
          : size === "lg"
            ? "size-14 text-lg"
            : "size-11 text-sm"
      }`}
    >
      {name
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0])
        .join("")}
    </span>
  )
}
function Status({ children }: { children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold ${
        children === "Menunggu"
          ? "bg-accent/15 text-[#8a610e]"
          : children === "Selesai"
            ? "bg-muted text-muted-foreground"
            : "bg-secondary text-[#12804f]"
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-xs font-bold tracking-[0.15em] text-[#12804f]">
        {eyebrow}
      </p>
      <h2 className="text-[28px] font-extrabold leading-snug md:text-[36px]">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-[15px]">
        {description}
      </p>
    </div>
  )
}

function ConsultationArt() {
  return (
    <svg
      viewBox="0 0 580 470"
      role="img"
      aria-label="Ilustrasi siswa bercerita dengan nyaman kepada guru BK"
      className="h-auto w-full overflow-visible"
    >
      <defs>
        <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#c6dfcc" />
        </pattern>
      </defs>
      <path
        d="M67 392V205C67 99 143 39 262 42c120 4 223 72 225 185v165Z"
        fill="#dff1e4"
      />
      <path
        d="M347 57c81 26 139 87 140 170v165h-96c47-117 32-242-44-335Z"
        fill="#d3eadb"
      />
      <circle cx="503" cy="107" r="58" fill="url(#dots)" />
      <circle cx="80" cy="348" r="56" fill="url(#dots)" />
      <path
        d="M123 105l8-17m-25 9 12 7m18 13 17-4"
        fill="none"
        stroke="#ffb52e"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M501 226l9-10m-6 25 16 1"
        fill="none"
        stroke="#16a765"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <ellipse
        cx="282"
        cy="403"
        rx="240"
        ry="17"
        fill="#c8ded0"
        opacity=".55"
      />
      <path
        d="M85 397v-107m37 107V294"
        stroke="#ac6b3e"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M60 275c-5-29 2-52 20-56 26-7 34 15 35 35l10 49H84Z"
        fill="#e8a35d"
      />
      <path
        d="M67 283h108c12 0 14 9 14 17v13H87c-13 0-20-7-20-18Z"
        fill="#edb674"
      />
      <path
        d="M191 302c16 14 23 28 22 49l-4 41h-25l-9-58-55-23Z"
        fill="#345c61"
      />
      <path d="M130 300l31 36 10 55h-25l-16-47-33-30Z" fill="#477277" />
      <path d="M143 391h29l11 9c2 3 0 7-4 7h-39Z" fill="#133f47" />
      <path d="M182 390h27l17 11c3 3 0 6-4 6h-40Z" fill="#133f47" />
      <path
        d="M101 217c13-16 43-24 64-11 22 13 21 45 19 58l-3 40-79-3-8-43Z"
        fill="#fffdf7"
      />
      <path
        d="M98 250l-6 44c18 7 42 10 62 8l25-17-24-9-18 11-9-41Z"
        fill="#f6cead"
      />
      <path d="M137 206l10 24 18-23-9-19Z" fill="#efb58d" />
      <path
        d="M120 143c14-21 44-26 60-11 15 12 17 32 12 51-5 22-19 31-34 27-22-5-42-39-38-67Z"
        fill="#f6cead"
      />
      <path
        d="M116 174c-8-12-15-43 4-59 16-15 49-14 67-1 10 7 12 20 9 29-18-1-29-7-36-19-1 19-10 30-22 40l-8-14-8 13Z"
        fill="#173f43"
      />
      <path d="M117 155c-9-8-13 7-6 17l10 4" fill="#f6cead" />
      <circle cx="178" cy="161" r="2.5" fill="#173f43" />
      <path
        d="M177 185c4 2 9 1 12-2"
        fill="none"
        stroke="#b97459"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M149 224l16 20 10-30m-11 30-8 44"
        stroke="#d7e3df"
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M160 236l-6 34 10 11 9-9-7-35" fill="#689093" />
      <path
        d="M389 392V283m57 109V283"
        stroke="#547869"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M439 206c23 0 37 12 34 40l-11 62h-72l10-76c2-15 13-26 39-26Z"
        fill="#67917a"
      />
      <path d="M365 302h88v15h-86Z" fill="#709e83" />
      <path d="M415 301l-31 33-9 56h-25l-1-64 28-32Z" fill="#f0dfc3" />
      <path d="M409 306l-4 30-12 55h-25l5-67Z" fill="#dfcbae" />
      <path d="M347 389h29l-3 13h-42c-6-5 9-11 16-13Z" fill="#384e47" />
      <path d="M366 389h29l-2 14h-41c-4-5 8-12 14-14Z" fill="#384e47" />
      <path
        d="M355 201c18-18 52-19 72-3l11 44-4 63-65-1-19-54Z"
        fill="#c2b492"
      />
      <path d="M384 196l9 30 22-31" fill="#fffdf7" />
      <path
        d="M388 222l7 47 16-46"
        fill="none"
        stroke="#2c6964"
        strokeWidth="3"
      />
      <rect x="394" y="265" width="15" height="20" rx="3" fill="#fffdf7" />
      <path d="M368 218l-28 29-23-8-14 12 40 17 37-28Z" fill="#c2b492" />
      <path
        d="M319 241l-18-12-15-1c-9-1-9 5-2 7l13 4-19-3c-9-1-11 5-3 8l29 12 15-4Z"
        fill="#f2c5a0"
      />
      <path d="M425 243l-18 40-47-1-5-16 38-4 12-34Z" fill="#c2b492" />
      <path
        d="M360 266l-20-5-17 3c-6 3-4 8 2 7l14-1-10 6c-4 5 0 8 6 5l26 1Z"
        fill="#f2c5a0"
      />
      <path
        d="M364 184c-20-10-28-28-20-51 5-25 28-39 51-30 28-1 43 23 42 49l-2 46-23 2Z"
        fill="#473e36"
      />
      <path
        d="M361 143c6-4 15-19 17-27 15 17 29 24 44 27l-2 27c-2 20-18 34-34 29-18-7-25-26-25-56Z"
        fill="#f2c5a0"
      />
      <path d="M388 195l-2 13 13 16 16-24-7-12Z" fill="#f2c5a0" />
      <circle
        cx="377"
        cy="154"
        r="11"
        stroke="#473e36"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="405"
        cy="155"
        r="11"
        stroke="#473e36"
        strokeWidth="3"
        fill="none"
      />
      <path d="M388 153h6m22 0 9-4" stroke="#473e36" strokeWidth="3" />
      <circle cx="379" cy="155" r="2" fill="#473e36" />
      <circle cx="404" cy="156" r="2" fill="#473e36" />
      <path
        d="M384 179q9 8 18-1"
        stroke="#b57654"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M209 282h130l-8 11H203Z" fill="#e3b17e" />
      <rect x="198" y="278" width="145" height="12" rx="6" fill="#f0c696" />
      <path
        d="M223 291l-10 105m105-105 11 105"
        stroke="#b78559"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M246 274l17-21h38l-15 21Z" fill="#fffdf7" />
      <path d="M268 260h21m-27 6h20" stroke="#bdceca" strokeWidth="2" />
      <path d="M247 274v-23h-16v23" fill="#7fa596" />
      <path
        d="M246 254h6c8 0 8 11 0 11h-6"
        fill="none"
        stroke="#7fa596"
        strokeWidth="3"
      />
      <path
        d="M493 378c-3-43-4-88 4-123m-2 40c-33-9-35-35-33-46 22 9 32 24 33 46m0 26c27-14 39-33 31-50-25 16-31 31-31 50m-1 26c-24-6-37-23-38-42 26 6 37 23 38 42"
        fill="#719b78"
        stroke="#719b78"
        strokeWidth="3"
      />
      <path d="M473 362h45l-6 37h-33Z" fill="#e6b377" />
      <path
        d="M204 97c0-12 10-22 23-22h63c13 0 23 10 23 22v23c0 12-10 22-23 22h-31l-18 14 1-14h-15c-13 0-23-10-23-22Z"
        fill="#fffdf7"
      />
      <circle cx="239" cy="109" r="4" fill="#16a765" />
      <circle cx="258" cy="109" r="4" fill="#16a765" />
      <circle cx="277" cy="109" r="4" fill="#16a765" />
      <path
        d="M308 167c0-7 6-13 13-13h20c7 0 13 6 13 13v10c0 7-6 13-13 13h-7l-9 8 1-8h-5c-7 0-13-6-13-13Z"
        fill="#16a765"
      />
      <path
        d="M323 166c-7-7-13 5 8 15 21-10 15-22 8-15-5 4-5 4-8 0"
        fill="#fff"
        transform="translate(-2 -2) scale(1)"
      />
    </svg>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const user = useCurrentUser()
  const dashboardLink = user?.role === "GURU" ? "/guru" : "/siswa"

  return (
    <header className="relative z-30 border-b border-foreground/5 bg-background">
      <div className="mx-auto flex h-[96px] max-w-[1216px] items-center justify-between px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-9 text-[13px] font-semibold md:flex">
          <a
            href="#beranda"
            className="relative py-3 text-[#12804f] after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
          >
            Beranda
          </a>
          <a href="#tentang" className="transition hover:text-primary">
            Tentang Kami
          </a>
          <a href="#layanan" className="transition hover:text-primary">
            Layanan
          </a>
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar name={user.name} teacher={user.role === "GURU"} size="sm" />
                <span className="text-xs font-bold text-foreground">{user.name}</span>
              </div>
              <Link
                to={dashboardLink}
                className={`${buttonPrimary} min-h-10 px-5 py-2.5 text-xs`}
              >
                {user.role === "GURU" ? "Ruang Guru BK" : "Ruang Siswa"} <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/masuk"
                className="text-[13px] font-bold hover:text-primary"
              >
                Masuk
              </Link>
              <Link
                to="/daftar"
                className={`${buttonPrimary} min-h-10 px-5 py-2.5 text-xs`}
              >
                Daftar Sekarang <ArrowUpRight size={15} />
              </Link>
            </>
          )}
        </div>
        <button
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen(!open)}
          className="rounded-xl p-3 md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="absolute inset-x-0 top-full grid gap-2 border-b border-border bg-background p-6 shadow-lg md:hidden">
          {[
            ["Beranda", "#beranda"],
            ["Tentang Kami", "#tentang"],
            ["Layanan", "#layanan"],
          ].map(([text, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="rounded-lg p-3 hover:bg-secondary"
            >
              {text}
            </a>
          ))}
          {user ? (
            <Link to={dashboardLink} className={buttonPrimary}>
              Buka {user.role === "GURU" ? "Ruang Guru BK" : "Ruang Siswa"} →
            </Link>
          ) : (
            <>
              <Link to="/masuk" className={buttonSecondary}>
                Masuk
              </Link>
              <Link to="/daftar" className={buttonPrimary}>
                Daftar Sekarang
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

function Landing() {
  const user = useCurrentUser()
  const dashboardLink = user?.role === "GURU" ? "/guru" : "/siswa"

  return (
    <>
      <Navbar />
      <main>
        <section
          id="beranda"
          className="mx-auto grid max-w-[1216px] items-center gap-9 px-6 pb-14 pt-14 md:grid-cols-[1.05fr_1fr] md:gap-3 md:pb-16 md:pt-16 lg:px-8"
        >
          <div className="relative z-10">
            {user && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-secondary/80 px-4 py-2 text-xs font-semibold text-[#12804f]">
                <Sparkles size={14} className="text-primary" />
                <span>Selamat datang kembali, <strong>{user.name}</strong>! Anda sudah masuk.</span>
                <Link to={dashboardLink} className="underline hover:text-[#118451] ml-1">
                  Buka Dashboard →
                </Link>
              </div>
            )}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-secondary px-3.5 py-2 text-[11px] font-semibold text-[#12804f]">
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                <Heart size={12} />
              </span>{" "}
              Ruang aman untuk setiap cerita
            </div>
            <h1 className="text-[44px] font-extrabold leading-[1.2] tracking-[-0.025em] sm:text-[54px] lg:text-[62px]">
              Ada masalah?
              <br />
              <span className="relative inline-block text-primary">
                Yuk, cerita!
                <svg
                  className="absolute -bottom-4 left-0 w-full"
                  height="17"
                  viewBox="0 0 360 17"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12C105 0 249 1 350 9"
                    stroke="#ffb52e"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-9 max-w-[440px] text-[14px] leading-[1.9] text-muted-foreground lg:text-[15px]">
              Nggak semua hal harus kamu hadapi sendiri. Ceritakan masalah
              pribadi, pelajaran, atau pertemananmu kepada guru BK yang siap
              mendengarkan.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={user ? dashboardLink : "/daftar"} className={buttonPrimary}>
                {user ? "Lanjutkan ke Ruang Konsultasi" : "Mulai Konsultasi"} <ArrowRight size={17} />
              </Link>
              <a
                href="#cara-kerja"
                className={`${buttonSecondary} border-transparent bg-transparent px-3`}
              >
                <span className="flex size-7 items-center justify-center rounded-full border border-foreground/20">
                  <ChevronRight size={15} />
                </span>
                Lihat Cara Kerjanya
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3.5">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {["AP", "NR", "DA", "FK"].map((initial, index) => (
                  <span
                    key={initial}
                    className={`flex size-9 items-center justify-center rounded-full border-[3px] border-background text-[9px] font-bold ${
                      index % 2 === 0
                        ? "bg-[#edd4ba] text-[#81593d]"
                        : "bg-[#d2e6dc] text-[#476e60]"
                    }`}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-accent">
                  {"★★★★★".split("").map((star, index) => (
                    <span key={index} className="text-xs">
                      {star}
                    </span>
                  ))}
                  <span className="ml-1 text-[10px] font-bold text-foreground">
                    Teman ceritamu
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Langkah kecil untuk perasaan yang lebih baik.
                </p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px] pt-3 md:pt-0">
            <ConsultationArt />
            <div className="absolute -top-2 right-0 flex items-center gap-3 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_8px_30px_#123e4609] md:top-13 lg:right-0 lg:top-12">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <ShieldCheck size={20} />
              </span>
              <div>
                <p className="text-[11px] font-bold">Ceritamu, rahasiamu.</p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  Aman bersama guru BK
                </p>
              </div>
            </div>
            <div className="absolute bottom-5 left-0 flex items-center gap-3 rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_8px_30px_#123e4609] sm:bottom-8 sm:left-4">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-[#bc841e]">
                <Smile size={20} />
              </span>
              <div>
                <p className="text-[11px] font-bold">Kamu nggak sendiri.</p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  Kami siap mendengarkanmu
                </p>
              </div>
              <Heart size={14} className="ml-3 text-primary" />
            </div>
          </div>
        </section>
        <div className="border-y border-primary/8 bg-secondary/70">
          <div className="mx-auto grid max-w-[1100px] gap-5 px-6 py-5 sm:grid-cols-3">
            {[
              [
                ShieldCheck,
                "Privasi terjaga",
                "Ceritamu ditangani dengan bijak",
              ],
              [UsersRound, "Guru BK yang peduli", "Didampingi, bukan dihakimi"],
              [MessageCircle, "Nyaman & mudah", "Cerita dari mana saja"],
            ].map(([Icon, title, desc]) => {
              const ItemIcon = Icon as typeof Heart
              return (
                <div
                  key={String(title)}
                  className="flex items-center justify-center gap-3.5 sm:border-r sm:border-primary/10 sm:last:border-0"
                >
                  <ItemIcon
                    size={23}
                    strokeWidth={1.6}
                    className="text-[#12804f]"
                  />
                  <div>
                    <p className="text-xs font-bold">{String(title)}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {String(desc)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <section
          id="cara-kerja"
          className="mx-auto max-w-[1216px] px-6 py-17 lg:px-8"
        >
          <SectionTitle
            eyebrow="LANGKAH KECIL, DAMPAK BESAR"
            title="Bagaimana Cara Kerjanya?"
            description="Mulai cerita nggak harus rumit. Tiga langkah sederhana untuk menemukan dukungan yang kamu butuhkan."
          />
          <div className="relative mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: UserRound,
                title: "Buat akunmu",
                text: "Daftar dengan email sekolahmu. Lengkapi profil agar guru BK bisa mengenalmu lebih baik.",
                color: "bg-secondary text-[#12804f]",
              },
              {
                icon: CalendarDays,
                title: "Pilih waktu yang nyaman",
                text: "Temukan guru BK dan jadwalkan konsultasi sesuai waktu yang paling nyaman buatmu.",
                color: "bg-[#fff3d8] text-[#a77820]",
              },
              {
                icon: MessagesSquare,
                title: "Mulai bercerita",
                text: "Sampaikan ceritamu lewat percakapan pribadi. Guru BK siap mendengar dan menemanimu.",
                color: "bg-[#eaf0f5] text-[#497385]",
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="group relative rounded-[20px] border border-foreground/8 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-12 items-center justify-center rounded-2xl ${step.color}`}
                  >
                    <step.icon size={23} strokeWidth={1.6} />
                  </span>
                  <span className="text-[32px] font-extrabold text-foreground/9">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-bold">{step.title}</h3>
                <p className="mt-3 text-xs leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section id="tentang" className="bg-secondary/55">
          <div className="mx-auto grid max-w-[1216px] items-center gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1fr] lg:gap-24 lg:px-8">
            <div className="relative rounded-[28px] bg-[#d6eddf] p-9 sm:p-12">
              <span className="text-[64px] leading-none text-primary/35">
                “
              </span>
              <p className="text-2xl font-bold leading-relaxed">
                Nggak apa-apa untuk
                <br />
                nggak selalu baik-baik saja.
              </p>
              <p className="mt-5 text-sm leading-7 text-[#517168]">
                Setiap perasaanmu itu berarti. Kamu layak didengar, dipahami,
                dan mendapatkan dukungan.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-white/70">
                  <Heart size={20} className="text-primary" />
                </span>
                <p className="text-xs font-bold">Dari kami, teman ceritamu.</p>
              </div>
              <Sparkles
                className="absolute right-8 top-9 text-[#bc841e]"
                size={29}
                strokeWidth={1.4}
              />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.13em] text-[#12804f]">
                KAMI ADA UNTUKMU
              </p>
              <h2 className="mt-4 text-3xl font-extrabold leading-snug">
                Mengapa Memilih
                <br />
                KonsulYuk?
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Bukan sekadar tempat konsultasi. Ini adalah ruang untuk menjadi
                diri sendiri, tanpa takut dihakimi.
              </p>
              <div className="mt-7 space-y-5">
                {[
                  [
                    ShieldCheck,
                    "Ruang yang aman dan pribadi",
                    "Privasi dihormati. Guru BK menjelaskan batas kerahasiaan sebelum konsultasi.",
                  ],
                  [
                    Heart,
                    "Didengar dengan sepenuh hati",
                    "Guru BK membantumu memahami perasaan dan menemukan jalan keluar.",
                  ],
                  [
                    Clock3,
                    "Sesuai waktu dan kenyamananmu",
                    "Pilih jadwalmu dan mulai cerita dengan caramu sendiri.",
                  ],
                ].map(([Icon, title, desc]) => {
                  const ItemIcon = Icon as typeof Heart
                  return (
                    <div key={String(title)} className="flex gap-4">
                      <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white">
                        <ItemIcon size={18} className="text-primary" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold">{String(title)}</h3>
                        <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                          {String(desc)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
        <section
          id="layanan"
          className="mx-auto max-w-[1216px] px-6 py-17 lg:px-8"
        >
          <SectionTitle
            eyebrow="APA PUN CERITAMU"
            title="Ada ruang untuk setiap perasaan."
            description="Dari hal kecil yang mengganggu pikiran, sampai hal besar yang sulit kamu ungkapkan."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [
                BookOpen,
                "Tentang pelajaran",
                "Sulit fokus, bingung menentukan tujuan, atau merasa tertekan dengan tugas sekolah?",
              ],
              [
                Heart,
                "Tentang dirimu",
                "Kenali perasaanmu, bangun kepercayaan diri, dan temukan cara merawat diri.",
              ],
              [
                UsersRound,
                "Tentang pertemanan",
                "Cerita tentang teman, keluarga, atau hubungan yang sedang membuatmu kepikiran.",
              ],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Heart
              return (
                <Link
                  to="/daftar"
                  key={String(title)}
                  className="group rounded-2xl border border-border bg-white p-7 hover:border-primary/40"
                >
                  <ItemIcon
                    size={25}
                    strokeWidth={1.5}
                    className="text-primary"
                  />
                  <h3 className="mt-5 text-base font-bold">{String(title)}</h3>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">
                    {String(text)}
                  </p>
                  <span className="mt-5 flex items-center gap-2 text-xs font-bold text-[#12804f]">
                    Yuk, bicarakan{" "}
                    <ArrowRight
                      size={14}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
        <section className="mx-auto mb-16 max-w-[1152px] px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-foreground px-6 py-12 text-center sm:px-14">
            <span className="absolute -left-10 -top-16 size-52 rounded-full border-[35px] border-white/5" />
            <span className="absolute -bottom-20 -right-10 size-60 rounded-full border-[40px] border-white/5" />
            <span className="relative inline-flex items-center gap-2 text-xs font-semibold text-[#b3e0c6]">
              <Heart size={15} /> Mulai dari satu cerita
            </span>
            <h2 className="relative mt-4 text-[28px] font-bold text-white md:text-[34px]">
              Kamu berharga. Ceritamu juga.
            </h2>
            <p className="relative mt-4 text-sm leading-7 text-white/65">
              Ambil langkah pertamamu hari ini. Kami di sini untuk mendengarkan.
            </p>
            <Link to="/daftar" className={`${buttonPrimary} relative mt-7`}>
              Mulai Konsultasi <ArrowRight size={17} />
            </Link>
            <p className="relative mt-4 text-[10px] text-white/50">
              Tanpa biaya. Tanpa takut dihakimi.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
function Footer() {
  return (
    <footer className="border-t border-border bg-white/60">
      <div className="mx-auto grid max-w-[1152px] gap-8 px-6 py-9 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-2 max-w-64 text-xs leading-6 text-muted-foreground">
            Ruang aman untuk bercerita, bertumbuh, dan menjadi versi terbaik
            dirimu.
          </p>
        </div>
        <div className="pt-5">
          <h3 className="text-xs font-bold">Jelajahi</h3>
          <div className="mt-5 grid gap-3 text-xs text-muted-foreground">
            <Link to="/">Beranda</Link>
            <a href="/#tentang">Tentang Kami</a>
            <a href="/#layanan">Layanan</a>
          </div>
        </div>
        <div className="pt-5">
          <h3 className="text-xs font-bold">Ruang Konsultasi</h3>
          <div className="mt-5 grid gap-3 text-xs text-muted-foreground">
            <Link to="/siswa">Halaman Siswa</Link>
            <Link to="/guru">Halaman Guru BK</Link>
            <Link to="/sistem-desain">Sistem Desain</Link>
          </div>
        </div>
        <div className="pt-5">
          <h3 className="text-xs font-bold">Hubungi Kami</h3>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Mail size={15} /> halo@konsulyuk.id
          </p>
          <p className="mt-4 text-[11px] leading-6 text-muted-foreground">
            Butuh bantuan mendesak? Hubungi guru BK atau orang dewasa yang kamu
            percaya.
          </p>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1104px] flex-wrap items-center justify-between gap-2 border-t border-border px-6 py-5 text-[10px] text-muted-foreground">
        <span>© 2026 KonsulYuk! Dibuat dengan kepedulian.</span>
        <span className="flex items-center gap-1.5">
          Untuk cerita yang lebih baik{" "}
          <Heart size={11} className="text-primary" />
        </span>
      </div>
    </footer>
  )
}

function Auth({
  register = false,
  reset = false,
}: {
  register?: boolean
  reset?: boolean
}) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => isRemembered())

  // Jika pengguna sudah login dan "Ingat Saya" aktif, langsung otomatis masuk ke dashboard
  useEffect(() => {
    if (reset) return
    const user = getStoredUser()
    const token = getToken()
    const remembered = isRemembered()
    if (user && token && remembered) {
      const userRole = user.role?.toLowerCase() || "siswa"
      if (userRole === "siswa" && (!user.kelas || !user.phone)) {
        navigate("/lengkapi-profil", { replace: true })
      } else {
        navigate(userRole === "guru" ? "/guru" : "/siswa", { replace: true })
      }
    }
  }, [navigate, reset])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const data = new FormData(event.currentTarget)
    const email = String(data.get("email") || "").trim()
    const password = String(data.get("password") || "")

    if (register && password !== data.get("confirm")) {
      setError("Konfirmasi kata sandi belum cocok. Coba periksa kembali, ya.")
      return
    }
    if (reset) {
      setSuccess(true)
      return
    }

    setLoading(true)
    try {
      setRemembered(rememberMe)

      if (register) {
        const name = String(data.get("name") || "").trim()
        await api.auth.register({ name, email, password, role: "SISWA" })
        // Setelah registrasi, alihkan ke halaman isi identitas lainnya
        navigate("/lengkapi-profil", { replace: true })
      } else {
        const res = await api.auth.login({ email, password })
        const userRole = res.user?.role?.toUpperCase() || "SISWA"
        if (userRole === "ADMIN") {
          navigate("/operator", { replace: true })
        } else if (userRole === "GURU") {
          navigate("/guru", { replace: true })
        } else if (!res.user?.kelas || !res.user?.phone) {
          navigate("/lengkapi-profil", { replace: true })
        } else {
          navigate("/siswa", { replace: true })
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (
        msg.includes("Failed to fetch") ||
        msg.includes("NetworkError") ||
        msg.includes("Load failed")
      ) {
        // Fallback otomatis jika backend sedang offline
        const isOperator =
          email.includes("operator") || email.includes("admin")
        const isGuru =
          email.includes("guru") ||
          email.includes("ratna") ||
          email.includes("dimas")
        if (isOperator) {
          navigate("/operator", { replace: true })
        } else if (isGuru) {
          navigate("/guru", { replace: true })
        } else {
          navigate("/siswa", { replace: true })
        }
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-secondary px-14 py-8 lg:flex">
        <Logo />
        <div className="mx-auto max-w-md">
          <ConsultationArt />
          <h2 className="mt-4 text-center text-3xl font-extrabold leading-snug">
            Setiap cerita layak
            <br />
            untuk didengarkan.
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-center text-sm leading-7 text-muted-foreground">
            Kamu nggak harus punya semua jawabannya. Kita temukan jalan
            keluarnya, bersama.
          </p>
        </div>
        <p className="flex items-center justify-center gap-2 text-xs text-[#517168]">
          <ShieldCheck size={16} /> Ruang aman. Tanpa menghakimi.
        </p>
      </aside>
      <main className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-7 flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
            >
              <ChevronLeft size={16} /> Kembali ke Beranda
            </Link>
            <div className="lg:hidden">
              <Logo />
            </div>
          </div>
          <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
            {reset ? <LockKeyhole size={23} /> : <Heart size={23} />}
          </span>
          <h1 className="text-[29px] font-extrabold">
            {reset
              ? "Lupa Kata Sandi?"
              : register
                ? "Buat Akun Baru"
                : "Selamat Datang Kembali!"}
          </h1>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
            {reset
              ? "Masukkan email untuk contoh alur pemulihan akun."
              : register
                ? "Mulai langkah kecilmu. Kami siap mendengarkan."
                : "Masuk untuk melanjutkan konsultasimu."}
          </p>
          {success ? (
            <div className="rounded-2xl bg-secondary p-6">
              <CircleCheck className="mb-3 text-primary" />
              <h2 className="font-bold">Pratinjau permintaan berhasil</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Dalam aplikasi yang sudah dikembangkan, tautan pemulihan akan
                dikirim ke emailmu. Pratinjau ini tidak mengirim email.
              </p>
              <Link to="/masuk" className={`${buttonPrimary} mt-5`}>
                Kembali ke Masuk
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              {register && (
                <label className="block text-xs font-semibold">
                  Nama lengkap
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Masukkan nama lengkapmu"
                    className={`${inputClass} mt-2`}
                  />
                </label>
              )}
              <label className="block text-xs font-semibold">
                Alamat email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="nama@sekolah.sch.id"
                  className={`${inputClass} mt-2`}
                />
              </label>
              {!reset && (
                <>
                  <label className="block text-xs font-semibold">
                    Kata sandi
                    <div className="relative mt-2">
                      <input
                        name="password"
                        type={visible ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete={
                          register ? "new-password" : "current-password"
                        }
                        placeholder="Minimal 8 karakter"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        aria-label={
                          visible
                            ? "Sembunyikan kata sandi"
                            : "Tampilkan kata sandi"
                        }
                        className="absolute right-3 top-3.5 p-1 text-muted-foreground"
                      >
                        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </label>
                  {register && (
                    <label className="block text-xs font-semibold">
                      Konfirmasi kata sandi
                      <input
                        name="confirm"
                        type={visible ? "text" : "password"}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Tulis kembali kata sandimu"
                        className={`${inputClass} mt-2`}
                      />
                    </label>
                  )}
                  {!register && (
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="size-4 accent-primary"
                        />{" "}
                        Ingat saya
                      </label>
                      <Link
                        to="/lupa-kata-sandi"
                        className="font-semibold text-[#12804f]"
                      >
                        Lupa Kata Sandi?
                      </Link>
                    </div>
                  )}
                  {register && (
                    <label className="flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 size-4 shrink-0 accent-primary"
                      />
                      Saya menyetujui ketentuan layanan dan kebijakan privasi
                      KonsulYuk!.
                    </label>
                  )}
                </>
              )}
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {error}
                </p>
              )}
              <button disabled={loading} className={`${buttonPrimary} w-full`}>
                {loading
                  ? "Memproses..."
                  : reset
                    ? "Pratinjau Pemulihan"
                    : register
                      ? "Daftar Sekarang"
                      : "Masuk"}
                <ArrowRight size={17} />
              </button>
              {!reset && (
                <p className="pt-2 text-center text-xs text-muted-foreground">
                  {register ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
                  <Link
                    to={register ? "/masuk" : "/daftar"}
                    className="ml-1 font-bold text-[#12804f]"
                  >
                    {register ? "Masuk" : "Daftar sekarang"}
                  </Link>
                </p>
              )}
              {!reset && !register && (
                <div className="mt-4 rounded-2xl bg-[#E8F7EF]/70 p-3.5 border border-[#16A765]/25 text-xs">
                  <p className="font-bold text-[#123E46] mb-2 flex items-center gap-1.5 text-[11px]">
                    <ShieldCheck size={14} className="text-[#16A765]" />
                    Pilihan Akun Demo (Klik untuk Isi Otomatis):
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
                        const passInput = document.querySelector('input[name="password"]') as HTMLInputElement
                        if (emailInput) emailInput.value = "operator@konsulyuk.id"
                        if (passInput) passInput.value = "password123"
                      }}
                      className="rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-[#16A765] border border-[#16A765]/30 hover:bg-[#16A765] hover:text-white transition truncate text-center shadow-2xs"
                    >
                      👑 Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
                        const passInput = document.querySelector('input[name="password"]') as HTMLInputElement
                        if (emailInput) emailInput.value = "ratna@konsulyuk.id"
                        if (passInput) passInput.value = "password123"
                      }}
                      className="rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-[#0284C7] border border-[#0284C7]/30 hover:bg-[#0284C7] hover:text-white transition truncate text-center shadow-2xs"
                    >
                      👩‍🏫 Guru BK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement
                        const passInput = document.querySelector('input[name="password"]') as HTMLInputElement
                        if (emailInput) emailInput.value = "aditya@konsulyuk.id"
                        if (passInput) passInput.value = "password123"
                      }}
                      className="rounded-lg bg-white px-2 py-1.5 text-[10px] font-bold text-[#334155] border border-slate-300 hover:bg-slate-700 hover:text-white transition truncate text-center shadow-2xs"
                    >
                      🎓 Siswa
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
          <p className="mt-8 border-t border-border pt-5 text-center text-[10px] leading-5 text-muted-foreground">
            Pratinjau desain • Tanpa akun nyata atau penyimpanan data.
            <br />
            Jangan gunakan kata sandi atau cerita pribadi yang sebenarnya.
          </p>
        </div>
      </main>
    </div>
  )
}

function CompleteProfile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState(user?.name || "")
  const [kelas, setKelas] = useState(user?.kelas || "")
  const [customKelas, setCustomKelas] = useState("")
  const [phone, setPhone] = useState(user?.phone || "")
  const [bio, setBio] = useState(user?.bio || "")

  const classOptions = [
    "X-1", "X-2", "X-3", "X-4", "X-5", "X-6",
    "XI MIPA 1", "XI MIPA 2", "XI IPS 1", "XI IPS 2",
    "XII MIPA 1", "XII MIPA 2", "XII IPS 1", "XII IPS 2",
  ]

  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate("/masuk", { replace: true })
      return
    }

    api.auth
      .me()
      .then((fresh) => {
        if (fresh) {
          setUser(fresh)
          if (fresh.name) setName(fresh.name)
          if (fresh.kelas) {
            if (classOptions.includes(fresh.kelas)) {
              setKelas(fresh.kelas)
            } else {
              setKelas("LAINNYA")
              setCustomKelas(fresh.kelas)
            }
          }
          if (fresh.phone) setPhone(fresh.phone)
          if (fresh.bio) setBio(fresh.bio)

          // Jika guru, langsung ke ruang guru
          if (fresh.role === "GURU") {
            navigate("/guru", { replace: true })
          }
        }
      })
      .catch(() => {})
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const finalKelas = kelas === "LAINNYA" ? customKelas.trim() : kelas.trim()
    if (!finalKelas) {
      setError("Pilih atau masukkan kelasmu.")
      return
    }
    if (!phone.trim()) {
      setError("Nomor WhatsApp/HP wajib diisi untuk koordinasi guru BK.")
      return
    }

    setLoading(true)
    try {
      await api.users.updateProfile({
        name: name.trim() || undefined,
        kelas: finalKelas,
        phone: phone.trim(),
        bio: bio.trim() || undefined,
      })

      window.dispatchEvent(new Event("storage"))

      // Alihkan ke ruang konsultasi siswa (akun sekarang sudah aktif & siap digunakan)
      navigate("/siswa", { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || "Gagal menyimpan identitas. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#edf5f0] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="mx-auto w-full max-w-2xl flex items-center justify-between py-2">
        <Logo />
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 bg-white/80 border border-border px-3 py-1.5 rounded-full shadow-xs">
          <ShieldCheck size={14} className="text-[#12804f]" /> Privasi Terjamin
        </span>
      </header>

      {/* Main Card */}
      <main className="mx-auto w-full max-w-2xl my-6">
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-lg">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-3">
              <span className="flex items-center gap-1.5 text-[#12804f]">
                <CircleCheck size={15} /> 1. Buat Akun
              </span>
              <span className="flex items-center gap-1.5 text-[#12804f]">
                <span className="size-5 rounded-full bg-[#12804f] text-white flex items-center justify-center text-[10px]">
                  2
                </span>{" "}
                2. Lengkapi Identitas
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground/60">
                <span className="size-5 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-[10px]">
                  3
                </span>{" "}
                3. Siap Konsultasi
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div className="bg-[#12804f] h-full w-2/3 rounded-full transition-all duration-500" />
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Lengkapi Identitas Siswa
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Halo, <span className="font-bold text-foreground">{name || "Siswa"}</span>! Satu langkah lagi sebelum akunmu siap digunakan. Guru BK memerlukan data ini untuk mendampingimu secara nyaman dan terarah.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-destructive/10 p-4 text-xs font-semibold text-destructive flex items-center gap-2">
              <Info size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {/* Nama Lengkap */}
              <label className="block text-xs font-semibold">
                Nama Lengkap
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama lengkap siswa"
                  className={`${inputClass} mt-2`}
                />
              </label>

              {/* Kelas */}
              <label className="block text-xs font-semibold">
                Kelas
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  required
                  className={`${inputClass} mt-2 cursor-pointer bg-white`}
                >
                  <option value="" disabled>Pilih Kelas</option>
                  <optgroup label="Tingkat X">
                    <option value="X-1">X-1</option>
                    <option value="X-2">X-2</option>
                    <option value="X-3">X-3</option>
                    <option value="X-4">X-4</option>
                    <option value="X-5">X-5</option>
                    <option value="X-6">X-6</option>
                  </optgroup>
                  <optgroup label="Tingkat XI">
                    <option value="XI MIPA 1">XI MIPA 1</option>
                    <option value="XI MIPA 2">XI MIPA 2</option>
                    <option value="XI IPS 1">XI IPS 1</option>
                    <option value="XI IPS 2">XI IPS 2</option>
                  </optgroup>
                  <optgroup label="Tingkat XII">
                    <option value="XII MIPA 1">XII MIPA 1</option>
                    <option value="XII MIPA 2">XII MIPA 2</option>
                    <option value="XII IPS 1">XII IPS 1</option>
                    <option value="XII IPS 2">XII IPS 2</option>
                  </optgroup>
                  <option value="LAINNYA">Lainnya / Tulis manual...</option>
                </select>
              </label>
            </div>

            {/* Custom Kelas if selected "LAINNYA" */}
            {kelas === "LAINNYA" && (
              <label className="block text-xs font-semibold animate-in fade-in-0 duration-200">
                Tuliskan Nama Kelasmu
                <input
                  type="text"
                  value={customKelas}
                  onChange={(e) => setCustomKelas(e.target.value)}
                  required
                  placeholder="Contoh: X RPL 1 / XII Bahasa"
                  className={`${inputClass} mt-2`}
                />
              </label>
            )}

            {/* Nomor WhatsApp */}
            <label className="block text-xs font-semibold">
              Nomor WhatsApp / HP Aktif
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Contoh: 081234567890"
                className={`${inputClass} mt-2`}
              />
            </label>

            {/* Custom Kelas if selected "LAINNYA" */}
            {kelas === "LAINNYA" && (
              <label className="block text-xs font-semibold animate-in fade-in-0 duration-200">
                Tuliskan Nama Kelasmu
                <input
                  type="text"
                  value={customKelas}
                  onChange={(e) => setCustomKelas(e.target.value)}
                  required
                  placeholder="Contoh: X RPL 1 / XII Bahasa"
                  className={`${inputClass} mt-2`}
                />
              </label>
            )}

            {/* Bio / Pengenalan Diri */}
            <label className="block text-xs font-semibold">
              Perkenalan Singkat atau Harapan Konsultasi (Opsional)
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Ceritakan sedikit tentang dirimu (misal minat belajar, hobi, atau hal yang ingin kamu ceritakan ke Guru BK)..."
                className={`${inputClass} mt-2 resize-none`}
              />
            </label>

            {/* Privacy note */}
            <div className="rounded-2xl border border-[#12804f]/20 bg-[#12804f]/5 p-4 text-[11px] leading-relaxed text-[#12804f] flex items-start gap-3">
              <ShieldCheck size={18} className="shrink-0 mt-0.5" />
              <span>
                <strong>Kerahasiaan Dijamin:</strong> Data identitasmu hanya digunakan untuk keperluan bimbingan konseling di lingkungan sekolah dan tidak akan dibagikan ke pihak luar.
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`${buttonPrimary} w-full text-sm font-bold shadow-md cursor-pointer`}
            >
              {loading ? (
                "Menyimpan Identitas..."
              ) : (
                <>
                  Simpan Identitas & Mulai Gunakan Akun <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-muted-foreground py-2">
        © 2026 KonsulYuk! • Layanan Bimbingan & Konseling Sekolah
      </footer>
    </div>
  )
}

const studentNav = [
  { label: "Beranda", path: "/siswa", icon: House },
  { label: "Konsultasi Saya", path: "/siswa/konsultasi", icon: MessageCircle },
  { label: "Riwayat Konsultasi", path: "/siswa/riwayat", icon: History },
  { label: "Pengaturan", path: "/siswa/pengaturan", icon: Settings },
]
const teacherNav = [
  { label: "Beranda", path: "/guru", icon: House },
  {
    label: "Permintaan Konsultasi",
    path: "/guru/permintaan",
    icon: MessagesSquare,
  },
  { label: "Jadwal", path: "/guru/jadwal", icon: CalendarDays },
  { label: "Data Siswa", path: "/guru/siswa", icon: UsersRound },
  { label: "Riwayat", path: "/guru/riwayat", icon: History },
  { label: "Pengaturan", path: "/guru/pengaturan", icon: Settings },
]
function useCurrentUser() {
  const [user, setUser] = useState<User | null>(() => getStoredUser())

  useEffect(() => {
    // Refresh user profile from backend
    api.auth
      .me()
      .then((fresh) => {
        if (fresh) setUser(fresh)
      })
      .catch(() => {})

    function handleStorage() {
      setUser(getStoredUser())
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return user
}

function NotificationDropdown({ teacher = false }: { teacher?: boolean }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const user = useCurrentUser()

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.list()
      if (data && data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications)
        setUnreadCount(
          data.unreadCount ?? data.notifications.filter((n) => !n.isRead).length
        )
      } else {
        setNotifications([
          {
            id: "fallback-1",
            userId: user?.id || "",
            title: "Selamat datang di KonsulYuk!",
            message: `Halo ${user?.name || (teacher ? "Guru BK" : "Siswa")}! Ruang konsultasi siap mendampingimu kapan pun dibutuhkan.`,
            type: "WELCOME",
            link: teacher ? "/guru/permintaan" : "/siswa/konsultasi",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "fallback-2",
            userId: user?.id || "",
            title: teacher
              ? "Permintaan Konsultasi Baru"
              : "Pilih Guru BK untuk Mulai Konsultasi",
            message: teacher
              ? "Periksa tab Permintaan Konsultasi untuk meninjau jadwal siswa."
              : "Kunjungi menu Konsultasi Saya untuk memilih guru BK dan mulai bercerita.",
            type: "INFO",
            link: teacher ? "/guru/permintaan" : "/siswa/konsultasi",
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "fallback-3",
            userId: user?.id || "",
            title: "Jangan lupa beri waktu untuk dirimu",
            message:
              "Istirahat sejenak dan lakukan hal kecil yang membuatmu merasa lebih tenang hari ini.",
            type: "MOTIVATION",
            link: null,
            isRead: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ])
        setUnreadCount(2)
      }
    } catch {
      setNotifications([
        {
          id: "fallback-1",
          userId: user?.id || "",
          title: "Selamat datang di KonsulYuk!",
          message: `Halo ${user?.name || (teacher ? "Guru BK" : "Siswa")}! Ruang konsultasi siap mendampingimu kapan pun dibutuhkan.`,
          type: "WELCOME",
          link: teacher ? "/guru/permintaan" : "/siswa/konsultasi",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "fallback-2",
          userId: user?.id || "",
          title: teacher
            ? "Permintaan Konsultasi Baru"
            : "Pilih Guru BK untuk Mulai Konsultasi",
          message: teacher
            ? "Periksa tab Permintaan Konsultasi untuk meninjau jadwal siswa."
            : "Kunjungi menu Konsultasi Saya untuk memilih guru BK dan mulai bercerita.",
          type: "INFO",
          link: teacher ? "/guru/permintaan" : "/siswa/konsultasi",
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ])
      setUnreadCount(2)
    }
  }

  useEffect(() => {
    loadNotifications()
    const timer = setInterval(loadNotifications, 30000)
    return () => clearInterval(timer)
  }, [user?.id])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead()
    } catch {
      // ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        if (!notif.id.startsWith("fallback-")) {
          await api.notifications.markRead(notif.id)
        }
      } catch {
        // ignore
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    setOpen(false)
    if (notif.link) {
      navigate(notif.link)
    } else {
      navigate(teacher ? "/guru/permintaan" : "/siswa/konsultasi")
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      if (diffMins < 1) return "Baru saja"
      if (diffMins < 60) return `${diffMins} mnt lalu`
      const diffHours = Math.floor(diffMins / 60)
      if (diffHours < 24) return `${diffHours} jam lalu`
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} hari lalu`
    } catch {
      return "Hari ini"
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        aria-label="Lihat notifikasi"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative flex size-10 items-center justify-center rounded-full border transition ${
          open
            ? "border-[#12804f] bg-[#eef7f2] text-[#12804f]"
            : "border-border text-foreground hover:border-[#12804f]/40 hover:bg-secondary/60"
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Daftar notifikasi"
          className="absolute right-0 top-full mt-2.5 w-[330px] sm:w-[380px] rounded-2xl border border-border bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {/* Header popup */}
          <div className="flex items-center justify-between border-b border-border bg-[#f6faf8] px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground">Notifikasi</h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-[#12804f]/15 px-2 py-0.5 text-[10px] font-bold text-[#12804f]">
                  {unreadCount} baru
                </span>
              ) : (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  Dibaca semua
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#12804f] hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-[380px] divide-y divide-border/60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Bell size={28} className="opacity-30 mb-2" />
                <p className="text-xs font-semibold">Belum ada notifikasi baru</p>
                <p className="text-[10px] mt-1 text-muted-foreground/80">
                  Semua aktivitas konsultasimu akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition ${
                    item.isRead
                      ? "bg-white hover:bg-[#f8fbf9]"
                      : "bg-[#edf8f2]/60 hover:bg-[#edf8f2]"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                      item.isRead
                        ? "bg-secondary text-muted-foreground"
                        : "bg-[#12804f]/10 text-[#12804f]"
                    }`}
                  >
                    {item.type === "CHAT" ? (
                      <MessageCircle size={17} />
                    ) : item.type === "SCHEDULE" ? (
                      <CalendarDays size={17} />
                    ) : item.type === "MOTIVATION" ? (
                      <Heart size={17} />
                    ) : (
                      <Sparkles size={17} />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${
                          item.isRead
                            ? "font-semibold text-foreground"
                            : "font-bold text-foreground"
                        }`}
                      >
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="size-2 shrink-0 rounded-full bg-[#12804f]" />
                      )}
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                      {formatTimeAgo(item.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer popup */}
          <div className="border-t border-border bg-[#fafcfb] p-2.5 text-center">
            <Link
              to={teacher ? "/guru/permintaan" : "/siswa/konsultasi"}
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#12804f] hover:underline inline-flex items-center gap-1.5"
            >
              Lihat Konsultasi Aktif <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Shell({ teacher = false }: { teacher?: boolean }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const nav = teacher ? teacherNav : studentNav

  const displayName =
    user?.name || (teacher ? "Ibu Ratna Sari, S.Pd." : "Siswa KonsulYuk")
  const displayRole = teacher
    ? "Guru Bimbingan Konseling"
    : user?.kelas
      ? `Kelas ${user.kelas}`
      : "Siswa"

  function handleLogout() {
    clearToken()
    navigate("/masuk")
  }

  useEffect(() => {
    // Siswa wajib melengkapi identitas sebelum akun bisa digunakan
    if (!teacher && user && user.role !== "GURU" && (!user.kelas || !user.phone)) {
      navigate("/lengkapi-profil", { replace: true })
    }
  }, [teacher, user, navigate])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])
  return (
    <div className="min-h-screen bg-background">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[246px] flex-col border-r border-border bg-white px-5 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[104px] items-center justify-between px-4">
          <Logo />
          <button
            className="p-2 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>
        <span className="mb-5 ml-4 mt-3 text-[10px] font-bold tracking-[0.13em] text-muted-foreground">
          RUANG {teacher ? "GURU BK" : "SISWA"}
        </span>
        <nav className="space-y-1.5">
          {nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-secondary text-[#12804f]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <item.icon size={19} strokeWidth={1.7} />
              {item.label}
              {item.label === "Permintaan Konsultasi" && (
                <span className="ml-auto rounded-full bg-accent/20 px-1.5 py-0.5 text-[9px] text-[#8a610e]">
                  3
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pb-6">
          <div className="mb-6 rounded-2xl bg-background p-4">
            <Heart size={20} className="text-primary" />
            <p className="mt-3 text-xs font-bold">
              {teacher
                ? "Kepedulian Anda berarti."
                : "Pelan-pelan juga nggak apa-apa."}
            </p>
            <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
              {teacher
                ? "Satu percakapan dapat membuat perubahan besar."
                : "Setiap langkah kecilmu adalah kemajuan."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            <LogOut size={17} /> Keluar
          </button>
          <div className="mt-5 flex items-center gap-3 border-t border-border px-2 pt-5">
            <Avatar
              name={displayName}
              teacher={teacher}
            />
            <div className="min-w-0 flex-1 truncate text-left">
              <p className="truncate text-xs font-bold" title={displayName}>
                {displayName}
              </p>
              <p className="mt-1 truncate text-[10px] text-muted-foreground">
                {displayRole}
              </p>
            </div>
          </div>
        </div>
      </aside>
      <div className="lg:ml-[246px]">
        <header className="flex h-[82px] items-center justify-between gap-4 border-b border-border bg-white px-5 lg:px-9">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Buka navigasi"
            >
              <Menu size={22} />
            </button>
            <p className="text-xs text-muted-foreground">
              Ruang {teacher ? "Guru BK" : "Siswa"}{" "}
              <span className="mx-2 text-border">/</span>{" "}
              <span className="font-semibold text-foreground">
                {nav.find((item) => item.path === location.pathname)?.label ||
                  "Konsultasi"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
              <CalendarDays size={15} /> Rabu, 30 September 2026
            </span>
            <NotificationDropdown teacher={teacher} />
            <Avatar
              name={displayName}
              size="sm"
              teacher={teacher}
            />
          </div>
        </header>
        <main className="mx-auto max-w-[1250px] p-5 md:p-8 lg:p-9">
          <Outlet />
        </main>
        <div className="mx-6 mb-6 flex flex-wrap justify-between gap-3 border-t border-border pt-5 text-[10px] text-muted-foreground">
          <span>© 2026 KonsulYuk! • Pratinjau desain</span>
          <div className="flex gap-5">
            <Link to="/">Halaman Beranda</Link>
            <Link to={teacher ? "/siswa" : "/guru"}>
              Lihat {teacher ? "Ruang Siswa" : "Ruang Guru BK"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScheduleModal({ onClose }: { onClose: () => void }) {
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [teachers, setTeachers] = useState<TeacherInfo[]>([])
  const [teacherId, setTeacherId] = useState("")
  const [date, setDate] = useState("2026-10-01")
  const [time, setTime] = useState("09.00 – 09.30")
  const [topic, setTopic] = useState("Akademik")
  const [notes, setNotes] = useState("")

  useModal(true, onClose)

  useEffect(() => {
    api.auth
      .getTeachers()
      .then((list) => {
        setTeachers(list)
        if (list.length > 0) setTeacherId(list[0].id)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    try {
      await api.consultations.create({
        teacherId: teacherId || undefined,
        topic,
        scheduledDate: date,
        scheduledTime: time,
        studentNotes: notes || undefined,
      })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/35 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          autoFocus
          aria-label="Tutup jendela"
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-muted"
        >
          <X size={18} />
        </button>
        <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
          {done ? <Check /> : <CalendarDays />}
        </span>
        <h2 id="schedule-title" className="text-xl font-bold">
          {done ? "Jadwalmu sudah diajukan!" : "Jadwalkan Konsultasi"}
        </h2>
        {done ? (
          <>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Permintaan konsultasimu telah tersimpan di sistem. Guru BK akan
              melihat permohonan ini di daftar permintaan dan mengonfirmasi
              jadwalmu.
            </p>
            <button
              className={`${buttonPrimary} mt-6 w-full`}
              onClick={onClose}
            >
              Baik, terima kasih
            </button>
          </>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-xs font-semibold">
              Guru BK
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className={`${inputClass} mt-2`}
              >
                {teachers.length > 0 ? (
                  teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="">Ibu Ratna Sari, S.Pd., Kons.</option>
                    <option value="">Bapak Dimas Saputra, M.Pd.</option>
                  </>
                )}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold">
                Tanggal
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min="2026-09-30"
                  required
                  className={`${inputClass} mt-2`}
                />
              </label>
              <label className="text-xs font-semibold">
                Waktu
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`${inputClass} mt-2`}
                >
                  <option>08.00 – 09.30</option>
                  <option>09.00 – 09.30</option>
                  <option>10.00 – 10.30</option>
                  <option>10.00 – 11.30</option>
                  <option>13.00 – 13.30</option>
                  <option>13.00 – 14.30</option>
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold">
              Topik konsultasi
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`${inputClass} mt-2`}
              >
                <option>Akademik & Nilai</option>
                <option>Pribadi & Emosi</option>
                <option>Sosial & Pertemanan</option>
                <option>Rencana Karir & Kuliah</option>
              </select>
            </label>
            <label className="block text-xs font-semibold">
              Catatan / Hal yang ingin diceritakan (opsional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ceritakan sedikit tentang apa yang sedang kamu hadapi..."
                rows={2}
                className={`${inputClass} mt-2 resize-none`}
              />
            </label>
            <p className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-[11px] leading-5 text-[#517168]">
              <ShieldCheck size={17} className="shrink-0" /> Kamu bisa bercerita
              lebih lanjut saat konsultasi dimulai.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className={`${buttonPrimary} w-full`}
            >
              {submitting ? "Mengajukan..." : "Ajukan Jadwal"} <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

function Dashboard({ teacher = false }: { teacher?: boolean }) {
  const [schedule, setSchedule] = useState(false)
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const user = useCurrentUser()
  const greetingName = user?.name
    ? user.name.split(" ")[0]
    : teacher
      ? "Ibu Ratna"
      : "Siswa"

  useEffect(() => {
    api.consultations
      .list()
      .then(setConsultations)
      .catch(() => [])
    api.users
      .getStats()
      .then(setStats)
      .catch(() => null)
  }, [])

  const studentTotal = stats?.myConsultations ?? consultations.length
  const studentActive =
    stats?.myActive ??
    consultations.filter(
      (c) => c.status === "DITERIMA" || c.status === "MENUNGGU",
    ).length
  const studentDone = consultations.filter(
    (c) => c.status === "SELESAI",
  ).length

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {teacher
              ? "Bersama, kita dampingi setiap siswa."
              : "Senang melihatmu kembali di sini."}
          </p>
          <h1 className="text-[26px] font-extrabold md:text-[30px]">
            {teacher ? `Selamat Datang, ${greetingName}!` : `Hai, ${greetingName}!`}{" "}
            <span className="text-xl">{teacher ? "☀️" : "👋"}</span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {teacher
              ? "Berikut ringkasan aktivitas konsultasi Anda hari ini."
              : "Bagaimana perasaanmu hari ini? Kami siap mendengarkan."}
          </p>
        </div>
        <button className={buttonSecondary} onClick={() => setSchedule(true)}>
          <CalendarDays size={16} /> Jadwalkan Konsultasi
        </button>
      </div>
      {!teacher && (
        <div className="relative grid overflow-hidden rounded-[24px] bg-secondary p-7 sm:grid-cols-[1fr_210px] sm:p-8">
          <div className="relative z-10">
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-[#12804f]">
              <Heart size={14} /> RUANG AMANMU
            </span>
            <h2 className="mt-4 text-2xl font-bold">
              Ada yang ingin kamu ceritakan?
            </h2>
            <p className="mt-3 max-w-md text-xs leading-6 text-[#517168]">
              Nggak perlu menunggu masalah jadi besar. Cerita kecilmu juga
              berarti. Yuk, mulai percakapan dengan guru BK.
            </p>
            <Link
              to="/siswa/konsultasi"
              className={`${buttonPrimary} mt-5 min-h-10 px-5 py-2.5 text-xs`}
            >
              Mulai Konsultasi <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hidden items-center justify-center sm:flex">
            <div className="relative flex size-36 items-center justify-center rounded-full bg-white/55">
              <MessagesSquare
                size={65}
                strokeWidth={1.2}
                className="text-primary"
              />
              <Heart
                size={26}
                className="absolute right-0 top-0 rotate-12 fill-accent text-accent"
              />
              <Sparkles
                size={22}
                className="absolute bottom-0 left-0 text-primary/50"
              />
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {(teacher
          ? [
              {
                title: "Total Konsultasi",
                value: String(stats?.totalKonsultasi ?? 48),
                note: "Konsultasi terdaftar",
                icon: MessagesSquare,
                color: "bg-secondary text-primary",
              },
              {
                title: "Permintaan Baru",
                value: String(stats?.pendingRequests ?? 3),
                note: "Menunggu konfirmasi Anda",
                icon: Clock3,
                color: "bg-accent/15 text-[#a77820]",
              },
              {
                title: "Siswa Didampingi",
                value: String(stats?.totalStudents ?? 32),
                note: "Siswa terdaftar di sistem",
                icon: UsersRound,
                color: "bg-[#eaf0f5] text-[#497385]",
              },
            ]
          : [
              {
                title: "Total Konsultasi",
                value: String(studentTotal),
                note:
                  studentTotal === 0
                    ? "Belum ada sesi konsultasi"
                    : "Langkah baik untuk dirimu",
                icon: MessagesSquare,
                color: "bg-secondary text-primary",
              },
              {
                title: "Konsultasi Aktif",
                value: String(studentActive),
                note:
                  studentActive === 0
                    ? "Tidak ada sesi berlangsung"
                    : "Guru BK siap mendengarkan",
                icon: MessageCircle,
                color: "bg-[#eaf0f5] text-[#497385]",
              },
              {
                title: "Konsultasi Selesai",
                value: String(studentDone),
                note:
                  studentDone === 0
                    ? "Belum ada riwayat selesai"
                    : "Terima kasih sudah bercerita",
                icon: CircleCheck,
                color: "bg-accent/15 text-[#a77820]",
              },
            ]
        ).map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground">
                {item.title}
              </p>
              <span
                className={`flex size-9 items-center justify-center rounded-xl ${item.color}`}
              >
                <item.icon size={19} />
              </span>
            </div>
            <p className="mt-2 text-[31px] font-extrabold">{item.value}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {item.note}
            </p>
          </div>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-5">
            <h2 className="text-sm font-bold">
              {teacher ? "Permintaan Konsultasi Terbaru" : "Konsultasi Terbaru"}
            </h2>
            <Link
              to={teacher ? "/guru/permintaan" : "/siswa/riwayat"}
              className="flex items-center gap-1 text-[10px] font-bold text-[#12804f]"
            >
              Lihat Semua <ChevronRight size={13} />
            </Link>
          </div>
          {teacher ? (
            <Requests compact />
          ) : consultations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Heart size={24} />
              </div>
              <h3 className="text-sm font-bold">Belum Ada Sesi Konsultasi</h3>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
                Nggak semua hal harus kamu hadapi sendiri. Ceritakan masalah
                pribadi, pelajaran, atau pertemananmu kepada guru BK yang siap
                mendengarkan.
              </p>
              <Link
                to="/siswa/konsultasi"
                className={`${buttonPrimary} mt-5 text-xs`}
              >
                Pilih Guru BK & Mulai Cerita <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            <div className="px-5">
              {consultations.slice(0, 4).map((item) => (
                <Link
                  to="/siswa/konsultasi"
                  key={item.id}
                  className="flex items-center gap-3 border-b border-border py-5 last:border-0 hover:bg-muted/50"
                >
                  <Avatar name={item.teacher?.name || "Guru BK"} teacher />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold">{item.topic}</h3>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {item.teacher?.name || "Guru BK"}{" "}
                      <span className="mx-1">·</span>
                      {item.type === "TATAP_MUKA"
                        ? "Tatap Muka"
                        : "Chat Online"}
                    </p>
                    <p className="mt-1 text-[9px] text-muted-foreground sm:hidden">
                      {item.scheduledDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <Status>
                      {item.status === "DITERIMA"
                        ? "Diterima"
                        : item.status === "MENUNGGU"
                          ? "Menunggu"
                          : item.status === "SELESAI"
                            ? "Selesai"
                            : "Dibatalkan"}
                    </Status>
                    <p className="mt-1.5 hidden text-[9px] text-muted-foreground sm:block">
                      {item.scheduledDate}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-bold">Jadwal Mendatang</h2>
          {teacher || consultations.length > 0 ? (
            <div className="mt-5 rounded-xl border border-primary/15 bg-secondary/35 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white px-3 py-2 text-center">
                  <p className="text-[9px] font-semibold text-muted-foreground">
                    OKT
                  </p>
                  <p className="text-xl font-extrabold text-primary">
                    {consultations[0]?.scheduledDate
                      ? consultations[0].scheduledDate.slice(-2)
                      : "01"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold">
                    {consultations[0]?.scheduledDate || "Kamis, 1 Oktober 2026"}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Clock3 size={12} />{" "}
                    {consultations[0]?.scheduledTime || "09.00 – 09.30 WIB"}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-primary/10 pt-4">
                <p className="text-xs font-semibold">
                  {teacher
                    ? "Nadia Putri • XI IPS 1"
                    : `Konsultasi bersama ${consultations[0]?.teacher?.name || "Guru BK"}`}
                </p>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Topik: {consultations[0]?.topic || "Bimbingan Siswa"} •{" "}
                  {consultations[0]?.type === "TATAP_MUKA"
                    ? "Tatap Muka"
                    : "Percakapan online"}
                </p>
              </div>
              <div className="mt-4">
                <Status>Terjadwal</Status>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-[#fafbf9] p-6 text-center">
              <CalendarDays
                className="mx-auto mb-2 text-muted-foreground/50"
                size={28}
              />
              <p className="text-xs font-bold">Belum Ada Jadwal</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Jadwal konsultasi yang kamu ajukan akan muncul di sini.
              </p>
            </div>
          )}
          <button
            onClick={() => setSchedule(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 py-3 text-[11px] font-bold text-[#12804f] hover:bg-secondary"
          >
            <Plus size={15} /> Tambah Jadwal
          </button>
        </section>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-accent/20 bg-[#fff9e9] p-5">
        <Sparkles size={22} className="shrink-0 text-[#b78121]" />
        <div>
          <p className="text-xs font-bold">
            {teacher
              ? "Setiap siswa punya cerita yang berbeda."
              : "Pengingat kecil untuk hari ini"}
          </p>
          <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
            {teacher
              ? "Terima kasih telah menciptakan ruang yang aman untuk siswa bertumbuh."
              : "Kamu nggak perlu membandingkan perjalananmu dengan orang lain. Istirahat sejenak, tarik napas, dan beri dirimu apresiasi."}
          </p>
        </div>
      </div>
      {schedule && <ScheduleModal onClose={() => setSchedule(false)} />}
    </div>
  )
}

const initialRequests = [
  {
    id: 1,
    name: "Nadia Putri",
    kelas: "XI IPS 1",
    topic: "Pribadi",
    date: "Hari ini, 08.15",
    status: "Menunggu",
  },
  {
    id: 2,
    name: "Fajar Ramadhan",
    kelas: "X IPA 3",
    topic: "Akademik",
    date: "Hari ini, 07.40",
    status: "Menunggu",
  },
  {
    id: 3,
    name: "Salsa Amalia",
    kelas: "XII IPA 1",
    topic: "Sosial",
    date: "Kemarin, 15.20",
    status: "Menunggu",
  },
]
function Requests({ compact = false }: { compact?: boolean }) {
  const [requests, setRequests] = useState(initialRequests)
  const [confirm, setConfirm] = useState<number | null>(null)
  useModal(confirm !== null, () => setConfirm(null))
  return (
    <>
      <div
        className={
          compact ? "px-5" : "rounded-2xl border border-border bg-white px-6"
        }
      >
        {requests.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-3 border-b border-border py-5 last:border-0"
          >
            <Avatar name={item.name} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold">{item.name}</p>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                {item.kelas} • {item.topic}
              </p>
              <p className="mt-1 text-[9px] text-muted-foreground">
                {item.date}
              </p>
            </div>
            {item.status === "Menunggu" ? (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setRequests((items) =>
                      items.map((request) =>
                        request.id === item.id
                          ? { ...request, status: "Diterima" }
                          : request,
                      ),
                    )
                  }
                  className="rounded-lg bg-secondary px-3 py-2 text-[10px] font-bold text-[#12804f] hover:bg-primary hover:text-white"
                >
                  Terima
                </button>
                <button
                  onClick={() => setConfirm(item.id)}
                  className="rounded-lg border border-border px-3 py-2 text-[10px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  Tolak
                </button>
              </div>
            ) : (
              <Status>{item.status}</Status>
            )}
          </div>
        ))}
      </div>
      {confirm !== null && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/35 p-5">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title"
            className="w-full max-w-sm rounded-3xl bg-white p-7"
          >
            <h2 id="reject-title" className="text-lg font-bold">
              Tolak permintaan konsultasi?
            </h2>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Siswa akan mendapat informasi bahwa jadwal ini belum dapat
              diterima. Sarankan waktu lain agar siswa tetap mendapatkan
              dukungan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                autoFocus
                onClick={() => setConfirm(null)}
                className={`${buttonSecondary} flex-1 px-3`}
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setRequests((items) =>
                    items.map((item) =>
                      item.id === confirm
                        ? { ...item, status: "Ditolak" }
                        : item,
                    ),
                  )
                  setConfirm(null)
                }}
                className="flex-1 rounded-xl bg-destructive py-3 text-xs font-bold text-white"
              >
                Ya, Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const DEFAULT_TEACHERS: TeacherInfo[] = [
  {
    id: "cmunjxzlv0000jry1kvvc2j3q",
    name: "Ibu Ratna Sari, S.Pd., Kons.",
    email: "ratna@konsulyuk.id",
    phone: "0812-3456-7890",
    bio: "Guru Bimbingan Konseling fokus pada pengembangan karakter, motivasi belajar, dan pendampingan emosi remaja.",
    schedules: [],
  },
  {
    id: "cmunjxzm10001jry1xd8yimdf",
    name: "Bapak Dimas Saputra, M.Pd.",
    email: "dimas@konsulyuk.id",
    phone: "0813-9876-5432",
    bio: "Guru Bimbingan Konseling spesialisasi perencanaan karir, pemilihan jurusan kuliah, dan dinamika sosial pertemanan.",
    schedules: [],
  },
]

function Chat({ teacher = false }: { teacher?: boolean }) {
  const user = useCurrentUser()
  const location = useLocation()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [activeConsultation, setActiveConsultation] =
    useState<Consultation | null>(null)
  const [teachers, setTeachers] = useState<TeacherInfo[]>(DEFAULT_TEACHERS)
  const [messages, setMessages] = useState<ApiMessage[]>([])
  const [text, setText] = useState("")
  const [startingWith, setStartingWith] = useState<string | null>(null)
  const [ended, setEnded] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [scheduleForTeacher, setScheduleForTeacher] =
    useState<TeacherInfo | null>(null)
  const [notice, setNotice] = useState("")

  useModal(confirm, () => setConfirm(false))
  const conversationRef = useRef<HTMLDivElement>(null)

  async function openConsultation(c: Consultation) {
    setActiveConsultation(c)
    setEnded(c.status === "SELESAI")
    try {
      const msgs = await api.messages.list(c.id)
      setMessages(msgs)
    } catch {
      setMessages([])
    }
  }

  async function loadData() {
    try {
      const [consList, teachList] = await Promise.all([
        api.consultations.list().catch(() => []),
        api.auth.getTeachers().catch(() => []),
      ])
      setConsultations(consList)
      if (teachList && teachList.length > 0) {
        setTeachers(teachList)
      }

      // Hanya buka percakapan jika secara spesifik diakses lewat URL param ?id=...
      const params = new URLSearchParams(window.location.search)
      const requestedId = params.get("id")
      if (requestedId) {
        const found = consList.find((c) => c.id === requestedId)
        if (found) {
          await openConsultation(found)
          return
        }
      }

      // Secara default, halaman utama untuk siswa adalah Pilih Guru BK (activeConsultation = null)
      setActiveConsultation(null)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!activeConsultation) return
    const timer = setInterval(async () => {
      try {
        const msgs = await api.messages.list(activeConsultation.id)
        setMessages(msgs)
      } catch {}
    }, 2500)
    return () => clearInterval(timer)
  }, [activeConsultation?.id])

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [messages, ended])

  async function handleStartChat(t: TeacherInfo) {
    setStartingWith(t.id)
    try {
      // Cek apakah sudah ada sesi aktif dengan guru ini yang belum selesai
      const existing = consultations.find(
        (c) => c.teacherId === t.id && c.status !== "SELESAI",
      )
      if (existing) {
        await openConsultation(existing)
        return
      }

      const newCons = await api.consultations.create({
        teacherId: t.id,
        topic: "Bimbingan & Konseling Siswa",
        scheduledDate: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        scheduledTime: "Sesi Langsung",
        type: "CHAT",
        studentNotes: "Memulai percakapan langsung bimbingan konseling.",
      })
      setConsultations((prev) => [newCons, ...prev])
      await openConsultation(newCons)
    } catch (err) {
      console.error(err)
    } finally {
      setStartingWith(null)
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || ended || !activeConsultation) return
    const msgText = text.trim()
    setText("")

    const tempMsg: ApiMessage = {
      id: String(Date.now()),
      consultationId: activeConsultation.id,
      senderId: user?.id || "",
      senderRole: teacher ? "teacher" : "student",
      text: msgText,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempMsg])

    try {
      const real = await api.messages.send(activeConsultation.id, msgText)
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? real : m)))
    } catch {}
  }

  async function handleEnd() {
    if (!activeConsultation) return
    try {
      await api.consultations.updateStatus(activeConsultation.id, "SELESAI")
      setEnded(true)
      setConfirm(false)
      setNotice("Konsultasi telah diakhiri. Terima kasih sudah bercerita.")
    } catch {}
  }

  const ownRole = teacher ? "teacher" : "student"
  const partnerName = teacher
    ? activeConsultation?.student?.name || "Siswa"
    : activeConsultation?.teacher?.name || "Guru BK"
  const partnerRole = teacher
    ? activeConsultation?.student?.kelas || "Siswa"
    : "Guru Bimbingan Konseling"

  // 1. TAMPILAN UTAMA SISWA: PILIH GURU BK (Bila belum masuk ke percakapan tertentu)
  if (!teacher && !activeConsultation) {
    const activeSessions = consultations.filter((c) => c.status !== "SELESAI")

    return (
      <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-[#12804f]">
              <Heart size={13} /> Ruang Aman KonsulYuk!
            </span>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Pilih Guru Bimbingan Konseling
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Setiap cerita didengarkan dengan bijak tanpa menghakimi. Silakan pilih guru BK yang paling nyaman untuk ceritamu.
            </p>
          </div>
        </div>

        {/* Jika ada percakapan aktif yang sedang berjalan, tampilkan sebagai opsi lanjutkan */}
        {activeSessions.length > 0 && (
          <div className="mb-8 rounded-3xl border border-primary/20 bg-secondary/40 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-white">
                  <MessageCircle size={15} />
                </span>
                <h2 className="text-sm font-bold text-foreground">
                  Percakapan yang Sedang Berjalan
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {activeSessions.length} sesi aktif
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeSessions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-xs transition hover:border-primary/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={c.teacher?.name || "Guru BK"} teacher size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold">
                        {c.teacher?.name || "Guru BK"}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {c.topic}
                      </p>
                      <span className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-[9px] font-semibold text-primary">
                        {c.status === "DITERIMA" ? "Sedang Berlangsung" : c.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openConsultation(c)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#118451]"
                  >
                    Lanjutkan Chat <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground">
            Daftar Guru Bimbingan Konseling Tersedia
          </h2>
          <p className="text-xs text-muted-foreground">
            Pilih guru BK untuk langsung memulai sesi konsultasi pribadi.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {teachers.map((t) => {
            const existingActive = consultations.find(
              (c) => c.teacherId === t.id && c.status !== "SELESAI",
            )
            return (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-3xl border border-border bg-white p-7 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <Avatar name={t.name} teacher size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold">{t.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-[#12804f]">
                        Guru Bimbingan Konseling
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-[#12804f]">
                        <span className="size-1.5 rounded-full bg-primary" /> Siap Mendengarkan
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-muted/70 p-4 text-xs leading-6 text-muted-foreground">
                    <p className="mb-1 font-semibold text-foreground">
                      Fokus Pendampingan:
                    </p>
                    <p>
                      {t.bio ||
                        "Mendampingi siswa dalam belajar, stres akademik, sosial, dan perencanaan masa depan."}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Jadwal Layanan:
                    </span>
                    {t.schedules && t.schedules.length > 0 ? (
                      t.schedules.slice(0, 3).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-lg bg-muted px-2 py-0.5 text-[10px]"
                        >
                          {s.day} ({s.timeSlot})
                        </span>
                      ))
                    ) : (
                      <span className="rounded-lg bg-muted px-2 py-0.5 text-[10px]">
                        Senin – Jumat (Jam Sekolah)
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    disabled={startingWith === t.id}
                    onClick={() => handleStartChat(t)}
                    className={`${buttonPrimary} flex-1 text-xs`}
                  >
                    {startingWith === t.id ? (
                      "Membuka Sesi..."
                    ) : existingActive ? (
                      <>
                        <MessageCircle size={16} /> Lanjutkan Chat
                      </>
                    ) : (
                      <>
                        <MessageCircle size={16} /> Mulai Chat Konsultasi
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setScheduleForTeacher(t)}
                    className={`${buttonSecondary} text-xs`}
                  >
                    <CalendarDays size={16} /> Jadwalkan
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {scheduleForTeacher && (
          <ScheduleModal onClose={() => setScheduleForTeacher(null)} />
        )}
      </>
    )
  }

  // 2. TAMPILAN UTAMA GURU: DAFTAR KONSULTASI SISWA (Bila guru belum memilih konsultasi)
  if (teacher && !activeConsultation) {
    return (
      <>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-[#12804f]">
              <ShieldCheck size={13} /> Ruang Konseling Guru BK
            </span>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              Konsultasi Siswa
            </h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Daftar sesi pendampingan siswa yang siap Anda dengarkan dan bimbing.
            </p>
          </div>
        </div>

        {consultations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <Heart size={36} className="mx-auto mb-4 text-primary/40" />
            <h2 className="text-base font-bold">Belum Ada Sesi Konsultasi Siswa</h2>
            <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
              Siswa yang memulai percakapan atau menjadwalkan konsultasi dengan Anda akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-white p-6 shadow-xs transition hover:border-primary/40"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.student?.name || "Siswa"} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold">
                        {c.student?.name || "Siswa"}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">
                        {c.student?.kelas || "Siswa"} · {c.type === "TATAP_MUKA" ? "Tatap Muka" : "Chat Online"}
                      </p>
                    </div>
                    <Status>{c.status === "SELESAI" ? "Selesai" : "Berlangsung"}</Status>
                  </div>
                  <div className="mt-4 rounded-xl bg-muted/60 p-3 text-xs">
                    <p className="font-semibold text-foreground">{c.topic}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Tanggal: {c.scheduledDate || "Hari Ini"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openConsultation(c)}
                  className={`${buttonPrimary} mt-5 w-full text-xs`}
                >
                  <MessageCircle size={15} /> Buka Ruang Percakapan
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  // 3. TAMPILAN RUANG PERCAKAPAN (Saat aktif dalam konsultasi)
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveConsultation(null)
              setMessages([])
              window.history.replaceState({}, "", window.location.pathname)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-xs font-bold text-foreground shadow-xs transition hover:border-primary hover:bg-secondary hover:text-primary"
          >
            <ChevronLeft size={16} />
            {teacher ? "Kembali ke Daftar Konsultasi" : "Kembali ke Pilih Guru"}
          </button>
          <div>
            <h1 className="text-xl font-extrabold sm:text-2xl">
              {teacher
                ? `Konsultasi: ${partnerName}`
                : `Konsultasi Bersama ${partnerName}`}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeConsultation?.topic || "Bimbingan Siswa"} ·{" "}
              {activeConsultation?.scheduledDate || "Hari Ini"}
            </p>
          </div>
        </div>
        <Status>{ended ? "Selesai" : "Berlangsung"}</Status>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
        <section className="flex h-[660px] max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-border bg-white">
          <header className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="relative">
              <Avatar name={partnerName} teacher={!teacher} />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">{partnerName}</h2>
              <p className="mt-1 text-[10px] text-[#12804f]">
                {partnerRole} •{" "}
                {ended ? "Konsultasi selesai" : "Sedang tersedia"}
              </p>
            </div>
            <span
              className="ml-auto flex size-9 items-center justify-center rounded-full bg-secondary text-primary"
              title="Percakapan pribadi"
            >
              <ShieldCheck size={18} />
            </span>
          </header>
          <div
            ref={conversationRef}
            className="flex-1 space-y-4 overflow-y-auto bg-[#edf6f0]/70 p-4 sm:p-6"
          >
            <p className="text-center text-[10px] text-muted-foreground">
              {activeConsultation?.scheduledDate || "Hari Ini"}
            </p>
            <p className="mx-auto max-w-sm rounded-xl bg-secondary/70 px-4 py-2.5 text-center text-[9px] leading-5 text-[#517168]">
              Ceritamu ditangani dengan penuh kepedulian. Guru BK akan
              menjelaskan batas kerahasiaan jika keselamatanmu membutuhkan
              bantuan.
            </p>

            {messages.length === 0 && (
              <div className="mx-auto my-6 max-w-md rounded-2xl border border-dashed border-primary/30 bg-secondary/30 p-6 text-center">
                <Heart size={28} className="mx-auto mb-2 text-primary" />
                <h3 className="text-xs font-bold text-foreground">
                  Ruang Konsultasi Aktif
                </h3>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Halo{" "}
                  <span className="font-semibold text-foreground">
                    {user?.name || "Siswa"}
                  </span>
                  ! Sesi bimbingan bersama{" "}
                  <span className="font-semibold text-foreground">
                    {partnerName}
                  </span>{" "}
                  telah siap. Mulai ceritakan apa pun yang sedang kamu rasakan.
                </p>
              </div>
            )}

            {messages.map((item) => {
              const isMe = item.senderRole === ownRole
              const timeDisplay = item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""
              return (
                <div
                  key={item.id}
                  className={`flex gap-2.5 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isMe && (
                    <Avatar name={partnerName} teacher={!teacher} size="sm" />
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                      isMe
                        ? "rounded-tr-sm bg-primary text-white"
                        : "rounded-tl-sm border border-border bg-white"
                    }`}
                  >
                    <p className="text-[12px] leading-6">{item.text}</p>
                    <p
                      className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
                        isMe ? "text-white/75" : "text-muted-foreground"
                      }`}
                    >
                      {timeDisplay}
                      {isMe && <CheckCheck size={12} />}
                    </p>
                  </div>
                </div>
              )
            })}
            {ended && (
              <p className="rounded-xl bg-secondary py-3 text-center text-xs font-semibold text-[#12804f]">
                Konsultasi Selesai. Terima kasih sudah bercerita.
              </p>
            )}
          </div>
          <form
            onSubmit={send}
            className="flex items-end gap-2 border-t border-border p-4"
          >
            <input
              aria-label="Tulis pesan"
              disabled={ended}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={
                ended
                  ? "Konsultasi ini sudah selesai"
                  : "Tulis ceritamu di sini..."
              }
              className={`${inputClass} border-0 bg-muted`}
            />
            <button
              aria-label="Kirim Pesan"
              disabled={ended || !text.trim()}
              className={`${buttonPrimary} min-h-12 px-4`}
            >
              <Send size={18} />
              <span className="hidden text-xs sm:block">Kirim Pesan</span>
            </button>
          </form>
        </section>
        <aside className="space-y-5">
          <section className="rounded-2xl border border-border bg-white p-6 text-center">
            <div className="flex justify-center">
              <Avatar name={partnerName} size="lg" teacher={!teacher} />
            </div>
            <h3 className="mt-4 text-sm font-bold">{partnerName}</h3>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {partnerRole}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[10px] text-[#12804f]">
              <span className="size-1.5 rounded-full bg-primary" /> Tersedia
            </span>
            <div className="mt-5 border-t border-border pt-4 text-left text-[11px]">
              <p className="font-semibold">Tentang konsultasi</p>
              <p className="mt-3 text-muted-foreground">
                Topik: {activeConsultation?.topic || "Bimbingan Siswa"}
              </p>
              <p className="mt-2 text-muted-foreground">
                Tanggal: {activeConsultation?.scheduledDate || "Hari ini"}
              </p>
            </div>
            <button
              onClick={() => setConfirm(true)}
              disabled={ended}
              className="mt-6 w-full rounded-xl border border-destructive/25 py-3 text-[11px] font-semibold text-destructive hover:bg-destructive/5 disabled:opacity-40"
            >
              {ended ? "Konsultasi Selesai" : "Akhiri Konsultasi"}
            </button>
          </section>
          <section className="rounded-2xl bg-secondary p-5">
            <Heart size={22} className="text-primary" />
            <h3 className="mt-3 text-xs font-bold">Cerita dengan nyaman.</h3>
            <p className="mt-2 text-[11px] leading-6 text-[#517168]">
              Nggak ada cerita yang terlalu kecil. Ambil waktumu, dan sampaikan
              apa yang kamu rasakan.
            </p>
          </section>
        </aside>
      </div>
      {notice && (
        <p role="status" className="mt-3 text-sm text-primary">
          {notice}
        </p>
      )}
      {confirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground/35 p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-title"
            className="w-full max-w-sm rounded-3xl bg-white p-7"
          >
            <CircleCheck className="mb-4 text-primary" size={32} />
            <h2 id="end-title" className="text-xl font-bold">
              Sudah selesai bercerita?
            </h2>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              Setelah diakhiri, percakapan ini tetap dapat dibaca. Kamu bisa
              memulai sesi baru kapan pun dibutuhkan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                autoFocus
                onClick={() => setConfirm(false)}
                className={`${buttonSecondary} flex-1 px-3`}
              >
                Belum, lanjutkan
              </button>
              <button
                onClick={handleEnd}
                className={`${buttonPrimary} flex-1 px-3`}
              >
                Ya, Selesai
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  )
}

function HistoryPage({ teacher = false }: { teacher?: boolean }) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("Semua")
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.consultations
      .list()
      .then((data) => setConsultations(data))
      .catch(() => setConsultations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = consultations.filter((c) => {
    const statusText = c.status === "SELESAI" ? "Selesai" : "Berlangsung"
    const matchFilter = filter === "Semua" || statusText === filter
    const partnerName = teacher
      ? c.student?.name || "Siswa"
      : c.teacher?.name || "Guru BK"
    const matchSearch =
      c.topic.toLowerCase().includes(search.toLowerCase()) ||
      partnerName.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <>
      <PageHeading
        title="Riwayat Konsultasi"
        description={
          teacher
            ? "Lihat kembali perjalanan pendampingan siswa Anda."
            : "Setiap cerita adalah bagian dari perjalananmu."
        }
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-1 rounded-xl border border-border bg-white p-1">
          {["Semua", "Berlangsung", "Selesai"].map((label) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className={`rounded-lg px-4 py-2 text-[11px] font-semibold ${
                filter === label
                  ? "bg-secondary text-[#12804f]"
                  : "text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-3.5 text-muted-foreground"
          />
          <input
            aria-label="Cari konsultasi"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari konsultasi..."
            className={`${inputClass} max-w-64 pl-10`}
          />
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-10 text-center text-xs text-muted-foreground">
            Memuat riwayat...
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((item) => {
            const partnerName = teacher
              ? item.student?.name || "Siswa"
              : item.teacher?.name || "Guru BK"
            const statusLabel =
              item.status === "SELESAI" ? "Selesai" : "Berlangsung"
            const targetUrl = `${teacher ? "/guru/konsultasi" : "/siswa/konsultasi"}?id=${item.id}`

            return (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-xs transition hover:border-primary/40"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <MessageCircle size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-bold">{item.topic}</h2>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {partnerName} •{" "}
                    {item.type === "TATAP_MUKA"
                      ? "Tatap Muka"
                      : "Chat Online"}{" "}
                    • {item.scheduledDate || "Hari ini"}
                  </p>
                </div>
                <Status>{statusLabel}</Status>
                <Link
                  to={targetUrl}
                  className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-[11px] font-bold text-[#12804f] hover:bg-primary hover:text-white"
                >
                  Buka Chat <ArrowRight size={14} />
                </Link>
              </div>
            )
          })
        ) : consultations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <Heart size={36} className="mx-auto mb-4 text-primary/40" />
            <h2 className="text-base font-bold">Belum Ada Riwayat Konsultasi</h2>
            <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
              {teacher
                ? "Belum ada sesi konsultasi yang tercatat bersama siswa."
                : "Kamu belum pernah melakukan konsultasi. Mulai ceritakan apa pun kepada Guru BK pilihanmu."}
            </p>
            {!teacher && (
              <Link
                to="/siswa/konsultasi"
                className={`${buttonPrimary} mt-5 text-xs`}
              >
                Pilih Guru BK & Mulai Sesi <ArrowRight size={14} />
              </Link>
            )}
          </div>
        ) : (
          <Empty
            title="Belum ada hasil yang cocok"
            text="Coba gunakan kata lain atau pilih semua status konsultasi."
          />
        )}
      </div>
    </>
  )
}
function PageHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-7">
      <h1 className="text-[28px] font-extrabold">{title}</h1>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
      <Search className="mx-auto mb-5 text-primary/50" size={36} />
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}
function Notifications() {
  const [read, setRead] = useState(false)
  const user = useCurrentUser()

  return (
    <>
      <div className="flex flex-wrap justify-between gap-3">
        <PageHeading
          title="Notifikasi"
          description="Kabar terbaru tentang konsultasi dan jadwalmu."
        />
        <button
          onClick={() => setRead(true)}
          className="mb-7 text-xs font-bold text-[#12804f]"
        >
          {read ? "Semua sudah dibaca" : "Tandai semua dibaca"}
        </button>
      </div>
      <div className="space-y-4">
        {[
          {
            icon: CalendarDays,
            title: "Selamat datang di KonsulYuk!",
            text: `Halo ${user?.name || "Siswa"}! Ruang bimbingan konseling selalu siap mendampingimu kapan pun dibutuhkan.`,
            time: "Baru saja",
          },
          {
            icon: MessageCircle,
            title: "Pilih Guru BK untuk Mulai Konsultasi",
            text: "Kunjungi menu Konsultasi Saya untuk memilih guru BK dan mulai bercerita dengan nyaman.",
            time: "1 jam yang lalu",
          },
          {
            icon: Heart,
            title: "Jangan lupa beri waktu untuk dirimu",
            text: "Istirahat sejenak dan lakukan hal kecil yang membuatmu merasa lebih baik.",
            time: "Kemarin",
          },
        ].map((item) => (
          <Link
            key={item.title}
            to="/siswa/konsultasi"
            className={`flex items-start gap-4 rounded-2xl border p-5 ${
              read
                ? "border-border bg-white"
                : "border-primary/15 bg-secondary/40"
            }`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
              <item.icon size={21} />
            </span>
            <div className="flex-1">
              <h2 className="text-xs font-bold">{item.title}</h2>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {item.text}
              </p>
              <p className="mt-3 text-[10px] text-muted-foreground">
                {item.time}
              </p>
            </div>
            {!read && (
              <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </div>
    </>
  )
}
function SettingsPage({ teacher = false }: { teacher?: boolean }) {
  const [saved, setSaved] = useState(false)
  const [notif, setNotif] = useState(true)
  const user = useCurrentUser()

  const displayName =
    user?.name || (teacher ? "Ibu Ratna Sari, S.Pd." : "Siswa")
  const displayEmail =
    user?.email || (teacher ? "ratna@konsulyuk.id" : "siswa@konsulyuk.id")
  const displayKelas =
    user?.kelas || (teacher ? "Bimbingan Konseling" : "Kelas X")

  return (
    <>
      <PageHeading
        title="Pengaturan"
        description="Kelola profil dan kenyamanan ruang konsultasimu."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setSaved(true)
        }}
        className="max-w-2xl rounded-2xl border border-border bg-white p-6 sm:p-8"
      >
        <div className="mb-7 flex items-center gap-4">
          <Avatar
            name={displayName}
            size="lg"
            teacher={teacher}
          />
          <div>
            <h2 className="text-sm font-bold">
              Profil {teacher ? "Guru BK" : "Siswa"}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Informasi yang membantu kami mengenalmu.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Nama lengkap
            <input
              defaultValue={displayName}
              key={displayName}
              required
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold">
            Alamat email
            <input
              type="email"
              defaultValue={displayEmail}
              key={displayEmail}
              required
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold">
            {teacher ? "Bidang" : "Kelas"}
            <input
              defaultValue={displayKelas}
              key={displayKelas}
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold">
            Nomor WhatsApp / Telepon
            <input
              type="tel"
              defaultValue={user?.phone || (teacher ? "0812-3456-7890" : "")}
              placeholder="08xxxxxxxxxx"
              className={`${inputClass} mt-2`}
            />
          </label>
        </div>
        <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          <div>
            <h3 className="text-xs font-bold">Pengingat konsultasi</h3>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Dapatkan kabar tentang jadwal dan pesan terbaru.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={notif}
            aria-label="Pengingat konsultasi"
            onClick={() => setNotif(!notif)}
            className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition ${
              notif ? "justify-end bg-primary" : "justify-start bg-border"
            }`}
          >
            <span className="size-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
        <button className={`${buttonPrimary} mt-7`}>
          Simpan Perubahan <Check size={16} />
        </button>
        {saved && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-secondary p-3 text-xs text-[#12804f]"
          >
            Perubahan ditampilkan dalam pratinjau. Data tidak disimpan ke
            server.
          </p>
        )}
      </form>
    </>
  )
}
function TeacherRequests() {
  return (
    <>
      <PageHeading
        title="Permintaan Konsultasi"
        description="Berikan waktu dan ruang untuk cerita baru dari siswa."
      />
      <Requests />
    </>
  )
}
function TeacherStudents() {
  const [search, setSearch] = useState("")
  const students = [
    { name: "Aditya Pratama", kelas: "XI IPA 2", count: 5 },
    { name: "Nadia Putri", kelas: "XI IPS 1", count: 3 },
    { name: "Fajar Ramadhan", kelas: "X IPA 3", count: 2 },
    { name: "Salsa Amalia", kelas: "XII IPA 1", count: 4 },
  ].filter((item) =>
    `${item.name} ${item.kelas}`.toLowerCase().includes(search.toLowerCase()),
  )
  return (
    <>
      <PageHeading
        title="Data Siswa"
        description="Kenali siswa yang Anda dampingi, satu cerita setiap waktu."
      />
      <div className="relative mb-6 max-w-sm">
        <Search
          size={17}
          className="absolute left-4 top-3.5 text-muted-foreground"
        />
        <input
          aria-label="Cari nama atau kelas siswa"
          placeholder="Cari nama atau kelas siswa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${inputClass} pl-11`}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {students.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-border bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <Avatar name={item.name} size="lg" />
              <div>
                <h2 className="text-sm font-bold">{item.name}</h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  Kelas {item.kelas}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-[11px] text-muted-foreground">
                {item.count} konsultasi
              </span>
              <Link
                to="/guru/riwayat"
                className="flex items-center gap-1 text-[11px] font-semibold text-[#12804f]"
              >
                Lihat Riwayat <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      {!students.length && (
        <Empty
          title="Siswa belum ditemukan"
          text="Coba cari dengan nama atau kelas yang berbeda."
        />
      )}
    </>
  )
}
function TeacherSchedule() {
  const [show, setShow] = useState(false)
  return (
    <>
      <div className="flex flex-wrap justify-between gap-3">
        <PageHeading
          title="Jadwal Konsultasi"
          description="Atur waktu pendampingan dengan nyaman dan terstruktur."
        />
        <button
          className={`${buttonPrimary} mb-7`}
          onClick={() => setShow(true)}
        >
          <Plus size={17} /> Tambah Jadwal
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-lg font-bold">Oktober 2026</h2>
          <span className="text-xs text-muted-foreground">
            Jadwal minggu ini
          </span>
        </div>
        {[
          {
            date: "01",
            day: "Kamis",
            time: "09.00 – 09.30",
            name: "Nadia Putri",
            topic: "Pribadi",
          },
          {
            date: "01",
            day: "Kamis",
            time: "10.00 – 10.30",
            name: "Aditya Pratama",
            topic: "Akademik",
          },
          {
            date: "02",
            day: "Jumat",
            time: "09.00 – 09.30",
            name: "Fajar Ramadhan",
            topic: "Akademik",
          },
        ].map((item) => (
          <div
            key={item.name}
            className="flex flex-wrap items-center gap-4 border-t border-border py-5"
          >
            <div className="w-14 rounded-xl bg-secondary py-2 text-center">
              <span className="text-[9px] text-muted-foreground">OKT</span>
              <p className="text-2xl font-bold text-primary">{item.date}</p>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold">{item.name}</h3>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {item.day}, {item.time} WIB • {item.topic}
              </p>
            </div>
            <Status>Terjadwal</Status>
          </div>
        ))}
      </div>
      {show && <ScheduleModal onClose={() => setShow(false)} />}
    </>
  )
}

function DesignSystem() {
  const [modal, setModal] = useState(false)
  return (
    <>
      <div className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <Logo />
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <ChevronLeft size={15} /> Kembali ke Beranda
          </Link>
        </div>
      </div>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageHeading
          title="Sistem Desain KonsulYuk!"
          description="Fondasi visual yang konsisten: ramah, menenangkan, dan mudah dikembangkan."
        />
        <div className="space-y-7">
          <section className="rounded-2xl border border-border bg-white p-7">
            <h2 className="mb-6 text-lg font-bold">Palet Warna</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Hijau utama", "#16A765", "bg-primary"],
                ["Teal gelap", "#123E46", "bg-foreground"],
                ["Mint lembut", "#E8F7EF", "bg-secondary"],
                ["Krem hangat", "#FFFCF4", "bg-background"],
                ["Kuning aksen", "#FFB52E", "bg-accent"],
                ["Abu-abu teks", "#64748B", "bg-muted-foreground"],
                ["Abu-abu garis", "#E2E8F0", "bg-border"],
                ["Merah kesalahan", "#DC5757", "bg-destructive"],
              ].map(([name, hex, color]) => (
                <div key={name}>
                  <div
                    className={`h-20 rounded-xl border border-foreground/5 ${color}`}
                  />
                  <p className="mt-3 text-xs font-bold">{name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {hex}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-white p-7">
            <h2 className="mb-5 text-lg font-bold">
              Tipografi • Plus Jakarta Sans
            </h2>
            <p className="text-4xl font-extrabold">Ada masalah? Yuk, cerita!</p>
            <p className="mt-5 text-2xl font-bold">
              Setiap cerita layak didengarkan.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Teks isi yang ramah, jelas, dan mudah dibaca. Jarak antarbaris
              yang nyaman membantu setiap pesan tersampaikan.
            </p>
            <p className="mt-5 text-xs font-bold tracking-[0.13em] text-primary">
              RUANG AMAN UNTUK CERITAMU
            </p>
          </section>
          <div className="grid gap-7 md:grid-cols-2">
            <section className="rounded-2xl border border-border bg-white p-7">
              <h2 className="mb-6 text-lg font-bold">Tombol & Status</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  className={buttonPrimary}
                  onClick={() => setModal(true)}
                >
                  Mulai Konsultasi <ArrowRight size={16} />
                </button>
                <button
                  className={buttonSecondary}
                  onClick={() => setModal(true)}
                >
                  Jadwalkan Konsultasi
                </button>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Status>Berlangsung</Status>
                <Status>Menunggu</Status>
                <Status>Selesai</Status>
                <Status>Terjadwal</Status>
              </div>
              <div className="mt-7 flex items-center gap-4">
                <Avatar name="Aditya Pratama" />
                <Avatar name="Ratna Sari" teacher />
                <Avatar name="Nadia Putri" size="sm" />
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-white p-7">
              <h2 className="mb-6 text-lg font-bold">Input & Notifikasi</h2>
              <label className="text-xs font-semibold">
                Alamat email
                <input
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  className={`${inputClass} mt-2`}
                />
              </label>
              <p className="mt-5 flex items-center gap-2 rounded-xl bg-secondary p-4 text-xs text-[#12804f]">
                <CircleCheck size={17} /> Jadwal konsultasimu berhasil diajukan.
              </p>
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-xs text-destructive">
                <Info size={17} /> Periksa kembali alamat emailmu, ya.
              </p>
            </section>
          </div>
          <section className="rounded-2xl border border-border bg-white p-7">
            <h2 className="mb-4 text-lg font-bold">Aturan Tata Letak</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Grid desktop hingga 1.216 px • Jarak dasar 4 dan 8 px • Sudut
              kartu 16–20 px • Tinggi tombol minimal 48 px • Konten bertumpuk
              pada tablet dan smartphone • Ikon SVG dengan ketebalan konsisten.
            </p>
          </section>
          <Empty
            title="Belum ada konsultasi"
            text="Cerita pertamamu bisa dimulai kapan pun kamu siap."
          />
        </div>
      </main>
      {modal && <ScheduleModal onClose={() => setModal(false)} />}
      <Footer />
    </>
  )
}
function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Heart className="mb-6 text-primary" size={44} />
      <h1 className="text-3xl font-bold">Halaman belum ditemukan.</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Yuk, kembali ke ruang yang tepat.
      </p>
      <Link to="/" className={`${buttonPrimary} mt-7`}>
        Kembali ke Beranda
      </Link>
    </main>
  )
}

const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/masuk", element: <Auth /> },
  { path: "/daftar", element: <Auth register /> },
  { path: "/lupa-kata-sandi", element: <Auth reset /> },
  { path: "/lengkapi-profil", Component: CompleteProfile },
  { path: "/sistem-desain", Component: DesignSystem },
  {
    path: "/siswa",
    element: <Shell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "konsultasi", Component: Chat },
      { path: "riwayat", element: <HistoryPage /> },
      { path: "notifikasi", element: <Navigate to="/siswa" replace /> },
      { path: "pengaturan", element: <SettingsPage /> },
    ],
  },
  {
    path: "/guru",
    element: <Shell teacher />,
    children: [
      { index: true, element: <Dashboard teacher /> },
      { path: "permintaan", Component: TeacherRequests },
      { path: "jadwal", Component: TeacherSchedule },
      { path: "siswa", Component: TeacherStudents },
      { path: "riwayat", element: <HistoryPage teacher /> },
      { path: "pengaturan", element: <SettingsPage teacher /> },
      { path: "konsultasi", element: <Chat teacher /> },
    ],
  },
  {
    path: "/operator",
    element: <OperatorLayout />,
    children: [
      { index: true, element: <OperatorHome /> },
      { path: "siswa", element: <OperatorStudents /> },
      { path: "guru-bk", element: <OperatorTeachers /> },
      { path: "operator", element: <OperatorOperators /> },
      { path: "konsultasi", element: <OperatorConsultations /> },
      { path: "jadwal", element: <OperatorSchedule /> },
      { path: "notifikasi", element: <OperatorNotifications /> },
      { path: "pengaturan", element: <OperatorSettings /> },
      { path: "audit-log", element: <OperatorAuditLog /> },
      { path: "profil", element: <OperatorProfile /> },
    ],
  },
  { path: "*", Component: NotFound },
])

export default function App() {
  useEffect(() => {
    document.documentElement.lang = "id"
    document.title = "KonsulYuk! — Ruang Aman untuk Ceritamu"
    let currentPath = router.state.location.pathname
    return router.subscribe((state) => {
      if (state.location.pathname !== currentPath) {
        currentPath = state.location.pathname
        window.scrollTo({ top: 0, behavior: "instant" })
      }
    })
  }, [])
  return <RouterProvider router={router} />
}
