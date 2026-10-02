function getApiBase(): string {
  // Mengambil URL API langsung dari .env (VITE_API_URL), fallback ke "/api" jika kosong
  return import.meta.env.VITE_API_URL || "/api"
}

const API_BASE = getApiBase()

export type UserStatus = "AKTIF" | "NONAKTIF" | "DITANGGUHKAN"

export interface User {
  id: string
  name: string
  email: string
  role: "SISWA" | "GURU" | "ADMIN"
  status?: UserStatus
  nip?: string | null
  kelas?: string | null
  phone?: string | null
  nisn?: string | null
  avatar?: string | null
  bio?: string | null
  createdAt?: string
  lastActiveAt?: string | null
  _count?: {
    studentConsultations?: number
    teacherConsultations?: number
    auditLogs?: number
  }
  schedules?: {
    id: string
    day: string
    timeSlot: string
    isAvailable: boolean
  }[]
}

export interface AuditLog {
  id: string
  userId?: string | null
  action: string
  target?: string | null
  details: string
  ipAddress?: string | null
  createdAt: string
  user?: {
    id: string
    name: string
    role: string
    email?: string
  } | null
}

export interface OperatorStats {
  stats: {
    totalStudents: number
    totalTeachers: number
    totalOperators: number
    totalConsultations: number
    statusBreakdown: {
      menunggu: number
      diterima: number
      selesai: number
      ditolak: number
      dibatalkan: number
    }
    chartData: {
      date: string
      label: string
      count: number
    }[]
  }
  recentActivities: AuditLog[]
  recentConsultations: Consultation[]
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Consultation {
  id: string
  studentId: string
  teacherId?: string | null
  topic: string
  type: "CHAT" | "TATAP_MUKA"
  status: "MENUNGGU" | "DITERIMA" | "DITOLAK" | "SELESAI" | "DIBATALKAN"
  scheduledDate: string
  scheduledTime: string
  studentNotes?: string | null
  notes?: string | null
  createdAt: string
  student?: {
    id: string
    name: string
    email: string
    kelas?: string | null
    phone?: string | null
  }
  teacher?: {
    id: string
    name: string
    email: string
  } | null
  messages?: Message[]
  _count?: { messages: number }
}

export interface Message {
  id: string
  consultationId: string
  senderId: string
  senderRole: "student" | "teacher"
  text: string
  createdAt: string
  sender?: {
    id: string
    name: string
    role: string
    avatar?: string | null
  }
}

export interface NotificationItem {
  id: string
  userId: string
  title: string
  message: string
  type: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export interface TeacherInfo {
  id: string
  name: string
  email: string
  phone?: string | null
  bio?: string | null
  avatar?: string | null
  schedules?: {
    id: string
    day: string
    timeSlot: string
    isAvailable: boolean
  }[]
}

export interface DashboardStats {
  totalKonsultasi?: number
  pendingRequests?: number
  activeConsultations?: number
  totalStudents?: number
  myConsultations?: number
  myActive?: number
  unreadNotifs?: number
}

export function getToken(): string | null {
  return localStorage.getItem("konsulyuk_token")
}

export function setToken(token: string) {
  localStorage.setItem("konsulyuk_token", token)
}

export function isRemembered(): boolean {
  return localStorage.getItem("konsulyuk_remember") !== "false"
}

export function setRemembered(remember: boolean) {
  localStorage.setItem("konsulyuk_remember", remember ? "true" : "false")
}

export function clearToken() {
  localStorage.removeItem("konsulyuk_token")
  localStorage.removeItem("konsulyuk_user")
  localStorage.removeItem("konsulyuk_remember")
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem("konsulyuk_user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setStoredUser(user: User) {
  localStorage.setItem("konsulyuk_user", JSON.stringify(user))
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers || {})
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json")
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Permintaan gagal dengan status ${res.status}`)
  }
  return data as T
}

export const api = {
  health: () => request<{ status: string; database: string }>("/health"),

  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const data = await request<{ message: string; token: string; user: User }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify(credentials),
        },
      )
      setToken(data.token)
      setStoredUser(data.user)
      return data
    },

    register: async (payload: {
      name: string
      email: string
      password: string
      role?: "SISWA" | "GURU"
      kelas?: string
      phone?: string
      nisn?: string
    }) => {
      const data = await request<{ message: string; token: string; user: User }>(
        "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      )
      setToken(data.token)
      setStoredUser(data.user)
      return data
    },

    me: async () => {
      const data = await request<{ user: User }>("/auth/me")
      setStoredUser(data.user)
      return data.user
    },

    getTeachers: async () => {
      const data = await request<{ teachers: TeacherInfo[] }>("/auth/teachers")
      return data.teachers
    },

    logout: () => {
      clearToken()
    },
  },

  consultations: {
    list: async () => {
      const data = await request<{ consultations: Consultation[] }>("/consultations")
      return data.consultations
    },

    getById: async (id: string) => {
      const data = await request<{ consultation: Consultation }>(`/consultations/${id}`)
      return data.consultation
    },

    create: async (payload: {
      teacherId?: string
      topic: string
      type?: "CHAT" | "TATAP_MUKA"
      scheduledDate: string
      scheduledTime: string
      studentNotes?: string
    }) => {
      const data = await request<{ message: string; consultation: Consultation }>(
        "/consultations",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      )
      return data.consultation
    },

    updateStatus: async (
      id: string,
      status: "DITERIMA" | "DITOLAK" | "SELESAI" | "DIBATALKAN",
      notes?: string,
    ) => {
      const data = await request<{ message: string; consultation: Consultation }>(
        `/consultations/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status, notes }),
        },
      )
      return data.consultation
    },
  },

  messages: {
    list: async (consultationId: string) => {
      const data = await request<{ messages: Message[] }>(
        `/consultations/${consultationId}/messages`,
      )
      return data.messages
    },

    send: async (consultationId: string, text: string) => {
      const data = await request<{ message: Message }>(
        `/consultations/${consultationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
        },
      )
      return data.message
    },
  },

  notifications: {
    list: async () => {
      const data = await request<{ notifications: NotificationItem[]; unreadCount: number }>(
        "/notifications",
      )
      return data
    },

    markRead: async (id: string) => {
      return request<{ success: boolean }>(`/notifications/${id}/read`, {
        method: "PATCH",
      })
    },

    markAllRead: async () => {
      return request<{ success: boolean }>("/notifications/read-all", {
        method: "POST",
      })
    },
  },

  users: {
    getStats: async () => {
      const data = await request<{ stats: DashboardStats }>("/users/stats")
      return data.stats
    },

    getStudents: async () => {
      const data = await request<{ students: User[] }>("/users/students")
      return data.students
    },

    updateProfile: async (payload: {
      name?: string
      phone?: string
      bio?: string
      kelas?: string
      nisn?: string
    }) => {
      const data = await request<{ message: string; user: User }>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      setStoredUser(data.user)
      return data.user
    },
  },

  operator: {
    stats: async (range: string = "7d") => {
      return request<OperatorStats>(`/operator/stats?range=${encodeURIComponent(range)}`)
    },

    students: {
      list: async (params: {
        page?: number
        limit?: number
        search?: string
        kelas?: string
        status?: string
      } = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.set("page", String(params.page))
        if (params.limit) query.set("limit", String(params.limit))
        if (params.search) query.set("search", params.search)
        if (params.kelas) query.set("kelas", params.kelas)
        if (params.status) query.set("status", params.status)
        return request<{
          students: User[]
          pagination: PaginationMeta
          kelasOptions: string[]
        }>(`/operator/students?${query.toString()}`)
      },

      create: async (payload: {
        name: string
        email: string
        password?: string
        kelas?: string
        phone?: string
        nisn?: string
      }) => {
        return request<{ message: string; student: User }>("/operator/students", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      },

      update: async (
        id: string,
        payload: {
          name?: string
          email?: string
          kelas?: string
          phone?: string
          nisn?: string
          status?: UserStatus
          password?: string
        },
      ) => {
        return request<{ message: string; student: User }>(`/operator/students/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      },
    },

    teachers: {
      list: async (params: {
        page?: number
        limit?: number
        search?: string
        status?: string
      } = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.set("page", String(params.page))
        if (params.limit) query.set("limit", String(params.limit))
        if (params.search) query.set("search", params.search)
        if (params.status) query.set("status", params.status)
        return request<{
          teachers: (User & { totalConsultations: number; activeConsultations: number })[]
          pagination: PaginationMeta
        }>(`/operator/teachers?${query.toString()}`)
      },

      create: async (payload: {
        name: string
        email: string
        password?: string
        nip?: string
        phone?: string
        bio?: string
        schedules?: { day: string; timeSlot: string; isAvailable: boolean }[]
      }) => {
        return request<{ message: string; teacher: User }>("/operator/teachers", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      },

      update: async (
        id: string,
        payload: {
          name?: string
          email?: string
          nip?: string
          phone?: string
          bio?: string
          status?: UserStatus
          password?: string
          schedules?: { day: string; timeSlot: string; isAvailable: boolean }[]
        },
      ) => {
        return request<{ message: string; teacher: User }>(`/operator/teachers/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      },
    },

    operators: {
      list: async (params: { page?: number; limit?: number; search?: string } = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.set("page", String(params.page))
        if (params.limit) query.set("limit", String(params.limit))
        if (params.search) query.set("search", params.search)
        return request<{
          operators: User[]
          pagination: PaginationMeta
        }>(`/operator/operators?${query.toString()}`)
      },

      create: async (payload: {
        name: string
        email: string
        password?: string
        phone?: string
      }) => {
        return request<{ message: string; operator: User }>("/operator/operators", {
          method: "POST",
          body: JSON.stringify(payload),
        })
      },

      update: async (
        id: string,
        payload: {
          name?: string
          email?: string
          phone?: string
          status?: UserStatus
          password?: string
        },
      ) => {
        return request<{ message: string; operator: User }>(`/operator/operators/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      },
    },

    consultations: {
      list: async (params: {
        page?: number
        limit?: number
        search?: string
        status?: string
        teacherId?: string
        startDate?: string
        endDate?: string
      } = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.set("page", String(params.page))
        if (params.limit) query.set("limit", String(params.limit))
        if (params.search) query.set("search", params.search)
        if (params.status) query.set("status", params.status)
        if (params.teacherId) query.set("teacherId", params.teacherId)
        if (params.startDate) query.set("startDate", params.startDate)
        if (params.endDate) query.set("endDate", params.endDate)
        return request<{
          consultations: Consultation[]
          pagination: PaginationMeta
        }>(`/operator/consultations?${query.toString()}`)
      },

      update: async (
        id: string,
        payload: {
          status?: string
          teacherId?: string
          scheduledDate?: string
          scheduledTime?: string
          notes?: string
          reason?: string
        },
      ) => {
        return request<{ message: string; consultation: Consultation }>(
          `/operator/consultations/${id}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        )
      },
    },

    auditLogs: {
      list: async (params: {
        page?: number
        limit?: number
        search?: string
        action?: string
        startDate?: string
        endDate?: string
      } = {}) => {
        const query = new URLSearchParams()
        if (params.page) query.set("page", String(params.page))
        if (params.limit) query.set("limit", String(params.limit))
        if (params.search) query.set("search", params.search)
        if (params.action) query.set("action", params.action)
        if (params.startDate) query.set("startDate", params.startDate)
        if (params.endDate) query.set("endDate", params.endDate)
        return request<{
          auditLogs: AuditLog[]
          pagination: PaginationMeta
          actionTypes: string[]
        }>(`/operator/audit-logs?${query.toString()}`)
      },
    },

    settings: {
      get: async () => {
        return request<{ settings: Record<string, string> }>("/operator/settings")
      },

      update: async (settings: Record<string, string>) => {
        return request<{ message: string; settings: Record<string, string> }>(
          "/operator/settings",
          {
            method: "PATCH",
            body: JSON.stringify({ settings }),
          },
        )
      },
    },

    profile: {
      get: async () => {
        return request<{ user: User }>("/operator/profile")
      },

      update: async (payload: {
        name?: string
        phone?: string
        bio?: string
        avatar?: string
        currentPassword?: string
        newPassword?: string
      }) => {
        const data = await request<{ message: string; user: User }>("/operator/profile", {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        if (data.user) {
          setStoredUser(data.user)
        }
        return data
      },
    },
  },
}
