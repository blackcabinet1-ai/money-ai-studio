import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MONEY AI STUDIO - AI 영상 제작 플랫폼",
  description: "AI를 활용한 유튜브 영상 제작 올인원 플랫폼. 대본, 음성, 이미지, 영상을 AI로 생성하세요.",
  keywords: ["AI", "영상 제작", "유튜브", "대본 생성", "TTS", "썸네일"],
  authors: [{ name: "MONEY AI STUDIO" }],
  openGraph: {
    title: "MONEY AI STUDIO - AI 영상 제작 플랫폼",
    description: "AI를 활용한 유튜브 영상 제작 올인원 플랫폼",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
