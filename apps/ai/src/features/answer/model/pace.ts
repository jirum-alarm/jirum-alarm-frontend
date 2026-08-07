/**
 * 스트림 페이싱.
 *
 * 실측(2026-08-07): fetchDeals 는 118~358ms 걸리지만 그 뒤 단계(필터·집계·요약 선택)는
 * 전부 순수 연산이라 **같은 밀리초에 끝난다**. 그래서 유저는 단계 추적을 못 읽고
 * "한 번 번쩍" 만 본다. 페이싱 없이는 스트리밍 UI 의 의미가 없다.
 *
 * 정직성 규칙: 지연은 **표시 리듬**만 만들고 **작업을 늦추지 않는다**.
 * 데이터는 이미 계산돼 있고, 블록을 순서대로 내보내는 간격만 준다.
 * 실제 작업이 느리면(느린 API) 그 시간이 그대로 드러나야 하므로,
 * 이미 흐른 시간을 빼고 남은 만큼만 기다린다(`settle`).
 */

/** 단계 하나를 읽을 수 있는 최소 시간. 한글 단문 기준. */
export const STAGE_MIN_MS = 420;

/** 블록 사이 간격 — 카드가 하나씩 앉는 리듬. */
export const BLOCK_GAP_MS = 260;

/** 무거운 블록(목록)은 조금 더 뒤에. 시선이 위쪽 요약을 먼저 읽게. */
export const BLOCK_GAP_LONG_MS = 380;

export const sleep = (ms: number) =>
  ms > 0 ? new Promise<void>((r) => setTimeout(r, ms)) : Promise.resolve();

/**
 * 최소 표시 시간을 보장한다 — 이미 elapsed 만큼 지났으면 그만큼 덜 기다린다.
 * 진짜 작업이 오래 걸렸으면 추가 지연이 0 이 되어 체감 속도를 깎지 않는다.
 */
export const settle = (startedAt: number, minMs: number) => sleep(minMs - (Date.now() - startedAt));
