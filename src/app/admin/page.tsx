'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ApprovalRequest {
  id: string
  email: string
  name: string
  status: string
  createdAt: string
}

interface GeminiKey {
  id: string
  name: string
  apiKey: string
  usageCount: number
  isActive: boolean
  lastUsedAt: string | null
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'users' | 'keys'>('users')
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [keys, setKeys] = useState<GeminiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyValue, setNewKeyValue] = useState('')
  const [showAddKey, setShowAddKey] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user) {
      const role = (session.user as any).role
      if (role !== 'admin') {
        router.push('/dashboard')
      } else {
        fetchData()
      }
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [reqRes, keyRes] = await Promise.all([
        fetch('/api/admin/requests'),
        fetch('/api/admin/keys'),
      ])
      const reqData = await reqRes.json()
      const keyData = await keyRes.json()
      setRequests(reqData.requests || [])
      setKeys(keyData.keys || [])
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (email: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'approve' }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('승인 실패:', error)
    }
  }

  const handleReject = async (email: string) => {
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'reject' }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('거절 실패:', error)
    }
  }

  const handleAddKey = async () => {
    if (!newKeyName || !newKeyValue) return

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName, apiKey: newKeyValue }),
      })
      if (res.ok) {
        setNewKeyName('')
        setNewKeyValue('')
        setShowAddKey(false)
        fetchData()
      }
    } catch (error) {
      console.error('키 추가 실패:', error)
    }
  }

  const handleToggleKey = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('키 상태 변경 실패:', error)
    }
  }

  const handleDeleteKey = async (id: string) => {
    if (!confirm('정말 이 키를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('키 삭제 실패:', error)
    }
  }

  const handleResetUsage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/keys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageCount: 0 }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('사용량 초기화 실패:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">
              MONEY AI <span className="text-purple-400">STUDIO</span>
              <span className="text-gray-500 text-sm ml-2">관리자</span>
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                대시보드
              </Link>
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
        {/* 탭 */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('users')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              tab === 'users'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            사용자 승인 관리
          </button>
          <button
            onClick={() => setTab('keys')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              tab === 'keys'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Gemini API 키 관리
          </button>
        </div>

        {/* 사용자 승인 관리 */}
        {tab === 'users' && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">승인 대기 중인 요청</h2>
            {requests.filter((r) => r.status === 'pending').length === 0 ? (
              <p className="text-gray-400">대기 중인 요청이 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {requests
                  .filter((r) => r.status === 'pending')
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between bg-gray-700 rounded-xl p-4"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {request.name || '이름 없음'}
                        </p>
                        <p className="text-gray-400 text-sm">{request.email}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(request.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.email)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(request.email)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* API 키 관리 */}
        {tab === 'keys' && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Gemini API 키</h2>
              <button
                onClick={() => setShowAddKey(!showAddKey)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + 새 키 추가
              </button>
            </div>

            {/* 새 키 추가 폼 */}
            {showAddKey && (
              <div className="bg-gray-700 rounded-xl p-4 mb-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="키 이름 (예: 키1, 메인키)"
                    className="bg-gray-600 border border-gray-500 text-white rounded-lg p-3 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="text"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder="API 키 값"
                    className="bg-gray-600 border border-gray-500 text-white rounded-lg p-3 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddKey}
                    disabled={!newKeyName || !newKeyValue}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    추가
                  </button>
                  <button
                    onClick={() => setShowAddKey(false)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* 키 목록 */}
            {keys.length === 0 ? (
              <p className="text-gray-400">등록된 API 키가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className={`bg-gray-700 rounded-xl p-4 border-l-4 ${
                      key.isActive ? 'border-green-500' : 'border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{key.name}</p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              key.isActive
                                ? 'bg-green-600/20 text-green-400'
                                : 'bg-gray-600/20 text-gray-400'
                            }`}
                          >
                            {key.isActive ? '활성' : '비활성'}
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm font-mono">
                          {key.apiKey.substring(0, 10)}...
                          {key.apiKey.substring(key.apiKey.length - 4)}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          사용량: {key.usageCount}회
                          {key.lastUsedAt && (
                            <span className="text-gray-500 ml-2">
                              (마지막: {new Date(key.lastUsedAt).toLocaleString('ko-KR')})
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResetUsage(key.id)}
                          className="text-gray-400 hover:text-white px-3 py-1 rounded transition-colors text-sm"
                        >
                          초기화
                        </button>
                        <button
                          onClick={() => handleToggleKey(key.id, key.isActive)}
                          className={`px-3 py-1 rounded transition-colors text-sm ${
                            key.isActive
                              ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                              : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          }`}
                        >
                          {key.isActive ? '비활성화' : '활성화'}
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1 rounded transition-colors text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
              <p className="text-gray-400 text-sm">
                <strong className="text-white">키 로테이션 설명:</strong> 등록된 키들 중 사용량이
                가장 적은 키가 자동으로 선택됩니다. 무료 할당량 소진 시 다음 키로 자동 전환됩니다.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
