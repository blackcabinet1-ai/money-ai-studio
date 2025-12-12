import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* 네비게이션 */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            MONEY AI <span className="text-purple-400">STUDIO</span>
          </h1>
          <Link
            href="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            로그인
          </Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          AI로 영상 제작의<br />
          <span className="text-purple-400">모든 것</span>을 해결하세요
        </h2>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          대본 작성부터 음성, 이미지, 영상 생성까지<br />
          촬영 없이 고퀄리티 유튜브 영상을 만들어보세요
        </p>
        <Link
          href="/login"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-lg px-8 py-4 rounded-xl transition-colors shadow-lg shadow-purple-500/25"
        >
          무료로 시작하기
        </Link>
      </section>

      {/* 기능 소개 */}
      <section className="container mx-auto px-6 py-20">
        <h3 className="text-3xl font-bold text-white text-center mb-16">
          주요 기능
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI 대본 생성",
              desc: "장르와 주제만 입력하면 전문 대본을 자동 생성",
              icon: "📝",
            },
            {
              title: "제목/설명/태그",
              desc: "SEO에 최적화된 메타데이터 자동 생성",
              icon: "🏷️",
            },
            {
              title: "AI 음성 생성",
              desc: "자연스러운 AI 음성으로 나레이션 생성",
              icon: "🎙️",
            },
            {
              title: "AI 이미지 생성",
              desc: "장면에 맞는 고퀄리티 이미지 자동 생성",
              icon: "🎨",
            },
            {
              title: "자막 생성",
              desc: "음성에 맞춰 자동으로 자막 생성",
              icon: "💬",
            },
            {
              title: "영상 합성",
              desc: "모든 요소를 합쳐 완성된 영상으로 출력",
              icon: "🎬",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer className="container mx-auto px-6 py-10 border-t border-white/10">
        <p className="text-center text-gray-500">
          © 2024 MONEY AI STUDIO. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
