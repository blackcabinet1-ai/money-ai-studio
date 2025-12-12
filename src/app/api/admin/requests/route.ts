import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const requests = await prisma.approvalRequest.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('승인 요청 조회 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
