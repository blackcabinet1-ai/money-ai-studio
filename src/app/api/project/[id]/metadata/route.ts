import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateTitle, generateDescription, generateTags } from '@/lib/gemini'

// 메타데이터 생성 (제목, 설명, 태그)
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

    const { script, genre } = await req.json()

    if (!script) {
      return NextResponse.json({ error: '대본이 필요합니다.' }, { status: 400 })
    }

    // 병렬로 제목, 설명, 태그 생성
    const [titles, description, tags] = await Promise.all([
      generateTitle(script, genre),
      generateDescription(script, '', genre),
      generateTags(script, '', genre),
    ])

    return NextResponse.json({
      titles,
      description,
      tags,
    })
  } catch (error: any) {
    console.error('메타데이터 생성 오류:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
