// ponytail: fallback 을 운영으로. dev API(jirum-dev-api) 라우트는 신 Talos 클러스터에 없어
// 404 — NEXT_PUBLIC_API_URL 이 CI 에 미설정이라 이 fallback 이 그대로 빌드에 박혀 로그인이 죽었다.
export const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jirum-api.kyojs.com/graphql';
