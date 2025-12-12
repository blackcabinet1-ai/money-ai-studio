'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

const GENRES = [
  { id: 'education', name: '교육/정보', icon: '📚' },
  { id: 'news', name: '뉴스/시사', icon: '📰' },
  { id: 'story', name: '스토리/이야기', icon: '📖' },
  { id: 'review', name: '리뷰/추천', icon: '⭐' },
  { id: 'tech', name: '기술/IT', icon: '💻' },
  { id: 'finance', name: '재테크/경제', icon: '💰' },
  { id: 'health', name: '건강/운동', icon: '💪' },
  { id: 'entertainment', name: '엔터테인먼트', icon: '🎭' },
  { id: 'travel', name: '여행/문화', icon: '✈️' },
  { id: 'food', name: '음식/요리', icon: '🍳' },
]

export default function NewProjectPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 프로젝트 데이터
  const [selectedGenre, setSelectedGenre] = useState('')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(5)
  const [projectId, setProjectId] = useState('')

  // 생성된 콘텐츠
  const [script, setScript] = useState('')
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const handleCreateProject = async () => {
    if (!selectedGenre || !topic) {
      setError('장르와 주제를 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. 프로젝트 생성 및 대본 생성
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genre: selectedGenre,
          topic,
          duration,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '프로젝트 생성 실패')
      }

      setProjectId(data.project.id)
      setScript(data.project.script)
      setStep(2)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateMetadata = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/project/${projectId}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, genre: selectedGenre }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || '메타데이터 생성 실패')
      }

      setTitles(data.titles)
      setSelectedTitle(data.titles[0])
      setDescription(data.description)
      setTags(data.tags)
      setStep(3)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndContinue = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/project/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          videoTitle: selectedTitle,
          description,
          tags: tags.join(', '),
        }),
      })

      if (!res.ok) {
        throw new Error('저장 실패')
      }

      router.push(`/project/${projectId}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* 진행 단계 */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-20 h-1 ${
                    step > s ? 'bg-purple-600' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: 장르 및 주제 선택 */}
        {step === 1 && (
          <div className="bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              1단계: 장르와 주제 선택
            </h2>

            <div className="mb-8">
              <label className="block text-gray-300 mb-3">장르 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => setSelectedGenre(genre.id)}
                    className={`p-4 rounded-xl border transition-colors ${
                      selectedGenre === genre.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{genre.icon}</div>
                    <div className="text-sm text-gray-300">{genre.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-300 mb-3">
                영상 주제 (구체적으로 입력할수록 좋아요)
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 2024년 주식 시장 전망과 투자 전략 5가지"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-4 h-32 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="mb-8">
              <label className="block text-gray-300 mb-3">
                영상 길이: {duration}분
              </label>
              <input
                type="range"
                min="1"
                max="15"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-gray-500 text-sm mt-1">
                <span>1분</span>
                <span>15분</span>
              </div>
            </div>

            <button
              onClick={handleCreateProject}
              disabled={loading || !selectedGenre || !topic}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-4 rounded-xl transition-colors"
            >
              {loading ? '대본 생성 중...' : '대본 생성하기'}
            </button>
          </div>
        )}

        {/* Step 2: 대본 확인 및 수정 */}
        {step === 2 && (
          <div className="bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              2단계: 대본 확인 및 수정
            </h2>

            <div className="mb-6">
              <label className="block text-gray-300 mb-3">생성된 대본</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-4 h-96 focus:outline-none focus:border-purple-500 font-mono text-sm"
              />
              <p className="text-gray-500 text-sm mt-2">
                대본을 자유롭게 수정할 수 있습니다.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-4 rounded-xl transition-colors"
              >
                이전 단계
              </button>
              <button
                onClick={handleGenerateMetadata}
                disabled={loading || !script}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-4 rounded-xl transition-colors"
              >
                {loading ? '메타데이터 생성 중...' : '제목/설명/태그 생성'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 제목, 설명, 태그 */}
        {step === 3 && (
          <div className="bg-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              3단계: 제목, 설명, 태그 확인
            </h2>

            {/* 제목 선택 */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-3">제목 선택</label>
              <div className="space-y-2">
                {titles.map((title, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTitle(title)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      selectedTitle === title
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <span className="text-white">{title}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                placeholder="또는 직접 입력..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-4 mt-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* 설명 */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-3">영상 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-4 h-48 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* 태그 */}
            <div className="mb-8">
              <label className="block text-gray-300 mb-3">태그</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tags.join(', ')}
                onChange={(e) =>
                  setTags(e.target.value.split(',').map((t) => t.trim()))
                }
                placeholder="태그를 쉼표로 구분하여 입력"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-xl p-4 mt-3 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-4 rounded-xl transition-colors"
              >
                이전 단계
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-4 rounded-xl transition-colors"
              >
                {loading ? '저장 중...' : '저장하고 계속하기'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
