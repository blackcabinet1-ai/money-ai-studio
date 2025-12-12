import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// TTS 음성 생성 (브라우저 Web Speech API 사용 또는 Google TTS)
// 여기서는 프론트엔드에서 Web Speech API를 사용하도록 안내
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 프로젝트의 장면들 가져오기
    const scenes = await prisma.scene.findMany({
      where: { projectId: id },
      orderBy: { order: 'asc' },
    })

    if (scenes.length === 0) {
      return NextResponse.json({ error: '먼저 장면을 생성해주세요.' }, { status: 400 })
    }

    // 음성 생성은 프론트엔드에서 Web Speech API를 사용하거나
    // 외부 TTS 서비스를 연동해야 합니다.
    // 여기서는 음성 URL 필드만 업데이트할 준비를 합니다.

    return NextResponse.json({
      message: '음성 생성은 프론트엔드에서 Web Speech API를 사용합니다.',
      scenes: scenes.map((s) => ({
        id: s.id,
        text: s.text,
        order: s.order,
      })),
    })
  } catch (error: any) {
    console.error('음성 생성 오류:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
