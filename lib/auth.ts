import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.users.findFirst({
          where: {
            username: credentials.username as string,
            deleted_at: null,
          },
        })

        if (!user || !user.password_hash) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )

        if (!isPasswordValid) {
          return null
        }

        // Return user object that matches NextAuth User type
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email ?? undefined,
          username: user.username ?? undefined,
          role: user.role ?? undefined,
          familyId: user.family_id.toString(),
          avatarUrl: user.avatar_url ?? undefined,
        }
      }
    })
  ],
})
