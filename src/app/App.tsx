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
} from "lucide-react"
import logo from "../imports/konsulyuk-logo.png"

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
        <div className="hidden items-center gap-6 md:flex">
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
          <Link to="/masuk" className={buttonSecondary}>
            Masuk
          </Link>
          <Link to="/daftar" className={buttonPrimary}>
            Daftar Sekarang
          </Link>
        </nav>
      )}
    </header>
  )
}

function Landing() {
  return (
    <>
      <Navbar />
      <main>
        <section
          id="beranda"
          className="mx-auto grid max-w-[1216px] items-center gap-9 px-6 pb-14 pt-14 md:grid-cols-[1.05fr_1fr] md:gap-3 md:pb-16 md:pt-16 lg:px-8"
        >
          <div className="relative z-10">
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
              <Link to="/daftar" className={buttonPrimary}>
                Mulai Konsultasi <ArrowRight size={17} />
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
  const [role, setRole] = useState("siswa")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (register && data.get("password") !== data.get("confirm")) {
      setError("Konfirmasi kata sandi belum cocok. Coba periksa kembali, ya.")
      return
    }
    if (reset) {
      setSuccess(true)
      return
    }
    navigate(role === "guru" ? "/guru" : "/siswa")
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
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
                  <div>
                    <label className="mb-2 block text-xs font-semibold">
                      Saya adalah
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["siswa", "Siswa", GraduationCap],
                        ["guru", "Guru BK", UsersRound],
                      ].map(([value, label, Icon]) => {
                        const RoleIcon = Icon as typeof Heart
                        return (
                          <button
                            key={String(value)}
                            type="button"
                            onClick={() => setRole(String(value))}
                            aria-pressed={role === value}
                            className={`flex items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold ${
                              role === value
                                ? "border-primary bg-secondary text-[#12804f]"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            <RoleIcon size={17} />
                            {String(label)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {!register && (
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
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
                      Saya memahami bahwa ini adalah pratinjau desain dan data
                      tidak disimpan.
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
              <button className={`${buttonPrimary} w-full`}>
                {reset ? "Pratinjau Pemulihan" : register ? "Daftar" : "Masuk"}
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

const studentNav = [
  { label: "Beranda", path: "/siswa", icon: House },
  { label: "Konsultasi Saya", path: "/siswa/konsultasi", icon: MessageCircle },
  { label: "Riwayat Konsultasi", path: "/siswa/riwayat", icon: History },
  { label: "Notifikasi", path: "/siswa/notifikasi", icon: Bell },
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
function Shell({ teacher = false }: { teacher?: boolean }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const nav = teacher ? teacherNav : studentNav
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])
  return (
    <div className="min-h-screen bg-[#f7faf8]">
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
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-destructive"
          >
            <LogOut size={17} /> Keluar
          </Link>
          <div className="mt-5 flex items-center gap-3 border-t border-border px-2 pt-5">
            <Avatar
              name={teacher ? "Ratna Sari" : "Aditya Pratama"}
              teacher={teacher}
            />
            <div>
              <p className="text-xs font-bold">
                {teacher ? "Ibu Ratna Sari" : "Aditya Pratama"}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {teacher ? "Guru Bimbingan Konseling" : "Kelas XI IPA 2"}
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
            <Link
              aria-label="Lihat notifikasi"
              to={teacher ? "/guru/permintaan" : "/siswa/notifikasi"}
              className="relative rounded-full border border-border p-2.5"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
            </Link>
            <Avatar
              name={teacher ? "Ratna Sari" : "Aditya Pratama"}
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
  useModal(true, onClose)
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
              Pada pratinjau ini, permintaanmu ditandai berhasil. Guru BK akan
              mengonfirmasi jadwal dalam aplikasi yang sebenarnya.
            </p>
            <button
              className={`${buttonPrimary} mt-6 w-full`}
              onClick={onClose}
            >
              Baik, terima kasih
            </button>
          </>
        ) : (
          <form
            className="mt-6 space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              setDone(true)
            }}
          >
            <label className="block text-xs font-semibold">
              Guru BK
              <select className={`${inputClass} mt-2`}>
                <option>Ibu Ratna Sari</option>
                <option>Bapak Dimas Saputra</option>
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold">
                Tanggal
                <input
                  type="date"
                  defaultValue="2026-10-01"
                  min="2026-09-30"
                  required
                  className={`${inputClass} mt-2`}
                />
              </label>
              <label className="text-xs font-semibold">
                Waktu
                <select className={`${inputClass} mt-2`}>
                  <option>09.00 – 09.30</option>
                  <option>10.00 – 10.30</option>
                  <option>13.00 – 13.30</option>
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold">
              Topik konsultasi
              <select className={`${inputClass} mt-2`}>
                <option>Akademik</option>
                <option>Pribadi</option>
                <option>Sosial & pertemanan</option>
              </select>
            </label>
            <p className="flex items-start gap-2 rounded-xl bg-secondary p-3 text-[11px] leading-5 text-[#517168]">
              <ShieldCheck size={17} className="shrink-0" /> Kamu bisa bercerita
              lebih lanjut saat konsultasi dimulai.
            </p>
            <button className={`${buttonPrimary} w-full`}>
              Ajukan Jadwal <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

function Dashboard({ teacher = false }: { teacher?: boolean }) {
  const [schedule, setSchedule] = useState(false)
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
            {teacher ? "Selamat Datang, Ibu Ratna!" : "Hai, Aditya!"}{" "}
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
                value: "48",
                note: "12 konsultasi bulan ini",
                icon: MessagesSquare,
                color: "bg-secondary text-primary",
              },
              {
                title: "Permintaan Baru",
                value: "3",
                note: "Menunggu konfirmasi Anda",
                icon: Clock3,
                color: "bg-accent/15 text-[#a77820]",
              },
              {
                title: "Siswa Didampingi",
                value: "32",
                note: "Dari kelas X, XI, dan XII",
                icon: UsersRound,
                color: "bg-[#eaf0f5] text-[#497385]",
              },
            ]
          : [
              {
                title: "Total Konsultasi",
                value: "5",
                note: "Langkah baik untuk dirimu",
                icon: MessagesSquare,
                color: "bg-secondary text-primary",
              },
              {
                title: "Konsultasi Aktif",
                value: "1",
                note: "Guru BK siap mendengarkan",
                icon: MessageCircle,
                color: "bg-[#eaf0f5] text-[#497385]",
              },
              {
                title: "Konsultasi Selesai",
                value: "4",
                note: "Terima kasih sudah bercerita",
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
          ) : (
            <div className="px-5">
              {[
                {
                  title: "Tentang tugas dan ujian",
                  topic: "Akademik",
                  date: "30 Sep 2026",
                  status: "Berlangsung",
                },
                {
                  title: "Belajar lebih percaya diri",
                  topic: "Pribadi",
                  date: "24 Sep 2026",
                  status: "Selesai",
                },
                {
                  title: "Cerita tentang pertemanan",
                  topic: "Sosial",
                  date: "18 Sep 2026",
                  status: "Selesai",
                },
              ].map((item) => (
                <Link
                  to="/siswa/konsultasi"
                  key={item.title}
                  className="flex items-center gap-3 border-b border-border py-5 last:border-0 hover:bg-muted/50"
                >
                  <Avatar name="Ratna Sari" teacher />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold">{item.title}</h3>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      Ibu Ratna Sari <span className="mx-1">·</span>
                      {item.topic}
                    </p>
                    <p className="mt-1 text-[9px] text-muted-foreground sm:hidden">
                      {item.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <Status>{item.status}</Status>
                    <p className="mt-1.5 hidden text-[9px] text-muted-foreground sm:block">
                      {item.date}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-sm font-bold">Jadwal Mendatang</h2>
          <div className="mt-5 rounded-xl border border-primary/15 bg-secondary/35 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white px-3 py-2 text-center">
                <p className="text-[9px] font-semibold text-muted-foreground">
                  OKT
                </p>
                <p className="text-xl font-extrabold text-primary">01</p>
              </div>
              <div>
                <p className="text-xs font-bold">Kamis, 1 Oktober 2026</p>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Clock3 size={12} /> 09.00 – 09.30 WIB
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-primary/10 pt-4">
              <p className="text-xs font-semibold">
                {teacher
                  ? "Nadia Putri • XI IPS 1"
                  : "Konsultasi bersama Ibu Ratna"}
              </p>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                {teacher ? "Topik: Pribadi" : "Topik: Akademik"} • Percakapan
                online
              </p>
            </div>
            <div className="mt-4">
              <Status>Terjadwal</Status>
            </div>
          </div>
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

const seedMessages = [
  {
    id: 1,
    from: "teacher",
    text: "Hai, Aditya! Terima kasih sudah mau bercerita. Bagaimana perasaanmu hari ini?",
    time: "09.00",
  },
  {
    id: 2,
    from: "student",
    text: "Selamat pagi, Bu. Akhir-akhir ini saya merasa kewalahan dengan tugas sekolah dan persiapan ujian.",
    time: "09.02",
  },
  {
    id: 3,
    from: "teacher",
    text: "Terima kasih sudah jujur tentang perasaanmu. Merasa kewalahan itu wajar, apalagi ketika banyak hal datang bersamaan. Kamu tidak sendiri, ya.",
    time: "09.03",
  },
  {
    id: 4,
    from: "teacher",
    text: "Boleh cerita, bagian mana yang paling membuatmu kepikiran? Kita bahas satu per satu, pelan-pelan.",
    time: "09.03",
  },
  {
    id: 5,
    from: "student",
    text: "Saya takut nilai saya turun dan mengecewakan orang tua, Bu. Kadang jadi susah tidur karena terus memikirkannya.",
    time: "09.05",
  },
]
function Chat({ teacher = false }: { teacher?: boolean }) {
  const [messages, setMessages] = useState(seedMessages)
  const [text, setText] = useState("")
  const [ended, setEnded] = useState(false)
  const [confirm, setConfirm] = useState(false)
  useModal(confirm, () => setConfirm(false))
  const [notice, setNotice] = useState("")
  const ownRole = teacher ? "teacher" : "student"
  const participant = teacher ? "Aditya Pratama" : "Ratna Sari"
  const conversationRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (conversationRef.current)
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
  }, [messages, ended])
  function send(event: FormEvent) {
    event.preventDefault()
    if (!text.trim() || ended) return
    setMessages((items) => [
      ...items,
      {
        id: Date.now(),
        from: ownRole,
        text: text.trim(),
        time: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ])
    setText("")
  }
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">
            {teacher ? "Konsultasi Siswa" : "Konsultasi Saya"}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {teacher
              ? "Dampingi siswa dalam ruang percakapan yang aman."
              : "Ruang pribadi untuk cerita dan perasaanmu."}
          </p>
        </div>
        <Status>{ended ? "Selesai" : "Berlangsung"}</Status>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_260px]">
        <section className="flex h-[660px] max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-border bg-white">
          <header className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className="relative">
              <Avatar name={participant} teacher={!teacher} />
              <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold">
                {teacher ? "Aditya Pratama" : "Ibu Ratna Sari"}
              </h2>
              <p className="mt-1 text-[10px] text-[#12804f]">
                {teacher ? "XI IPA 2" : "Guru BK"} •{" "}
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
            className="flex-1 space-y-4 overflow-y-auto bg-[#fcfdfb] p-4 sm:p-6"
          >
            <p className="text-center text-[10px] text-muted-foreground">
              Rabu, 30 September 2026
            </p>
            <p className="mx-auto max-w-sm rounded-xl bg-secondary/70 px-4 py-2.5 text-center text-[9px] leading-5 text-[#517168]">
              Ceritamu ditangani dengan penuh kepedulian. Guru BK akan
              menjelaskan batas kerahasiaan jika keselamatanmu membutuhkan
              bantuan.
            </p>
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex gap-2.5 ${
                  item.from === ownRole ? "justify-end" : "justify-start"
                }`}
              >
                {item.from !== ownRole && (
                  <Avatar name={participant} teacher={!teacher} size="sm" />
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                    item.from === ownRole
                      ? "rounded-tr-sm bg-primary text-white"
                      : "rounded-tl-sm border border-border bg-white"
                  }`}
                >
                  <p className="text-[12px] leading-6">{item.text}</p>
                  <p
                    className={`mt-1.5 flex items-center justify-end gap-1 text-[9px] ${
                      item.from === ownRole
                        ? "text-white/75"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.time}
                    {item.from === ownRole && <CheckCheck size={12} />}
                  </p>
                </div>
              </div>
            ))}
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
              <Avatar name={participant} size="lg" teacher={!teacher} />
            </div>
            <h3 className="mt-4 text-sm font-bold">
              {teacher ? "Aditya Pratama" : "Ibu Ratna Sari, S.Pd."}
            </h3>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {teacher ? "Siswa • Kelas XI IPA 2" : "Guru Bimbingan Konseling"}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[10px] text-[#12804f]">
              <span className="size-1.5 rounded-full bg-primary" /> Tersedia
            </span>
            <div className="mt-5 border-t border-border pt-4 text-left text-[11px]">
              <p className="font-semibold">Tentang konsultasi</p>
              <p className="mt-3 text-muted-foreground">Topik: Akademik</p>
              <p className="mt-2 text-muted-foreground">
                Mulai: 30 September, 09.00 WIB
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
          <p className="px-2 text-[10px] leading-5 text-muted-foreground">
            Ini percakapan contoh. Pesan hanya tampil di pratinjau dan tidak
            dikirim ke guru BK.
          </p>
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
              menjadwalkan konsultasi baru kapan pun dibutuhkan.
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
                onClick={() => {
                  setEnded(true)
                  setConfirm(false)
                  setNotice(
                    "Terima kasih, Aditya. Semoga perasaanmu lebih baik hari ini.",
                  )
                }}
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
  const items = [
    {
      title: "Tentang tugas dan ujian",
      topic: "Akademik",
      date: "30 September 2026",
      status: "Berlangsung",
      name: "Aditya Pratama",
    },
    {
      title: "Belajar lebih percaya diri",
      topic: "Pribadi",
      date: "24 September 2026",
      status: "Selesai",
      name: "Aditya Pratama",
    },
    {
      title: "Cerita tentang pertemanan",
      topic: "Sosial",
      date: "18 September 2026",
      status: "Selesai",
      name: "Nadia Putri",
    },
    {
      title: "Menentukan tujuan belajar",
      topic: "Akademik",
      date: "12 September 2026",
      status: "Selesai",
      name: "Fajar Ramadhan",
    },
    {
      title: "Mengenali perasaan sendiri",
      topic: "Pribadi",
      date: "5 September 2026",
      status: "Selesai",
      name: "Salsa Amalia",
    },
  ].filter(
    (item) =>
      (filter === "Semua" || item.status === filter) &&
      `${item.title} ${item.topic} ${item.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
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
        {items.length ? (
          items.map((item) => (
            <div
              key={item.title}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-5"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <MessageCircle size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold">{item.title}</h2>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {teacher ? item.name : "Ibu Ratna Sari"} • {item.topic} •{" "}
                  {item.date}
                </p>
              </div>
              <Status>{item.status}</Status>
              {item.status === "Berlangsung" && (
                <Link
                  to={teacher ? "/guru/konsultasi" : "/siswa/konsultasi"}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#12804f]"
                >
                  Buka <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ))
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
            title: "Jadwal konsultasimu dikonfirmasi",
            text: "Ibu Ratna menerima jadwalmu pada Kamis, 1 Oktober 2026 pukul 09.00 WIB.",
            time: "15 menit yang lalu",
          },
          {
            icon: MessageCircle,
            title: "Ada pesan dari Ibu Ratna",
            text: "Terima kasih sudah bercerita hari ini, Aditya. Kita bahas pelan-pelan, ya.",
            time: "30 menit yang lalu",
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
            name={teacher ? "Ratna Sari" : "Aditya Pratama"}
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
              defaultValue={teacher ? "Ratna Sari" : "Aditya Pratama"}
              required
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold">
            Alamat email
            <input
              type="email"
              defaultValue={
                teacher ? "ratna@sekolah.sch.id" : "aditya@sekolah.sch.id"
              }
              required
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold">
            {teacher ? "Bidang" : "Kelas"}
            <input
              defaultValue={teacher ? "Bimbingan Konseling" : "XI IPA 2"}
              className={`${inputClass} mt-2`}
            />
          </label>
          <label className="text-xs font-semibold">
            Sekolah
            <input
              defaultValue="SMA Negeri 1"
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
  { path: "/sistem-desain", Component: DesignSystem },
  {
    path: "/siswa",
    element: <Shell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "konsultasi", Component: Chat },
      { path: "riwayat", element: <HistoryPage /> },
      { path: "notifikasi", Component: Notifications },
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
