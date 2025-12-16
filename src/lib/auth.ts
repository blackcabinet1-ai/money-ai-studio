import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false

      try {
        // 기존 사용자 확인
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (existingUser) {
          return true
        }

        // 관리자인 경우
        if (user.email === process.env.ADMIN_EMAIL) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'admin',
            },
          })
          return true
        }

        // 새 사용자 생성 (pending 상태)
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'pending',
          },
        })

        return true
      } catch (error) {
        console.error('SignIn error:', error)
        return true // 에러가 나도 일단 로그인 허용
      }
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('JWT error:', error)
        }
      }
      return token
    },
     async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id
        (session.user as any).role = (token as any).role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
    cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },
  session: {
    strategy: 'jwt',
  },
}
