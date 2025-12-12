import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// API 키 목록 조회
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 확인
    if (session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const keys = await prisma.geminiKey.findMany({
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('API 키 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// 새 API 키 추가
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    // 관리자 확인
    if (session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const { name, apiKey } = await req.json()

    if (!name || !apiKey) {
      return NextResponse.json({ error: '이름과 API 키가 필요합니다.' }, { status: 400 })
    }

    const key = await prisma.geminiKey.create({
      data: {
        name,
        apiKey,
      },
    })

    return NextResponse.json({ key })
  } catch (error) {
    console.error('API 키 추가 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
