import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateScript } from '@/lib/gemini'

// 프로젝트 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user.role !== 'admin' && user.role !== 'approved')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        genre: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('프로젝트 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 새 프로젝트 생성 + 대본 생성
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user.role !== 'admin' && user.role !== 'approved')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { genre, topic, duration } = await req.json()

    if (!genre || !topic) {
      return NextResponse.json({ error: '장르와 주제를 입력해주세요.' }, { status: 400 })
    }

    // AI 대본 생성
    const script = await generateScript(genre, topic, duration || 5)

    // 프로젝트 저장
    const project = await prisma.project.create({
      data: {
        title: topic.substring(0, 100),
        genre,
        script,
        userId: user.id,
      },
    })

    return NextResponse.json({ project })
  } catch (error: any) {
    console.error('프로젝트 생성 오류:', error)
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
