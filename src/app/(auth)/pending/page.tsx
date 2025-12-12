'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PendingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role
      if (role === 'admin' || role === 'approved') {
        router.push('/dashboard')
      }
    }
  }, [session, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 w-full max-w-md text-center">
        <Link href="/" className="block mb-8">
          <h1 className="text-2xl font-bold text-white">
            MONEY AI <span className="text-purple-400">STUDIO</span>
          </h1>
        </Link>

        <div className="text-6xl mb-6">⏳</div>

        <h2 className="text-2xl font-bold text-white mb-4">승인 대기 중</h2>

        <p className="text-gray-300 mb-6">
          가입 요청이 관리자에게 전송되었습니다.<br />
          승인이 완료되면 이메일로 초대 코드를 받게 됩니다.
        </p>

        {session?.user?.email && (
          <p className="text-gray-500 text-sm mb-6">
            요청 이메일: {session.user.email}
          </p>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.refresh()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            상태 새로고침
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full border border-white/20 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </main>
  )
}
