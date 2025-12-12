import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 프로젝트 상세 조회
export async function GET(
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

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        scenes: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json({ error: '프로젝트를 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('프로젝트 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 프로젝트 수정
export async function PATCH(
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

    const data = await req.json()

    const project = await prisma.project.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.script && { script: data.script }),
        ...(data.videoTitle && { videoTitle: data.videoTitle }),
        ...(data.description && { description: data.description }),
        ...(data.tags && { tags: data.tags }),
        ...(data.status && { status: data.status }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('프로젝트 수정 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 프로젝트 삭제
export async function DELETE(
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

    await prisma.project.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('프로젝트 삭제 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
