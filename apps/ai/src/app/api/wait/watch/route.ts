import { addWatch } from '@/features/wait/model/fetchWait';

export const runtime = 'nodejs';

/**
 * 「이 가격 오면 알려줘」 — addWaitWatch 를 서버에서 대신 부른다.
 * 토큰이 httpOnly 쿠키라 브라우저가 직접 GraphQL 에 못 싣는다.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { text?: unknown } | null;
  const text =
    typeof body?.text === 'string' ? body.text.replace(/\s+/g, ' ').trim().slice(0, 100) : '';
  if (text.length < 2) return Response.json({ error: 'text' }, { status: 400 });

  const r = await addWatch(text);
  if (r.ok) return Response.json(r.data.addWaitWatch);
  // 키워드 개수 상한 등 서버 메시지는 그대로 보여 준다
  const status = r.reason === 'login' ? 401 : r.reason === 'forbidden' ? 403 : 400;
  return Response.json({ error: r.reason, message: r.message }, { status });
}
