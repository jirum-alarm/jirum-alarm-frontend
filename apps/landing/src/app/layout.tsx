import type { Metadata } from 'next';

import { PretendardVariable } from '@/fonts/font';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '지름알림',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${PretendardVariable.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
