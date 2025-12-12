import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// 승인 요청 이메일 발송 (관리자에게)
export async function sendApprovalRequestEmail(userEmail: string, userName: string) {
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail) {
    console.error('관리자 이메일이 설정되지 않았습니다.')
    return
  }

  const approveUrl = `${process.env.NEXTAUTH_URL}/admin/approve?email=${encodeURIComponent(userEmail)}`

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: adminEmail,
      subject: `[MONEY AI STUDIO] 새로운 가입 승인 요청 - ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">새로운 가입 승인 요청</h2>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>이름:</strong> ${userName}</p>
            <p><strong>이메일:</strong> ${userEmail}</p>
            <p><strong>요청 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
          </div>
          <a href="${approveUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            관리자 페이지에서 승인하기
          </a>
          <p style="color: #6B7280; margin-top: 20px; font-size: 14px;">
            이 이메일은 MONEY AI STUDIO에서 자동으로 발송되었습니다.
          </p>
        </div>
      `,
    })
    console.log(`승인 요청 이메일 발송 완료: ${userEmail}`)
  } catch (error) {
    console.error('이메일 발송 실패:', error)
  }
}

// 초대 코드 발송 (승인된 사용자에게)
export async function sendInviteCodeEmail(userEmail: string, userName: string, inviteCode: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `[MONEY AI STUDIO] 가입이 승인되었습니다!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">가입 승인 완료!</h2>
          <p>안녕하세요 ${userName}님,</p>
          <p>MONEY AI STUDIO 가입이 승인되었습니다.</p>
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 10px;">초대 코드:</p>
            <p style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 2px;">${inviteCode}</p>
          </div>
          <p>위 초대 코드를 입력하시면 서비스를 이용하실 수 있습니다.</p>
          <a href="${process.env.NEXTAUTH_URL}/login" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            로그인하러 가기
          </a>
          <p style="color: #6B7280; margin-top: 20px; font-size: 14px;">
            이 이메일은 MONEY AI STUDIO에서 자동으로 발송되었습니다.
          </p>
        </div>
      `,
    })
    console.log(`초대 코드 이메일 발송 완료: ${userEmail}`)
  } catch (error) {
    console.error('이메일 발송 실패:', error)
  }
}
