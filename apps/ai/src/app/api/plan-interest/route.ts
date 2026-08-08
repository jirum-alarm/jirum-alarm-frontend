import { cookies } from 'next/headers';

import { CHAT_API } from '@/features/answer/model/conversation';

export const runtime = 'nodejs';

/**
 * 프로 플랜 대기 신청 프록시.
 *
 * `/api/quota` 와 같은 이유로 Next 를 거친다 — chat 서버 주소를 숨기고, 식별 쿠키를
 * 그대로 넘겨 "누가 신청했는지"를 서버가 판단하게 한다.
 *
 * ★검증 결과(400)를 **그대로 흘린다**. 여기서 200 으로 덮으면 잘못된 이메일이
 * 조용히 버려지고 화면은 성공으로 보인다.
 */
export async function POST(req: Request) {
  try {
    const res = await fetch(`${CHAT_API}/plan-interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: (await cookies()).toString(),
      },
      body: await req.text(),
      cache: 'no-store',
    });

    const out = new Headers({ 'Content-Type': 'application/json' });
    for (const c of res.headers.getSetCookie()) out.append('set-cookie', c);
    return new Response(await res.text(), { status: res.status, headers: out });
  } catch (e) {
    console.error('[ai] plan-interest upstream unreachable:', e);
    return Response.json({ error: 'unreachable' }, { status: 503 });
  }
}
