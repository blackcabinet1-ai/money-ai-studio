import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from './prisma'

// Gemini API 키 로테이션 관리
export async function getActiveGeminiClient() {
  // 활성화된 키들을 가져옴 (사용량이 적은 순서)
  const keys = await prisma.geminiKey.findMany({
    where: { isActive: true },
    orderBy: { usageCount: 'asc' }
  })

  if (keys.length === 0) {
    throw new Error('사용 가능한 Gemini API 키가 없습니다. 관리자 페이지에서 키를 추가해주세요.')
  }

  // 가장 사용량이 적은 키 선택
  const selectedKey = keys[0]

  // 사용 횟수 증가
  await prisma.geminiKey.update({
    where: { id: selectedKey.id },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date()
    }
  })

  const genAI = new GoogleGenerativeAI(selectedKey.apiKey)

  return {
    client: genAI,
    keyId: selectedKey.id,
    keyName: selectedKey.name
  }
}

// 텍스트 생성 (대본, 제목, 설명, 태그 등)
export async function generateText(prompt: string): Promise<string> {
  const { client } = await getActiveGeminiClient()
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

// 이미지 생성을 위한 프롬프트 생성
export async function generateImagePrompt(description: string): Promise<string> {
  const prompt = `다음 설명을 바탕으로 AI 이미지 생성에 최적화된 영어 프롬프트를 만들어주세요.
프롬프트만 출력하고 다른 설명은 하지 마세요.

설명: ${description}`

  return await generateText(prompt)
}

// 대본 생성
export async function generateScript(genre: string, topic: string, duration: number): Promise<string> {
  const prompt = `당신은 유튜브 영상 대본 작가입니다.

장르: ${genre}
주제: ${topic}
목표 길이: 약 ${duration}분 분량

다음 조건을 만족하는 대본을 작성해주세요:
1. 시청자의 관심을 끄는 인트로
2. 핵심 내용을 명확하게 전달
3. 자연스러운 전환
4. 기억에 남는 마무리
5. 구어체로 작성 (실제 말하는 것처럼)

각 장면을 [장면 1], [장면 2] 형식으로 구분해주세요.
각 장면에는 나레이션 텍스트와 (이미지 설명: ~) 형태로 배경 이미지 설명을 포함해주세요.`

  return await generateText(prompt)
}

// 제목 생성
export async function generateTitle(script: string, genre: string): Promise<string[]> {
  const prompt = `다음 대본을 바탕으로 유튜브 영상 제목 5개를 만들어주세요.

장르: ${genre}
대본 요약: ${script.substring(0, 500)}...

조건:
1. 클릭을 유도하는 매력적인 제목
2. 30자 내외
3. 숫자나 질문 활용 가능
4. SEO에 최적화

제목만 줄바꿈으로 구분해서 출력해주세요.`

  const result = await generateText(prompt)
  return result.split('\n').filter(line => line.trim()).slice(0, 5)
}

// 영상 설명 생성
export async function generateDescription(script: string, title: string, genre: string): Promise<string> {
  const prompt = `다음 정보를 바탕으로 유튜브 영상 설명을 작성해주세요.

제목: ${title}
장르: ${genre}
대본 요약: ${script.substring(0, 500)}...

조건:
1. 첫 2-3줄에 핵심 내용 요약 (검색 결과에 표시됨)
2. 관련 키워드 자연스럽게 포함
3. 타임스탬프 포맷 포함 (예: 00:00 인트로)
4. 관련 해시태그 3-5개
5. 구독과 좋아요 유도 문구`

  return await generateText(prompt)
}

// 태그 생성
export async function generateTags(script: string, title: string, genre: string): Promise<string[]> {
  const prompt = `다음 정보를 바탕으로 유튜브 태그 15개를 만들어주세요.

제목: ${title}
장르: ${genre}
대본 요약: ${script.substring(0, 300)}...

조건:
1. 검색량이 높은 키워드 포함
2. 긴 꼬리 키워드 포함
3. 관련 키워드 포함

태그만 쉼표로 구분해서 출력해주세요.`

  const result = await generateText(prompt)
  return result.split(',').map(tag => tag.trim()).filter(tag => tag)
}

// 장면별 이미지 프롬프트 생성
export async function generateSceneImagePrompts(script: string): Promise<{ scene: number; text: string; imagePrompt: string }[]> {
  const prompt = `다음 대본에서 각 장면을 분석하고, 각 장면에 맞는 이미지 생성 프롬프트를 만들어주세요.

대본:
${script}

JSON 형식으로 출력해주세요:
[
  {"scene": 1, "text": "나레이션 텍스트", "imagePrompt": "영어 이미지 프롬프트"},
  ...
]`

  const result = await generateText(prompt)

  // JSON 파싱 시도
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('장면 파싱 실패:', e)
  }

  return []
}
