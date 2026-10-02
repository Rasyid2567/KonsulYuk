import pkg from "@prisma/client"
const { PrismaClient, Role, UserStatus, ConsultationStatus, ConsultationType } = pkg
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Menghapus data lama...")
  await prisma.auditLog.deleteMany()
  await prisma.systemSetting.deleteMany()
  await prisma.message.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.consultation.deleteMany()
  await prisma.teacherSchedule.deleteMany()
  await prisma.user.deleteMany()

  const defaultPassword = await bcrypt.hash("password123", 10)

  console.log("👩‍🏫 Menambahkan akun Guru BK...")
  const guruRatna = await prisma.user.create({
    data: {
      email: "ratna@konsulyuk.id",
      name: "Ibu Ratna Sari, S.Pd., Kons.",
      passwordHash: defaultPassword,
      role: Role.GURU,
      phone: "0812-3456-7890",
      bio: "Guru Bimbingan Konseling fokus pada pengembangan karakter, motivasi belajar, dan pendampingan emosi remaja.",
    },
  })

  const guruDimas = await prisma.user.create({
    data: {
      email: "dimas@konsulyuk.id",
      name: "Bapak Dimas Saputra, M.Pd.",
      passwordHash: defaultPassword,
      role: Role.GURU,
      phone: "0813-9876-5432",
      bio: "Guru Bimbingan Konseling spesialisasi perencanaan karir, pemilihan jurusan kuliah, dan dinamika sosial pertemanan.",
    },
  })

  console.log("🎒 Menambahkan akun Siswa...")
  const siswaAditya = await prisma.user.create({
    data: {
      email: "aditya@siswa.id",
      name: "Aditya Pratama",
      passwordHash: defaultPassword,
      role: Role.SISWA,
      kelas: "XI IPA 2",
      nisn: "0052134567",
      phone: "0857-1122-3344",
      bio: "Siswa kelas XI IPA 2 yang sedang fokus meningkatkan nilai dan manajemen stres belajar.",
    },
  })

  const siswaNadia = await prisma.user.create({
    data: {
      email: "nadia@siswa.id",
      name: "Nadia Putri",
      passwordHash: defaultPassword,
      role: Role.SISWA,
      kelas: "XI IPS 1",
      nisn: "0052134568",
      phone: "0858-2233-4455",
    },
  })

  const siswaFajar = await prisma.user.create({
    data: {
      email: "fajar@siswa.id",
      name: "Fajar Ramadhan",
      passwordHash: defaultPassword,
      role: Role.SISWA,
      kelas: "X IPA 3",
      nisn: "0062134569",
      phone: "0859-3344-5566",
    },
  })

  const siswaSalsa = await prisma.user.create({
    data: {
      email: "salsa@siswa.id",
      name: "Salsa Amalia",
      passwordHash: defaultPassword,
      role: Role.SISWA,
      kelas: "XII IPA 1",
      nisn: "0042134570",
      phone: "0856-4455-6677",
    },
  })

  console.log("📅 Menambahkan Jadwal Guru BK...")
  const schedules = [
    { teacherId: guruRatna.id, day: "Senin", timeSlot: "08.00 – 09.30" },
    { teacherId: guruRatna.id, day: "Senin", timeSlot: "10.00 – 11.30" },
    { teacherId: guruRatna.id, day: "Rabu", timeSlot: "09.00 – 10.30" },
    { teacherId: guruRatna.id, day: "Kamis", timeSlot: "13.00 – 14.30" },
    { teacherId: guruDimas.id, day: "Selasa", timeSlot: "08.30 – 10.00" },
    { teacherId: guruDimas.id, day: "Kamis", timeSlot: "10.00 – 11.30" },
    { teacherId: guruDimas.id, day: "Jumat", timeSlot: "08.00 – 09.30" },
  ]
  for (const s of schedules) {
    await prisma.teacherSchedule.create({ data: s })
  }

  console.log("💬 Menambahkan Konsultasi Aktif & Riwayat...")
  const konsultasiAditya = await prisma.consultation.create({
    data: {
      studentId: siswaAditya.id,
      teacherId: guruRatna.id,
      topic: "Akademik & Kecemasan Nilai",
      type: ConsultationType.CHAT,
      status: ConsultationStatus.DITERIMA,
      scheduledDate: "2026-09-30",
      scheduledTime: "09.00 – 09.30",
      studentNotes: "Merasa cemas karena nilai ujian beberapa minggu terakhir menurun.",
      notes: "Siswa menunjukkan tanda kecemasan performa akademik. Diberikan teknik grounding dan tips relaksasi belajar.",
    },
  })

  const chatSeed = [
    {
      consultationId: konsultasiAditya.id,
      senderId: guruRatna.id,
      senderRole: "teacher",
      text: "Halo Aditya! Terima kasih sudah menghubungi ruang BK. Tenang saja, semua yang kamu ceritakan di sini bersifat rahasia dan aman. Apa yang lagi kamu rasakan belakangan ini?",
    },
    {
      consultationId: konsultasiAditya.id,
      senderId: siswaAditya.id,
      senderRole: "student",
      text: "Halo Bu Ratna. Terima kasih banyak. Akhir-akhir ini saya merasa sangat cemas karena nilai try out menurun dan tugas sekolah terasa menumpuk sekali.",
    },
    {
      consultationId: konsultasiAditya.id,
      senderId: guruRatna.id,
      senderRole: "teacher",
      text: "Wajar sekali kalau kamu merasa kewalahan di fase kelas XI ini. Sangat baik kamu berani membagikan ini ke Ibu. Apakah kecemasan ini sampai mengganggu istirahat tidurmu?",
    },
    {
      consultationId: konsultasiAditya.id,
      senderId: guruRatna.id,
      senderRole: "teacher",
      text: "Boleh cerita, bagian mana yang paling membuatmu kepikiran? Kita bahas satu per satu, pelan-pelan ya.",
    },
    {
      consultationId: konsultasiAditya.id,
      senderId: siswaAditya.id,
      senderRole: "student",
      text: "Saya takut nilai saya turun dan mengecewakan orang tua, Bu. Kadang jadi susah tidur karena terus memikirkannya.",
    },
  ]

  for (const msg of chatSeed) {
    await prisma.message.create({ data: msg })
  }

  // Pending consultation requests for Ibu Ratna
  await prisma.consultation.create({
    data: {
      studentId: siswaNadia.id,
      teacherId: guruRatna.id,
      topic: "Pribadi",
      type: ConsultationType.CHAT,
      status: ConsultationStatus.MENUNGGU,
      scheduledDate: "2026-09-30",
      scheduledTime: "10.00 – 10.30",
      studentNotes: "Ingin cerita masalah keluarga yang mempengaruhi fokus belajar.",
    },
  })

  await prisma.consultation.create({
    data: {
      studentId: siswaFajar.id,
      teacherId: guruRatna.id,
      topic: "Akademik",
      type: ConsultationType.CHAT,
      status: ConsultationStatus.MENUNGGU,
      scheduledDate: "2026-10-01",
      scheduledTime: "08.00 – 08.30",
      studentNotes: "Kesulitan mengikuti materi Matematika Peminatan.",
    },
  })

  await prisma.consultation.create({
    data: {
      studentId: siswaSalsa.id,
      teacherId: guruRatna.id,
      topic: "Sosial & Pertemanan",
      type: ConsultationType.CHAT,
      status: ConsultationStatus.MENUNGGU,
      scheduledDate: "2026-10-01",
      scheduledTime: "13.00 – 13.30",
      studentNotes: "Ada konflik kesalahpahaman dengan teman sekelompok tugas akhir.",
    },
  })

  console.log("🔔 Menambahkan Notifikasi...")
  await prisma.notification.createMany({
    data: [
      {
        userId: siswaAditya.id,
        title: "Permintaan Konsultasi Diterima",
        message: "Ibu Ratna Sari telah menyetujui jadwal konsultasi Anda hari ini pukul 09.00 WIB.",
        type: "CONSULTATION",
        link: "/siswa/konsultasi",
      },
      {
        userId: siswaAditya.id,
        title: "Pengingat Sesi Konsultasi",
        message: "Sesi percakapan bimbingan telah dibuka. Klik untuk masuk ke ruang konsultasi.",
        type: "SCHEDULE",
        link: "/siswa/konsultasi",
      },
      {
        userId: guruRatna.id,
        title: "Permintaan Konsultasi Masuk",
        message: "Nadia Putri (XI IPS 1) mengajukan permohonan bimbingan konseling topik Pribadi.",
        type: "CONSULTATION",
        link: "/guru/permintaan",
      },
      {
        userId: guruRatna.id,
        title: "Pesan Baru dari Siswa",
        message: "Aditya Pratama mengirim balasan di ruang konsultasi aktif.",
        type: "MESSAGE",
        link: "/guru/konsultasi",
      },
    ],
  })

  console.log("🛡️ Menambahkan akun Operator / Administrator...")
  const operator = await prisma.user.create({
    data: {
      email: "operator@konsulyuk.id",
      name: "Budi Santoso, S.Kom. (Operator)",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      status: UserStatus ? UserStatus.AKTIF : "AKTIF",
      phone: "0811-2233-4455",
      bio: "Administrator & Operator Utama Sistem Bimbingan Konseling KonsulYuk!",
    },
  })

  console.log("⚙️ Menambahkan Pengaturan Sistem...")
  await prisma.systemSetting.createMany({
    data: [
      { key: "app_name", value: "KonsulYuk!", description: "Nama Aplikasi Layanan Konseling" },
      { key: "school_name", value: "SMA Negeri 1 Talun", description: "Nama Sekolah" },
      { key: "school_address", value: "Jl. Raya Talun No. 01, Kec. Talun, Kab. Blitar", description: "Alamat Sekolah" },
      { key: "contact_phone", value: "0812-3456-7890", description: "Kontak WhatsApp Resmi Sekolah" },
      { key: "contact_email", value: "bk@sman1talun.sch.id", description: "Email Layanan BK" },
      { key: "consultation_enabled", value: "true", description: "Status Penerimaan Konsultasi Baru" },
      {
        key: "operating_hours",
        value: JSON.stringify({
          start: "07:30",
          end: "15:00",
          days: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
        }),
        description: "Jam dan Hari Layanan Operasional",
      },
      {
        key: "categories",
        value: JSON.stringify([
          "Akademik & Belajar",
          "Karir & Kuliah",
          "Pribadi & Emosi",
          "Sosial & Pertemanan",
        ]),
        description: "Kategori Bimbingan Konseling",
      },
      { key: "max_consultations_per_student", value: "3", description: "Batas Konsultasi Aktif per Siswa" },
    ],
  })

  console.log("📋 Menambahkan Catatan Audit Awal...")
  await prisma.auditLog.createMany({
    data: [
      {
        userId: operator.id,
        action: "INISIALISASI_SISTEM",
        target: "Sistem KonsulYuk",
        details: "Inisialisasi database dan instalasi dashboard operator berhasil diselesaikan.",
        ipAddress: "127.0.0.1",
      },
      {
        userId: operator.id,
        action: "TAMBAH_GURU_BK",
        target: "Ibu Ratna Sari, S.Pd., Kons.",
        details: "Pendaftaran akun Guru BK baru berhasil diverifikasi.",
        ipAddress: "127.0.0.1",
      },
      {
        userId: operator.id,
        action: "TAMBAH_GURU_BK",
        target: "Bapak Dimas Saputra, M.Pd.",
        details: "Pendaftaran akun Guru BK baru berhasil diverifikasi.",
        ipAddress: "127.0.0.1",
      },
      {
        userId: operator.id,
        action: "UPDATE_PENGATURAN",
        target: "Pengaturan Konsultasi",
        details: "Mengaktifkan alur konsultasi dan konfigurasi jam layanan sekolah.",
        ipAddress: "127.0.0.1",
      },
    ],
  })

  console.log("✅ Seed database berhasil diselesaikan!")
  console.log("-----------------------------------------")
  console.log("Akun Demo Siap Digunakan:")
  console.log("1. Guru BK:  ratna@konsulyuk.id    / password123")
  console.log("2. Guru BK:  dimas@konsulyuk.id    / password123")
  console.log("3. Siswa:    aditya@siswa.id      / password123")
  console.log("4. Siswa:    nadia@siswa.id       / password123")
  console.log("5. Operator: operator@konsulyuk.id / password123 (Role ADMIN)")
  console.log("-----------------------------------------")
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
