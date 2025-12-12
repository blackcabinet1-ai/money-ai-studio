import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { sendApprovalRequestEmail } from './email'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      // 관리자는 항상 허용
      if (user.email === process.env.ADMIN_EMAIL) {
        // 관리자 역할 설정
        await prisma.user.upsert({
          where: { email: user.email },
          update: { role: 'admin' },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            role: 'admin',
          },
        })
        return true
      }

      // 기존 사용자 확인
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      })

      if (existingUser) {
        // 승인된 사용자만 로그인 허용
        if (existingUser.role === 'approved' || existingUser.role === 'admin') {
          return true
        }
        // 대기 중인 사용자는 대기 페이지로
        return '/pending'
      }

      // 새 사용자: 승인 요청 생성
      await prisma.approvalRequest.upsert({
        where: { email: user.email },
        update: { name: user.name, status: 'pending' },
        create: {
          email: user.email,
          name: user.name,
          status: 'pending',
        },
      })

      // 관리자에게 이메일 발송
      await sendApprovalRequestEmail(user.email, user.name || '익명')

      // 대기 중인 사용자로 생성
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          image: user.image,
          role: 'pending',
        },
      })

      return '/pending'
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        })
        if (dbUser) {
          (session.user as any).id = dbUser.id
          ;(session.user as any).role = dbUser.role
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 대기 페이지로 리다이렉트
      if (url === '/pending') {
        return `${baseUrl}/pending`
      }
      // 기본 리다이렉트
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'database',
  },
}
