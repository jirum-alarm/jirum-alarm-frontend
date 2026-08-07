import { fetchDeals, fetchPriceHistory, toPricePoints } from '@/features/answer/model/fetchDeals';
import { buildFollowUps } from '@/features/answer/model/followUp';
import {
  gateAnswer,
  krwPrice,
  majorityCategory,
  positionFromHistory,
} from '@/features/answer/model/gate';
import { extractProductTerm } from '@/features/answer/model/intent';
import {
  BLOCK_GAP_LONG_MS,
  BLOCK_GAP_MS,
  settle,
  sleep,
  STAGE_MIN_MS,
} from '@/features/answer/model/pace';
import { checkRate, clientIp } from '@/features/answer/model/rateLimit';
import { MIN_POINTS_FOR_TREND } from '@/features/answer/model/types';

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

  /**
   * 클라 이탈 전파. 탭을 닫으면 `req.signal` 이 abort 되고, 그걸 업스트림
   * GraphQL 호출까지 넘겨서 아무도 안 볼 응답을 계산하지 않게 한다.
   *
   * ★LLM 이 붙으면 이게 곧 돈이다(토큰). 규칙 기반인 지금은 GraphQL 호출 1건이라
   * 손해가 작지만, 배선을 나중에 하면 이미 새고 있는 뒤에 하게 된다.
   */
  const ac = new AbortController();
  req.signal.addEventListener('abort', () => ac.abort());

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: AskEvent) => {
        // 이탈 후 enqueue 하면 "Invalid state: Controller is already closed" 가 난다
        if (ac.signal.aborted) return;
        controller.enqueue(encoder.encode(`${JSON.stringify(e)}\n`));
      };
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
          deals = await fetchDeals(term, ac.signal);
        } catch (e) {
          if (ac.signal.aborted) return;
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
        // "걸러낸다"는 우리 쪽 파이프라인 동작이지 사용자 관심사가 아니다.
        // 사용자 관점 = "엉뚱한 게 섞여서 빼는 중".
        emit({ type: 'stage', label: `${term} 아닌 상품 골라내는 중` });

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
                ? `${removed}개 빼고 ${prices.length}개로 시세 계산하는 중`
                : `${prices.length}개로 시세 계산하는 중`,
          });
          await settle(calcStart, STAGE_MIN_MS);
          block({ kind: 'distribution', prices });
          // 분포 차트를 본 뒤에 다음 단계가 뜨게
          await sleep(BLOCK_GAP_MS);
        }

        /*
         * "지금 사도 되나" — 대표 딜 1건의 과거 이력 대비 위치.
         *
         * ★대표를 **최저가로 고르면 안 된다**(실측 2026-08-08). 5키워드 225건 전수 조회에서
         * 최저가 딜은 **5/5 모두 priceHistory 가 null** 이었다. 최저가에 오는 것은
         * 액세서리·체험팩·오염 상품이라(강아지 기저귀 7,900 / 노니콜라겐 4,900 /
         * 에어팟 파우치 4,159) 매칭·유사검색이 붙을 만한 카탈로그가 없다.
         * 이력이 붙는 최저 순위는 6위, 보통 8~24위였다.
         *
         * 그래서 "싼 순서로 훑어서 **근거가 있는 첫 딜**"을 대표로 쓴다. 유저 관심(싼 것)과
         * 판정 가능성(이력 있음)을 동시에 만족하는 유일한 지점이다.
         *
         * ⚠️ priceHistory 는 ResolveField 라 1건당 Meili 유사검색이 돈다 — 그래서
         * 순차로 훑고 상한을 둔다. 50건 전부 물어보면 응답이 50배가 된다.
         */
        /*
         * ⚠️ 대표 딜은 **다수 카테고리 안에서만** 고른다(실측 2026-08-08).
         * "기저귀"에서 대표로 뽑힌 것이 `레토 자동 센서 쓰레기통 … 기저귀 화장실 틈새`
         * (가전·가구)였다 — 제목 끝에 용도로 키워드가 스친 다른 상품인데,
         * 그걸 기준으로 "역대 딜 중 싼 편"이라고 단정했다.
         *
         * isPolluted·isBundle 은 이걸 못 잡는다(실측 확인). 판정 카드는 "이 상품"에 대한
         * 단정이라 목록보다 기준이 엄격해야 한다 — 목록에는 남겨두고 기준에서만 뺀다.
         */
        /*
         * 탐색 깊이·폭(실측 2026-08-08): 근거가 붙는 첫 딜의 순위는 8·11·15·17 위였다.
         * 상한을 8로 두면 4키워드 중 3개가 카드를 못 만든다 → 20까지 본다.
         * priceHistory 1건이 med 99ms 라 순차 20건은 ~2s. 배치로 나눠 첫 히트에서 멈춘다.
         */
        /** 되묻기 제안이 "이미 보여준 것"을 다시 권하지 않도록 추적한다. */
        let positionShown = false;
        /** 판정 결과 — 되묻기 문구가 맥락을 따라가게(비싸면 "싼 거 추천"). */
        let shownVerdict: 'cheap' | 'normal' | 'pricey' | null = null;

        const POSITION_PROBE_LIMIT = 20;
        const POSITION_PROBE_BATCH = 5;
        const mainCategory = majorityCategory(shown);
        const byPriceAsc = shown
          .filter((d) => krwPrice(d) != null)
          .filter((d) => mainCategory == null || d.categoryName === mainCategory)
          .sort((a, b) => krwPrice(a)! - krwPrice(b)!);

        if (byPriceAsc.length > 0) {
          const posStart = Date.now();
          emit({ type: 'stage', label: '이 가격이 싼지 과거 딜과 비교하는 중' });

          const probe = async (candidate: Deal) => {
            const history = await fetchPriceHistory(candidate.id, ac.signal);
            const points = history ? toPricePoints(history) : [];
            const position = positionFromHistory(
              krwPrice(candidate)!,
              history && {
                points,
                currency: history.currency,
                confidence: history.confidence,
              },
            );
            // points 를 같이 들고 나온다 — 추이 블록이 같은 이력을 쓰므로 재조회가 필요 없다
            return position && { position, deal: candidate, points, history: history! };
          };

          let found: Awaited<ReturnType<typeof probe>> = null;
          const pool = byPriceAsc.slice(0, POSITION_PROBE_LIMIT);

          // 배치 안은 병렬, 배치 간은 순차. 싼 것부터 보므로 첫 히트가 가장 싼 근거 있는 딜이다.
          for (let i = 0; i < pool.length && !found; i += POSITION_PROBE_BATCH) {
            if (ac.signal.aborted) return;
            const batch = await Promise.all(pool.slice(i, i + POSITION_PROBE_BATCH).map(probe));
            found = batch.find((r) => r != null) ?? null;
          }

          await settle(posStart, STAGE_MIN_MS);
          // 근거가 약하면(점 부족·비KRW·이력 없음) 카드가 아예 안 나간다.
          // "모르겠다"는 카드를 굳이 만들지 않는다 — 이미 위에 가격대가 있다.
          if (found) {
            block({ kind: 'position', position: found.position, title: found.deal.title });
            await sleep(BLOCK_GAP_MS);

            /*
             * 추이는 위치와 **같은 이력**을 쓴다 — 재조회 없음.
             * 날짜 3개 미만이면 컴포넌트가 스스로 null 을 내지만, 그러면 빈 블록이
             * 스트림에 실려 페이싱 간격만 낭비된다. 여기서 미리 세고 안 보낸다.
             */
            const dates = new Set(found.points.filter((p) => p.price > 0).map((p) => p.date));
            if (dates.size >= MIN_POINTS_FOR_TREND) {
              const trendStart = Date.now();
              // 창 길이를 라벨에 박지 않는다 — 실제 점 범위가 90일보다 넓다(PriceTrend 주석)
              emit({ type: 'stage', label: '가격 흐름을 그리는 중' });
              await settle(trendStart, STAGE_MIN_MS);
              block({
                kind: 'trend',
                points: found.points,
                current: found.position.price,
                confidence: found.history.confidence,
              });
              await sleep(BLOCK_GAP_MS);
            }
          }
          positionShown = found != null;
          shownVerdict = found?.position.verdict ?? null;
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

        /*
         * 되묻기는 **맨 마지막**이다. 답 위에 놓으면 답을 읽기 전에 다른 질문으로 새고,
         * 목록 위에 놓으면 근거를 안 보고 떠난다. 대화가 이어질 자리는 답이 끝난 뒤다.
         *
         * 거절(REFUSED)에도 보낸다 — NO_RESULTS 는 ExampleChips 가 이미 있으므로 빼고,
         * 나머지 거절은 "다른 표현으로 다시 물어보기"가 곧 탈출구다.
         */
        const suggestions = buildFollowUps({
          term,
          hasReview: withReview?.commentSummary != null,
          hasPosition: positionShown,
          verdict: shownVerdict,
        });
        if (
          suggestions.length > 0 &&
          !(state.kind === 'REFUSED' && state.reason.code === 'NO_RESULTS')
        ) {
          block({ kind: 'followUp', suggestions });
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
