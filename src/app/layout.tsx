import '../styles/globals.css'

import { Metadata } from 'next'
import { GA_TRACKING_ID } from '@/constants/ga'
import GoogleAnalytics from '../components/GoogleAnalitics'
import Script from 'next/script'
import AppProvider from '@/lib/provider/appProvier'
import { pretendard } from '@/lib/fonts'

export const metadata: Metadata = {
  title: '지름알림: 핫딜 정보 모아보기',
  description: '지름 정보를 알려드려요!',
  openGraph: {
    title: '지름알림: 핫딜 정보 모아보기',
    description: '핫딜 정보를 알려드려요!',
    images: './opengraph-image.png',
  },
  icons: {
    icon: '/icon.png',
  },
  viewport: 'initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.4.0/kakao.min.js"
          integrity="sha384-mXVrIX2T/Kszp6Z0aEWaA8Nm7J6/ZeWXbL8UpGRjKwWe56Srd/iyNmWMBhcItAjH"
          crossOrigin="anonymous"
        ></Script>
      </head>
      <body>
        <AppProvider>
          <div className="min-w-[320px] bg-white relative">{children}</div>
        </AppProvider>
      </body>

      <GoogleAnalytics GA_TRACKING_ID={GA_TRACKING_ID} />
    </html>
  )
}
