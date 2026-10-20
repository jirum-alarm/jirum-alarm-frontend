import { isCrawlerUA } from '@/shared/config/user-agent';
import { MAX_BODY_BYTES, sanitizeUxSignals, uaInfoOf } from '@/shared/lib/ux-signal-sanitize';

/**
 * 브라우저 UX 신호(dead click·rage click·웹 바이탈, shared/lib/ux-signals-client.ts) → 한 건당 stdout 한 줄 JSON.
 * Alloy 가 파드 로그를 Loki 로 보내므로 `{namespace="jirum-alarm-frontend-web"} |= "ux_signal" | json` 으로 읽힌다.
 * 무엇이 오든 204 — sendBeacon 은 응답을 보지 않고, 실패를 알려 줘도 다시 보내지 않는다.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_CONTENT = () =>
  new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: Request) {
  try {
    const ua = req.headers.get('user-agent') ?? '';
    if (!ua || isCrawlerUA(ua)) return NO_CONTENT();
    if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return NO_CONTENT();
    const signals = sanitizeUxSignals(await req.text());
    if (signals.length === 0) return NO_CONTENT();
    const uaInfo = uaInfoOf(ua);
    // console.* 는 운영 빌드에서 지워진다(next.config compiler.removeConsole) — stdout 에 직접 쓴다.
    process.stdout.write(
      signals.map((s) => JSON.stringify({ ux_signal: 1, ...s, ...uaInfo })).join('\n') + '\n',
    );
  } catch {
    // 수집 실패는 조용히 — 사용자 화면과 무관하다.
  }
  return NO_CONTENT();
}
