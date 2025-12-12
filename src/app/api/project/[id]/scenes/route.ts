import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateSceneImagePrompts } from '@/lib/gemini'

// 장면 분할 생성
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

    const { script } = await req.json()

    if (!script) {
      return NextResponse.json({ error: '대본이 필요합니다.' }, { status: 400 })
    }

    // 기존 장면 삭제
    await prisma.scene.deleteMany({
      where: { projectId: id },
    })

    // AI로 장면 분할
    const sceneData = await generateSceneImagePrompts(script)

    // 장면 생성
    const scenes = await Promise.all(
      sceneData.map((scene, index) =>
        prisma.scene.create({
          data: {
            projectId: id,
            order: scene.scene || index + 1,
            text: scene.text,
            // imagePrompt는 나중에 이미지 생성할 때 사용
          },
        })
      )
    )

    return NextResponse.json({ scenes })
  } catch (error: any) {
    console.error('장면 생성 오류:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
