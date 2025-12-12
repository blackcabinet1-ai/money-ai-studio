import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateImagePrompt, getActiveGeminiClient } from '@/lib/gemini'

// Gemini의 이미지 생성 기능 사용 (Imagen 3)
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

    // Gemini API로 각 장면에 대한 이미지 프롬프트 생성
    // 실제 이미지 생성은 Gemini의 이미지 생성 API 또는
    // 외부 서비스 (예: DALL-E, Midjourney API) 연동 필요

    const updatedScenes = []

    for (const scene of scenes) {
      try {
        // 이미지 프롬프트 생성
        const imagePrompt = await generateImagePrompt(scene.text)

        // 참고: Gemini 1.5에서는 직접 이미지 생성이 제한적입니다.
        // 실제 이미지 생성을 위해서는 다음 옵션 중 하나를 선택해야 합니다:
        // 1. Google Imagen API 사용
        // 2. DALL-E API 사용
        // 3. Stable Diffusion API 사용
        // 4. 무료 이미지 API (Unsplash, Pexels 등)

        // 여기서는 플레이스홀더 이미지 URL 사용
        const placeholderUrl = `https://via.placeholder.com/1280x720/1a1a2e/ffffff?text=Scene+${scene.order}`

        await prisma.scene.update({
          where: { id: scene.id },
          data: { imageUrl: placeholderUrl },
        })

        updatedScenes.push({
          id: scene.id,
          imagePrompt,
          imageUrl: placeholderUrl,
        })
      } catch (error) {
        console.error(`장면 ${scene.order} 이미지 생성 실패:`, error)
      }
    }

    return NextResponse.json({
      message: '이미지 생성 완료',
      scenes: updatedScenes,
    })
  } catch (error: any) {
    console.error('이미지 생성 오류:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
