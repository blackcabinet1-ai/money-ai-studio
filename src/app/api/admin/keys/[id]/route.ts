import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// API 키 수정
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

    // 관리자 확인
    if (session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    const data = await req.json()

    const key = await prisma.geminiKey.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.usageCount !== undefined && { usageCount: data.usageCount }),
      },
    })

    return NextResponse.json({ key })
  } catch (error) {
    console.error('API 키 수정 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

// API 키 삭제
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

    // 관리자 확인
    if (session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    await prisma.geminiKey.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API 키 삭제 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
