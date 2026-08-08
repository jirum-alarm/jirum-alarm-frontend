import { cookies, headers } from 'next/headers';

import { CHAT_API } from '@/features/answer/model/conversation';

export const runtime = 'nodejs';

/**
 * chat 서버로 가는 **얇은 프록시**. 하는 일은 스트림을 그대로 흘려보내는 것뿐이다.
 *
 * 왜 Next 에 이게 남아 있나:
 *  - AI 서버 주소·내부 키가 브라우저에 노출되지 않는다
 *  - 세션 쿠키를 여기서 붙여 넘긴다(익명 식별·로그인 판정은 chat 서버가 한다)
 *  - 프론트는 여전히 같은 오리진에 요청 — CORS 설정이 필요 없다
 *
 * ★판정·게이트·페이싱·도구 루프는 **전부 chat 서버로 옮겼다**(`jirum-alarm-chat`).
 * 여기에 로직을 다시 넣지 말 것 — 두 곳에 판정이 생기면 어느 쪽이 답했는지 알 수 없게 된다.
 * (같은 실수의 전례: 폴백 있는 시스템의 "일치" 결과는 어느 경로가 답했는지 모르면 의미가 없다.)
 */
export async function POST(req: Request) {
  const cookieHeader = (await cookies()).toString();
  // 레이트리밋·로깅이 실제 클라 IP 를 봐야 한다 — 프록시를 거치면 원본이 사라진다
  const forwardedFor = (await headers()).get('x-forwarded-for') ?? '';

  let upstream: Response;
  try {
    upstream = await fetch(`${CHAT_API}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: cookieHeader,
        ...(forwardedFor ? { 'x-forwarded-for': forwardedFor } : {}),
      },
      body: req.body,
      /*
       * ⚠️ 요청 바디를 스트림으로 넘기면 `duplex: 'half'` 가 **필수**다(웹 표준).
       * 없으면 undici 가 `RequestInit: duplex option is required` 로 던진다.
       */
      duplex: 'half',
      /*
       * ★abort 전파. 이게 없으면 유저가 탭을 닫아도 chat 서버는 계속 돌아
       * LLM 토큰과 GraphQL 호출이 그대로 나간다 — 프록시화하는 순간 조용히 새기 시작한다.
       */
      signal: req.signal,
      cache: 'no-store',
    } as RequestInit & { duplex: 'half' });
  } catch (e) {
    // 업스트림에 못 닿은 것 — 아직 아무것도 안 보냈으므로 평범한 JSON 에러로 답한다
    if (req.signal.aborted) return new Response(null, { status: 499 });
    console.error('[ai] chat upstream unreachable:', e);
    return Response.json(
      { error: '지금은 답변 서버에 연결할 수 없어요. 잠시 뒤 다시 시도해 주세요.' },
      { status: 503 },
    );
  }

  // 쿼터 초과(429) 등 에러 응답은 그대로 통과 — 프론트가 상태코드로 분기한다
  if (!upstream.ok || !upstream.body) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    });
  }

  /*
   * 스트림 통과 — 웹 표준 스트림이라 변환이 필요 없다.
   *
   * ★`set-cookie` 를 반드시 넘긴다: 익명 식별 쿠키를 chat 서버가 발급하므로
   * 안 넘기면 매 요청 새 주체가 되어 **쿼터가 무한 우회된다.**
   */
  const out = new Headers({
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    'X-Accel-Buffering': 'no',
  });
  for (const cookie of upstream.headers.getSetCookie()) out.append('set-cookie', cookie);

  return new Response(upstream.body, { status: 200, headers: out });
}
