import { cookies } from 'next/headers';

import { CHAT_API } from '@/features/answer/model/conversation';

export const runtime = 'nodejs';

/**
 * 쿼터 조회 프록시. **소비하지 않는다** — 화면이 남은 횟수를 표시하려고 읽을 뿐이다.
 *
 * `/api/ask` 와 같은 이유로 Next 를 거친다: chat 서버 주소를 브라우저에 노출하지 않고,
 * 익명 식별 쿠키를 그대로 넘겨 "누구의 쿼터인지"를 서버가 판단하게 한다.
 */
export async function GET() {
  try {
    const res = await fetch(`${CHAT_API}/quota`, {
      headers: { cookie: (await cookies()).toString() },
      cache: 'no-store',
    });
    if (!res.ok) return Response.json({ error: 'upstream' }, { status: res.status });

    // 익명 쿠키를 아직 안 받은 브라우저면 서버가 여기서 발급한다 — 그대로 전달해야
    // 다음 /api/ask 가 같은 주체로 세어진다(안 넘기면 새 주체가 생겨 쿼터가 어긋난다).
    const out = new Headers({ 'Content-Type': 'application/json' });
    for (const c of res.headers.getSetCookie()) out.append('set-cookie', c);
    return new Response(await res.text(), { status: 200, headers: out });
  } catch (e) {
    console.error('[ai] quota upstream unreachable:', e);
    return Response.json({ error: 'unreachable' }, { status: 503 });
  }
}
