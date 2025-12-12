# MONEY AI STUDIO

AI를 활용한 유튜브 영상 제작 올인원 플랫폼

## 주요 기능

- **AI 대본 생성**: 장르와 주제만 입력하면 전문 대본 자동 생성
- **제목/설명/태그 생성**: SEO에 최적화된 메타데이터 자동 생성
- **AI 이미지 생성**: 장면에 맞는 이미지 생성
- **AI 음성 생성**: TTS 음성 생성
- **사용자 관리**: 구글 로그인 + 초대 코드 시스템
- **API 키 관리**: 여러 Gemini API 키 자동 로테이션

## 설치 방법

### 1. 패키지 설치

```bash
cd money-ai-studio
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env`로 만들고 값을 입력하세요:

```bash
cp .env.example .env
```

필요한 환경 변수:

| 변수 | 설명 |
|------|------|
| DATABASE_URL | SQLite 데이터베이스 경로 |
| NEXTAUTH_URL | 웹사이트 URL (예: http://localhost:3000) |
| NEXTAUTH_SECRET | 랜덤 시크릿 키 |
| GOOGLE_CLIENT_ID | Google OAuth 클라이언트 ID |
| GOOGLE_CLIENT_SECRET | Google OAuth 시크릿 |
| ADMIN_EMAIL | 관리자 이메일 |

### 3. Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" → "Credentials" 이동
4. "Create Credentials" → "OAuth client ID" 선택
5. Application type: "Web application"
6. Authorized redirect URIs에 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발용)
   - `https://your-domain.com/api/auth/callback/google` (배포용)
7. 생성된 Client ID와 Client Secret을 `.env`에 입력

### 4. 데이터베이스 초기화

```bash
npx prisma generate
npx prisma db push
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 사용 방법

### 관리자 설정

1. 관리자 이메일(ADMIN_EMAIL)로 처음 로그인하면 자동으로 관리자 권한 부여
2. `/admin` 페이지에서:
   - Gemini API 키 등록 (여러 개 등록 가능, 자동 로테이션)
   - 사용자 가입 요청 승인/거절

### 새 사용자 가입 흐름

1. 사용자가 구글로 로그인 시도
2. 관리자에게 승인 요청 이메일 발송
3. 관리자가 승인하면 사용자에게 초대 코드 이메일 발송
4. 사용자가 초대 코드 입력 후 서비스 이용

### 영상 제작 흐름

1. 새 프로젝트 생성 → 장르와 주제 선택
2. AI가 대본 생성
3. 대본 확인 및 수정
4. AI가 제목, 설명, 태그 생성
5. 장면 분할 → 이미지/음성 생성
6. 최종 영상 합성 (준비 중)

## 배포

### Vercel 배포 (권장)

1. [Vercel](https://vercel.com)에 GitHub 레포지토리 연결
2. 환경 변수 설정
3. 배포

## 기술 스택

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (Prisma ORM)
- **Authentication**: NextAuth.js
- **AI**: Google Gemini API
