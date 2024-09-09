'use client';
import Script from 'next/script';

const GoogleAnalytics = ({ GA_TRACKING_ID }: { GA_TRACKING_ID: string }) => {
  return (
    <>
      {/* Google Analytics 스크립트 */}
      <Script src={`https://www.google-analytics.com/analytics.js`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
        window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};
          ga('create', '${GA_TRACKING_ID}', 'auto');
          ga('send', 'pageview');
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
