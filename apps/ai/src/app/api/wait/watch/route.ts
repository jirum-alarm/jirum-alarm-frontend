import { addWatch } from '@/features/wait/model/fetchWait';

export const runtime = 'nodejs';

/**
 * 「이 가격 오면 알려줘」 — 기존 알림 키워드 등록(addNotificationKeyword)을 서버에서 대신 부른다.
 * 토큰이 httpOnly 쿠키라 브라우저가 직접 GraphQL 에 못 싣는다.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    keyword?: unknown;
    excludeKeywords?: unknown;
    minPrice?: unknown;
    maxPrice?: unknown;
  } | null;
  const keyword = typeof body?.keyword === 'string' ? body.keyword.trim() : '';
  if (!keyword) return Response.json({ error: 'keyword' }, { status: 400 });

  const int = (v: unknown) => (Number.isInteger(v) && (v as number) > 0 ? (v as number) : null);
  const r = await addWatch({
    keyword,
    excludeKeywords: Array.isArray(body?.excludeKeywords)
      ? body.excludeKeywords.filter((w): w is string => typeof w === 'string').slice(0, 10)
      : [],
    minPrice: int(body?.minPrice),
    maxPrice: int(body?.maxPrice),
  });
  if (r.ok) return Response.json({ ok: true });
  // 이미 등록된 키워드 등 서버 메시지는 그대로 보여 준다
  const status = r.reason === 'login' ? 401 : r.reason === 'forbidden' ? 403 : 400;
  return Response.json({ error: r.reason, message: r.message }, { status });
}
