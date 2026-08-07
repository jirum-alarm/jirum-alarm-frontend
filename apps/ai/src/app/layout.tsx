import { PretendardVariable } from '@/fonts/font';

import type { Metadata } from 'next';

import '@/styles/globals.css';

const title = '지름알람 시세 조회 — 뭐가 싼지 물어보세요';
const description = '최근 핫딜 데이터로 시세를 계산해서 보여드려요. 모르는 건 모른다고 말해요.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${PretendardVariable.className} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
