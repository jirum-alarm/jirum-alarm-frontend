import { fetchDeals } from '@/features/answer/model/fetchDeals';
import { gateAnswer, krwPrice } from '@/features/answer/model/gate';
import { extractProductTerm } from '@/features/answer/model/intent';
import {
  BLOCK_GAP_LONG_MS,
  BLOCK_GAP_MS,
  settle,
  sleep,
  STAGE_MIN_MS,
} from '@/features/answer/model/pace';
import { checkRate, clientIp } from '@/features/answer/model/rateLimit';

import type { AnswerBlock } from '@/features/answer/model/answer';
import type { Deal } from '@/features/answer/model/types';

export const runtime = 'nodejs';

/**
 * NDJSON 스트림. 한 줄 = 한 이벤트.
 *
 *   stage  '콜라' 딜을 찾는 중        ← fetchDeals 전
 *   stage  50건에서 다른 상품을 걸러…   ← gate 전
 *   block  verdict | partial          ← 판정 직후
 *   block  distribution               ← 가격 집계 직후
 *   block  review                     ← 커뮤니티 요약 있으면
 *   block  deals                      ← 목록
 *   done
 *
 * 페이싱: 단계 뒤 연산은 전부 순수 함수라 같은 밀리초에 끝난다(실측). 간격을 안 주면
 * 유저가 단계를 못 읽고 한 번에 번쩍인다. `settle` 은 **이미 흐른 시간을 뺀 만큼만**
 * 기다리므로, 진짜 API 가 느렸으면 추가 지연이 0 이 되고 그 느림이 그대로 드러난다.
 * 데이터를 늦게 계산하는 게 아니라 이미 있는 것을 순서대로 내보내는 리듬만 만든다.
 */
export type AskEvent =
  | { type: 'stage'; label: string }
  | { type: 'block'; block: AnswerBlock }
  | { type: 'done' }
  | { type: 'error'; message: string };

const encoder = new TextEncoder();

export async function POST(req: Request) {
  // 공개 무인증 엔드포인트 — 요청 1건이 운영 GraphQL 호출 1건이다
  const verdict = checkRate(clientIp(req));
  if (!verdict.ok) {
    return Response.json(
      { error: '요청이 너무 많아요. 잠시 뒤 다시 시도해 주세요.' },
      { status: 429, headers: { 'Retry-After': String(verdict.retryAfterSec) } },
    );
  }

  let keyword = '';
  try {
    const body = (await req.json()) as { keyword?: string };
    keyword = body.keyword?.trim().slice(0, 40) ?? '';
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const q = keyword;

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: AskEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      const block = (b: AnswerBlock) => emit({ type: 'block', block: b });

      try {
        if (!q) {
          emit({ type: 'error', message: '검색어를 입력해 주세요.' });
          return;
        }

        // 표시는 원문(q), 검색·게이트는 상품 토큰(term).
        // term 을 안 쓰면 문장형 질의에서 isPolluted 가 조용히 무효화된다(intent.ts 참조).
        const term = extractProductTerm(q);

        const findStart = Date.now();
        emit({ type: 'stage', label: `'${term}' 딜을 찾는 중` });

        let deals: Deal[];
        try {
          deals = await fetchDeals(term);
        } catch (e) {
          console.error('[ai] fetchDeals failed:', e);
          await settle(findStart, STAGE_MIN_MS);
          block({
            kind: 'failure',
            message: '지금은 딜 정보를 가져올 수 없어요. 잠시 뒤 다시 시도해 주세요.',
          });
          return;
        }

        // fetch 가 빨랐어도 첫 단계는 읽을 시간을 준다
        await settle(findStart, STAGE_MIN_MS);

        const filterStart = Date.now();
        emit({ type: 'stage', label: `${deals.length}건에서 다른 상품을 걸러내는 중` });

        const state = gateAnswer(deals, term);
        const shown = state.kind === 'REFUSED' ? [] : state.deals;
        const prices = shown.map(krwPrice).filter((p): p is number => p != null);
        const lowest = prices.length > 0 ? Math.min(...prices) : null;
        const removed = deals.length - shown.length;

        await settle(filterStart, STAGE_MIN_MS);

        if (state.kind === 'ANSWERED') {
          block({ kind: 'verdict', dealCount: prices.length, lowest });
        } else {
          block({ kind: 'partial', reason: state.reason, filteredCount: shown.length });
        }

        // 판정 카드를 읽을 틈. 없으면 verdict 와 다음 stage 가 같은 순간에 뜬다.
        await sleep(BLOCK_GAP_MS);

        if (prices.length > 0) {
          const calcStart = Date.now();
          emit({
            type: 'stage',
            label:
              removed > 0
                ? `${removed}건 걸러내고 ${prices.length}건으로 시세를 계산하는 중`
                : `${prices.length}건으로 시세를 계산하는 중`,
          });
          await settle(calcStart, STAGE_MIN_MS);
          block({ kind: 'distribution', prices });
          // 분포 차트를 본 뒤에 다음 단계가 뜨게
          await sleep(BLOCK_GAP_MS);
        }

        const withReview = shown.find((d) => d.commentSummary?.summary);
        if (withReview?.commentSummary) {
          const revStart = Date.now();
          emit({ type: 'stage', label: '커뮤니티 반응을 정리하는 중' });
          await settle(revStart, STAGE_MIN_MS);
          block({
            kind: 'review',
            summary: withReview.commentSummary,
            title: withReview.title,
          });
        }

        if (shown.length > 0) {
          await sleep(BLOCK_GAP_MS);
          block({ kind: 'deals', deals: shown.slice(0, 12), lowest });
          await sleep(BLOCK_GAP_LONG_MS);
        }

        emit({ type: 'done' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      // 프록시 버퍼링 방지 — 없으면 스트림이 끝에 한 번에 도착한다
      'X-Accel-Buffering': 'no',
    },
  });
}
