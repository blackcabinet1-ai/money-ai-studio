import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        message: '먼저 구글로 로그인해주세요.'
      }, { status: 401 })
    }

    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({
        success: false,
        message: '초대 코드를 입력해주세요.'
      }, { status: 400 })
    }

    // 초대 코드 확인
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
        inviteCode: code.toUpperCase(),
      },
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        message: '잘못된 초대 코드입니다.'
      }, { status: 400 })
    }

    // 사용자 상태를 approved로 변경
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'approved' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('초대 코드 확인 오류:', error)
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}
