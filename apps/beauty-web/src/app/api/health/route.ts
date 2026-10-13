/**
 * k8s 프로브용 — /beauty/api/health. 페이지(/beauty)는 GraphQL 을 3번 불러 무겁고 API 장애에 같이 흔들리므로
 * 프로세스가 살아 응답하는지만 본다(외부 호출 없음).
 */
export const dynamic = 'force-dynamic';

export function GET() {
  return new Response('ok', {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  });
}
