import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
        token.familyId = (user as any).familyId
        token.avatarUrl = (user as any).avatarUrl
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = (token.username as string) || ''
        session.user.role = (token.role as string) || 'MEMBER'
        session.user.familyId = (token.familyId as string) || ''
        session.user.avatarUrl = (token.avatarUrl as string) || null
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true, // Enable debug for troubleshooting
})
