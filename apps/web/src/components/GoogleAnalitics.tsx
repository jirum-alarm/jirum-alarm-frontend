'use client';
import Script from 'next/script';

const GoogleAnalytics = ({ GA_TRACKING_ID }: { GA_TRACKING_ID: string }) => {
  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        src={`https://www.google-analytics.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          // UTM 파라미터 포함한 페이지 경로 설정
          const pagePath = window.location.pathname + window.location.search;

          gtag('config', '${GA_TRACKING_ID}', {
            page_path: pagePath,
          });
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
