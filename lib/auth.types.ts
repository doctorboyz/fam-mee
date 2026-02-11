import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    username?: string | null
    role?: string | null
    familyId?: string
    avatarUrl?: string | null
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username: string
      role: string
      familyId: string
      avatarUrl: string | null
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string
    username?: string | null
    role?: string | null
    familyId?: string
    avatarUrl?: string | null
  }
}
