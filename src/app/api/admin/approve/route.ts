import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInviteCodeEmail } from '@/lib/email'
import { v4 as uuidv4 } from 'uuid'

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

    const { email, action } = await req.json()

    if (!email || !action) {
      return NextResponse.json({ error: '이메일과 액션이 필요합니다.' }, { status: 400 })
    }

    if (action === 'approve') {
      // 초대 코드 생성 (8자리 대문자)
      const inviteCode = uuidv4().substring(0, 8).toUpperCase()

      // 사용자 업데이트
      const user = await prisma.user.update({
        where: { email },
        data: {
          inviteCode,
          // role은 아직 pending - 코드 입력 후 approved로 변경
        },
      })

      // 승인 요청 상태 업데이트
      await prisma.approvalRequest.update({
        where: { email },
        data: { status: 'approved' },
      })

      // 초대 코드 이메일 발송
      await sendInviteCodeEmail(email, user.name || '사용자', inviteCode)

      return NextResponse.json({ success: true, inviteCode })
    } else if (action === 'reject') {
      // 승인 요청 삭제
      await prisma.approvalRequest.delete({
        where: { email },
      })

      // 사용자도 삭제
      await prisma.user.delete({
        where: { email },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '잘못된 액션입니다.' }, { status: 400 })
  } catch (error) {
    console.error('승인 처리 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
