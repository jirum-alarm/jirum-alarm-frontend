// 실사용자 웹 바이탈을 GA4 로(dataLayer `web_vitals` → GTM 태그).
//
// ★왜(2026-10-16): CrUX 는 Chrome 사용자만 세서 모바일의 일부(Chrome Android)만 본다. 가장 큰 사용자군인
// 네이버 앱 인앱·iOS 사파리·삼성 인터넷은 빠지고, 값도 사이트 전체 p75 하나라 어느 화면·어느 요소가
// 느린지 모른다. 그래서 착지 화면 종류·느린 요소·가장 긴 구간을 같이 싣는다(GA4 의 브라우저·기기 차원과 교차해 본다).
import type {
  CLSMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from 'web-vitals/attribution';

type VitalMetric =
  | CLSMetricWithAttribution
  | INPMetricWithAttribution
  | LCPMetricWithAttribution
  | TTFBMetricWithAttribution;

export type WebVitalsEvent = {
  event: 'web_vitals';
  metric_name: string;
  metric_value: number;
  metric_rating: string;
  navigation_type: string;
  page_type: string;
  vitals_target: string;
  vitals_detail: string;
};

const GA4_PARAM_MAX = 100;

export const pageTypeOf = (pathname: string) => {
  if (pathname === '/') return 'home';
  const first = pathname.split('/')[1] ?? '';
  const known: Record<string, string> = {
    products: 'product',
    search: 'search',
    trending: 'trending',
    community: 'community',
    deals: 'deals',
    toss: 'toss',
    keywords: 'keyword_hub',
    mypage: 'mypage',
  };
  return known[first] ?? 'other';
};

const largest = (parts: Record<string, number>) =>
  Object.entries(parts).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

// 스크립트 주소는 호스트+파일 이름만(쿼리·해시 청크 경로가 길어 100자를 넘긴다).
const shortScript = (url: string | undefined) => {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${u.host}/${u.pathname.split('/').pop()}`;
  } catch {
    return url.slice(0, 60);
  }
};

const detailOf = (metric: VitalMetric): { target: string; detail: string } => {
  switch (metric.name) {
    case 'INP': {
      const a = metric.attribution;
      const phase = largest({
        input: a.inputDelay,
        processing: a.processingDuration,
        presentation: a.presentationDelay,
      });
      const script = shortScript(a.longestScript?.entry.sourceURL);
      return {
        target: a.interactionTarget ?? '',
        detail: [phase, a.loadState, script].filter(Boolean).join('|'),
      };
    }
    case 'LCP': {
      const a = metric.attribution;
      const phase = largest({
        ttfb: a.timeToFirstByte,
        load_delay: a.resourceLoadDelay,
        load: a.resourceLoadDuration,
        render: a.elementRenderDelay,
      });
      return { target: a.target ?? '', detail: phase };
    }
    case 'CLS':
      return {
        target: metric.attribution.largestShiftTarget ?? '',
        detail: metric.attribution.loadState ?? '',
      };
    case 'TTFB': {
      const a = metric.attribution;
      const phase = largest({
        waiting: a.waitingDuration,
        cache: a.cacheDuration,
        dns: a.dnsDuration,
        connection: a.connectionDuration,
        request: a.requestDuration,
      });
      return { target: '', detail: phase };
    }
  }
};

export const toWebVitalsEvent = (metric: VitalMetric, landingPath: string): WebVitalsEvent => {
  const { target, detail } = detailOf(metric);
  return {
    event: 'web_vitals',
    metric_name: metric.name,
    // CLS 는 0.xx 라 1000 배해 정수로(GA4 맞춤 측정항목은 정수 합계가 다루기 쉽다).
    metric_value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating,
    navigation_type: metric.navigationType,
    page_type: pageTypeOf(landingPath),
    vitals_target: target.slice(0, GA4_PARAM_MAX),
    vitals_detail: detail.slice(0, GA4_PARAM_MAX),
  };
};
