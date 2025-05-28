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
    <html
      lang="en"
      className={`${PretendardVariable.variable} max-h-lvh min-h-svh snap-y snap-mandatory antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
