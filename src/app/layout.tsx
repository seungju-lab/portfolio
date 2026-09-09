import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const notoSans = localFont({
  src: "./fonts/noto-sans-kr-variable.woff2",
  variable: "--font-noto-sans",
  weight: "100 900",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "이승주 | Backend Developer",
  description: "백엔드 개발자 이승주의 포트폴리오",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
