'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Scene {
  id: string
  order: number
  text: string
  imageUrl: string | null
  voiceUrl: string | null
  duration: number | null
}

interface Project {
  id: string
  title: string
  genre: string
  script: string | null
  videoTitle: string | null
  description: string | null
  tags: string | null
  status: string
  scenes: Scene[]
}

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchProject()
    }
  }, [params.id])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/project/${params.id}`)
      const data = await res.json()
      if (data.project) {
        setProject(data.project)
      }
    } catch (error) {
      console.error('프로젝트 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateScenes = async () => {
    if (!project?.script) return
    setGenerating('scenes')

    try {
      const res = await fetch(`/api/project/${project.id}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: project.script }),
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('장면 생성 실패:', error)
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateVoice = async () => {
    setGenerating('voice')

    try {
      const res = await fetch(`/api/project/${project?.id}/voice`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('음성 생성 실패:', error)
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerateImages = async () => {
    setGenerating('images')

    try {
      const res = await fetch(`/api/project/${project?.id}/images`, {
        method: 'POST',
      })
      if (res.ok) {
        fetchProject()
      }
    } catch (error) {
      console.error('이미지 생성 실패:', error)
    } finally {
      setGenerating(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">프로젝트를 찾을 수 없습니다</div>
          <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-xl font-bold text-white">
              MONEY AI <span className="text-purple-400">STUDIO</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← 대시보드로
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* 프로젝트 정보 */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-sm px-2 py-1 bg-purple-600/20 text-purple-400 rounded">
                {project.genre}
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">
                {project.videoTitle || project.title}
              </h1>
            </div>
            <span
              className={`text-sm px-3 py-1 rounded-full ${
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

          {project.description && (
            <div className="mb-4">
              <h3 className="text-gray-400 text-sm mb-2">영상 설명</h3>
              <p className="text-gray-300 whitespace-pre-line">{project.description}</p>
            </div>
          )}

          {project.tags && (
            <div className="flex flex-wrap gap-2">
              {project.tags.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 작업 단계 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">1. 대본</h3>
              <span className="text-green-400 text-sm">완료</span>
            </div>
            <p className="text-gray-500 text-sm">
              {project.script ? `${project.script.length}자` : '없음'}
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">2. 장면 분할</h3>
              <span
                className={`text-sm ${
                  project.scenes.length > 0 ? 'text-green-400' : 'text-gray-500'
                }`}
              >
                {project.scenes.length > 0 ? '완료' : '대기'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {project.scenes.length > 0
                ? `${project.scenes.length}개 장면`
                : '장면 분할 필요'}
            </p>
            {project.scenes.length === 0 && (
              <button
                onClick={handleGenerateScenes}
                disabled={generating !== null}
                className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm py-2 rounded-lg"
              >
                {generating === 'scenes' ? '생성 중...' : '장면 분할하기'}
              </button>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">3. 음성 생성</h3>
              <span
                className={`text-sm ${
                  project.scenes.some((s) => s.voiceUrl)
                    ? 'text-green-400'
                    : 'text-gray-500'
                }`}
              >
                {project.scenes.some((s) => s.voiceUrl) ? '완료' : '대기'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">AI TTS 음성</p>
            {project.scenes.length > 0 && !project.scenes.some((s) => s.voiceUrl) && (
              <button
                onClick={handleGenerateVoice}
                disabled={generating !== null}
                className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm py-2 rounded-lg"
              >
                {generating === 'voice' ? '생성 중...' : '음성 생성하기'}
              </button>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-medium">4. 이미지 생성</h3>
              <span
                className={`text-sm ${
                  project.scenes.some((s) => s.imageUrl)
                    ? 'text-green-400'
                    : 'text-gray-500'
                }`}
              >
                {project.scenes.some((s) => s.imageUrl) ? '완료' : '대기'}
              </span>
            </div>
            <p className="text-gray-500 text-sm">AI 이미지</p>
            {project.scenes.length > 0 && !project.scenes.some((s) => s.imageUrl) && (
              <button
                onClick={handleGenerateImages}
                disabled={generating !== null}
                className="mt-2 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm py-2 rounded-lg"
              >
                {generating === 'images' ? '생성 중...' : '이미지 생성하기'}
              </button>
            )}
          </div>
        </div>

        {/* 장면 목록 */}
        {project.scenes.length > 0 && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">장면 목록</h2>
            <div className="space-y-4">
              {project.scenes.map((scene) => (
                <div
                  key={scene.id}
                  className="bg-gray-700 rounded-xl p-4 flex gap-4"
                >
                  <div className="w-32 h-20 bg-gray-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {scene.imageUrl ? (
                      <img
                        src={scene.imageUrl}
                        alt={`장면 ${scene.order}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 text-2xl">🖼️</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 text-sm font-medium">
                        장면 {scene.order}
                      </span>
                      {scene.voiceUrl && (
                        <span className="text-green-400 text-xs">🔊 음성</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{scene.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 대본 */}
        {project.script && (
          <div className="bg-gray-800 rounded-2xl p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">대본</h2>
            <pre className="text-gray-300 whitespace-pre-wrap font-sans text-sm">
              {project.script}
            </pre>
          </div>
        )}
      </main>
    </div>
  )
}
