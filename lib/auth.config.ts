/* eslint-disable @typescript-eslint/no-explicit-any */
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: any; request: { nextUrl: any } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
        token.familyId = (user as any).familyId
        token.avatarUrl = (user as any).avatarUrl
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
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
  providers: [], // Providers meant for server-side are configured in auth.ts
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: true,
}
