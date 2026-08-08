import { cookies } from 'next/headers';

import { CHAT_API } from '@/features/answer/model/conversation';

export const runtime = 'nodejs';

/**
 * ⚠️ **개발용 쿼터 리셋 프록시 — 임시.** 홈의 목업 조작 바가 부른다.
 *
 * 이중으로 막는다: 여기서 `NODE_ENV=production` 이면 404, chat 서버도 같은 조건으로 404.
 * 돈 경계라 한 겹으로 두지 않는다 — 열려 있으면 무료 질문이 사실상 무제한이 된다.
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return new Response(null, { status: 404 });
  }

  try {
    const res = await fetch(`${CHAT_API}/dev/quota/reset`, {
      method: 'POST',
      headers: { cookie: (await cookies()).toString() },
      cache: 'no-store',
    });
    // 익명 쿠키를 아직 안 받았으면 서버가 여기서 발급한다 — 그대로 넘겨야 같은 주체로 이어진다
    const out = new Headers({ 'Content-Type': 'application/json' });
    for (const c of res.headers.getSetCookie()) out.append('set-cookie', c);
    return new Response(await res.text(), { status: res.status, headers: out });
  } catch (e) {
    console.error('[ai] quota reset upstream unreachable:', e);
    return Response.json({ error: 'unreachable' }, { status: 503 });
  }
}
