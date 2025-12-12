'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  genre: string
  status: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      const role = (session.user as any).role
      if (role === 'pending') {
        router.push('/pending')
      } else {
        fetchProjects()
      }
    }
  }, [session, status, router])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/project')
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    )
  }

  const isAdmin = (session?.user as any)?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              MONEY AI <span className="text-purple-400">STUDIO</span>
            </h1>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  관리자
                </Link>
              )}
              <span className="text-gray-400">{session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 새 프로젝트 버튼 */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">내 프로젝트</h2>
          <Link
            href="/project/new"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="text-xl">+</span> 새 프로젝트
          </Link>
        </div>

        {/* 프로젝트 목록 */}
        {projects.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              아직 프로젝트가 없습니다
            </h3>
            <p className="text-gray-400 mb-6">
              새 프로젝트를 만들어 AI 영상 제작을 시작하세요
            </p>
            <Link
              href="/project/new"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              첫 프로젝트 만들기
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-purple-500"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-sm px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                    {project.genre}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      project.status === 'completed'
                        ? 'bg-green-600/20 text-green-400'
                        : project.status === 'processing'
                        ? 'bg-yellow-600/20 text-yellow-400'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {project.status === 'completed'
                      ? '완료'
                      : project.status === 'processing'
                      ? '처리중'
                      : '초안'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {project.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {new Date(project.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
