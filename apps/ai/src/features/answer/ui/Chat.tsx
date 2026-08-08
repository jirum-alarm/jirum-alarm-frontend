'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { isBlocked, QUOTA } from '../model/quota';

import AnswerBubble, { type KeyedBlock } from './AnswerBubble';
import AnswerSkeleton from './AnswerSkeleton';
import { AskContext } from './AskContext';
import Composer from './Composer';
import QuotaWall from './QuotaWall';
import Stages from './Stages';

import type { AskEvent } from '../model/answer';
import type { StoredTurn } from '../model/conversation';
import type { QuotaState, Tier } from '../model/quota';

/**
 * 멀티턴 대화 한 방.
 *
 * ★이전 구조는 "질문 하나 = URL 하나"라 질문할 때마다 리마운트되고 앞 답변이 사라졌다.
 * 이제 한 방에 턴이 쌓이고, 대화 id 로 새로고침·공유가 성립한다.
 *
 * 서버가 대화를 저장하므로 프론트는 **화면 상태만** 들고 있다 —
 * 복원은 `initialTurns`(서버 조회 결과)로 들어온다.
 */

/** 화면에 그리는 턴. 진행 중인 assistant 턴도 같은 모양이라 렌더가 한 갈래다. */
type ViewTurn =
  | { role: 'user'; text: string }
  /**
   * `stages` 는 **턴마다** 들고 있다. 전역 배열 하나로 두면 다음 질문에서 초기화되어
   * 지난 턴의 근거("무엇을 보고 답했나")가 사라진다 — 그 추적이 이 앱의 신뢰 장치라
   * 답변 옆에 계속 남아야 한다(Stages.tsx 주석).
   */
  | { role: 'assistant'; blocks: KeyedBlock[]; stages: string[] };

export default function Chat({
  tier,
  conversationId: initialConversationId = null,
  initialTurns = [],
  pendingQuestion = null,
}: {
  tier: Tier;
  /** 기존 대화면 id. 새 대화면 null 이고 서버가 첫 이벤트로 알려준다. */
  conversationId?: string | null;
  /** 저장된 대화 복원분. 스트리밍 없이 그대로 그린다. */
  initialTurns?: StoredTurn[];
  /** 홈에서 넘어온 첫 질문. 있으면 마운트 직후 한 번 보낸다. */
  pendingQuestion?: string | null;
}) {
  const [turns, setTurns] = useState<ViewTurn[]>(() =>
    initialTurns.map((t, ti) =>
      t.role === 'user'
        ? { role: 'user' as const, text: t.text }
        : {
            role: 'assistant' as const,
            // 복원분은 서버 이벤트 id 가 없다 — 턴·순번으로 안정적인 키를 만든다
            blocks: t.blocks.map((block, i) => ({ id: `t${ti}-${i}`, block })),
            // 저장된 대화엔 단계 기록이 없다(블록만 저장) — 빈 배열이면 Stages 가 안 그려진다
            stages: [],
          },
    ),
  );
  const [busy, setBusy] = useState(false);
  const conversationId = useRef(initialConversationId);
  const tailRef = useRef<HTMLDivElement>(null);

  /**
   * 쿼터. null 은 "아직 안 읽음" — localStorage 는 서버에 없으므로
   * 첫 렌더에서 읽으면 hydration 이 어긋난다. 마운트 후에 채운다.
   *
   * ⚠️ 이건 **표시용**이다. 진짜 강제는 chat 서버(`chat_quota`)가 한다 —
   * 로컬 카운터는 지우면 리셋되므로 방어가 아니다.
   */
  const [quota, setQuota] = useState<QuotaState | null>(null);

  /**
   * ★★벽은 **카운터에서 파생시키지 않는다.**
   *
   * 예전엔 `walled = isBlocked(quota)` 였는데, 마지막 1회를 쓰는 순간 서버가
   * `used = limit` 을 보내므로 **그 답변이 스트리밍되는 중에 벽이 같이 떴다**
   * (사용자 제보 3회. 증상만 두 번 고치고 원인을 못 짚었던 게 이 파생 관계다).
   *
   * 벽의 의미는 "카운터가 0이다"가 아니라 **"방금 질문이 거절됐다"** 이므로,
   * 실제로 막힌 순간에만 세운다. 다음 질문을 하면 다시 판정된다.
   * 남은 횟수 표시(`quota`)는 계속 카운터를 쓴다 — 그건 상태가 맞다.
   */
  const [blockedTier, setBlockedTier] = useState<Tier | null>(null);
  const walled = blockedTier != null;

  /*
   * 방에 들어오면 서버에서 진짜 쿼터를 읽는다(소비 없음).
   * 이걸 안 하면 질문을 보내기 전까지 남은 횟수를 알 수 없어 화면이 비어 보인다.
   */
  useEffect(() => {
    let alive = true;
    fetch('/api/quota')
      .then((r) => (r.ok ? r.json() : null))
      .then((q: { tier: Tier; used: number } | null) => {
        if (!alive || !q) return;
        /*
         * ⚠️ 스트림이 준 값을 덮어쓰지 않는다. 이 조회는 마운트 직후 나가는데
         * 질문도 동시에 나가므로, 응답이 **스트림의 `quota` 이벤트보다 늦게** 도착하면
         * 질문 전 값(used=0)으로 되돌려 "남은 3회"가 그대로 남는다(실측 2026-08-08).
         * 이미 채워져 있으면 스트림 쪽이 더 최신이므로 건드리지 않는다.
         */
        setQuota((prev) => prev ?? { tier: q.tier, used: q.used });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  /**
   * 스크롤 정책.
   *
   * ★이전 구현은 `isNearBottom()` 으로 "유저가 위로 올려 읽는 중인지"를 추정했는데,
   * smooth 스크롤이 비동기라 scrollY 가 아직 안 움직인 사이 scrollHeight 만 커진다.
   * 그래서 첫 블록 도착 순간 조건이 false 로 뒤집히고 **영구히 복구되지 않았다**
   * (실측: 533px 스크롤 가능한데 scrollY 0 고정 — 2번째 질문은 답이 통째로 화면 밖).
   *
   * 위치를 추정하지 말고 **유저의 실제 개입만** 신호로 쓴다.
   */
  const userScrolledUp = useRef(false);

  useEffect(() => {
    const onIntervene = (e: Event) => {
      // 휠은 위로 굴린 것만, 터치는 방향을 못 보므로 개입으로 친다
      if (e.type === 'wheel' && (e as WheelEvent).deltaY >= 0) return;
      userScrolledUp.current = true;
    };
    addEventListener('wheel', onIntervene, { passive: true });
    addEventListener('touchmove', onIntervene, { passive: true });
    return () => {
      removeEventListener('wheel', onIntervene);
      removeEventListener('touchmove', onIntervene);
    };
  }, []);

  useEffect(() => {
    if (userScrolledUp.current) return;
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, busy]);

  /** 진행 중 assistant 턴에 블록을 넣는다(항상 마지막 턴). */
  const putBlock = useCallback((id: string, block: KeyedBlock['block']) => {
    setTurns((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role !== 'assistant') return prev;
      return [...prev.slice(0, -1), { ...last, blocks: [...last.blocks, { id, block }] }];
    });
  }, []);

  /** 진행 중 assistant 턴에 단계를 누적한다. 턴마다 따로 남아 지난 근거가 사라지지 않는다. */
  const addStage = useCallback((label: string) => {
    setTurns((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role !== 'assistant') return prev;
      return [...prev.slice(0, -1), { ...last, stages: [...last.stages, label] }];
    });
  }, []);

  /**
   * `patch` — 기존 text 블록에 토큰을 이어붙인다.
   * id 로 찾으므로 도착 순서와 무관하고, 블록이 아직 없으면 조용히 버린다(구 클라 방어).
   */
  const appendDelta = useCallback((id: string, delta: string) => {
    setTurns((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role !== 'assistant') return prev;
      const blocks = last.blocks.map((kb) =>
        kb.id === id && kb.block.kind === 'text'
          ? { ...kb, block: { ...kb.block, markdown: kb.block.markdown + delta } }
          : kb,
      );
      return [...prev.slice(0, -1), { ...last, blocks }];
    });
  }, []);

  const ask = useCallback(
    async (question: string, signal: AbortSignal) => {
      /*
       * ★★**선확인(preflight)** — 보내기 **전에** 서버에 남은 횟수를 물어본다.
       *
       * 왜 이 구조인가: 예전엔 일단 보내고 429 를 받아 화면을 고쳤는데, 그 사이에
       * 유저 말풍선·스켈레톤이 이미 그려져서 **"답변 중인데 다 썼어요"가 같이 뜨는**
       * 어긋난 순간이 생겼다. 로컬 카운터로 막는 건 더 나쁘다 — 서버와 어긋난다
       * (실측: 로컬 3=차단인데 서버는 2=허용).
       *
       * 그래서 **판정자는 서버 하나로 두되, 묻는 시점을 앞으로 당긴다.**
       * 소진이면 질문 자체가 시작되지 않으므로 답변과 벽이 겹칠 수가 없다.
       *
       * 이건 우회 가능한 방어가 아니라 **UX 게이트**다 — 진짜 강제는 여전히
       * `/ask` 의 원자적 증가(+429)가 한다. 선확인을 건너뛰어도 서버가 막는다.
       */
      const pre = await fetch('/api/quota', { cache: 'no-store', signal })
        .then((r) =>
          r.ok ? (r.json() as Promise<{ tier: Tier; used: number; limit: number }>) : null,
        )
        .catch(() => null);

      if (pre && pre.used >= pre.limit) {
        setQuota({ tier: pre.tier, used: pre.used });
        setBlockedTier(pre.tier);
        return; // 턴을 만들지 않는다 — 벽만 뜬다
      }
      if (pre) setQuota({ tier: pre.tier, used: pre.used });

      // 새 질문이 통과했으면 이전 벽은 걷는다(로그인·리셋 후 재시도 등)
      setBlockedTier(null);

      // 유저 턴 + 빈 assistant 턴을 먼저 세운다 — 답이 들어올 자리를 만들어야
      // putBlock 이 "마지막 턴"을 찾을 수 있다.
      setTurns((prev) => [
        ...prev,
        { role: 'user', text: question },
        { role: 'assistant', blocks: [], stages: [] },
      ]);
      setBusy(true);

      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, conversationId: conversationId.current ?? undefined }),
          signal,
        });

        if (res.status === 429) {
          /*
           * 서버가 막았다 = 진짜 소진. 방금 세운 빈 assistant 턴을 걷어내고 벽을 세운다
           * (안 걷어내면 답 없는 빈 말풍선이 남는다).
           */
          const body = (await res.json().catch(() => null)) as {
            tier?: Tier;
            limit?: number;
          } | null;
          setTurns((prev) => prev.slice(0, -2)); // 유저 턴 + 빈 assistant 턴 둘 다 걷는다
          setQuota({ tier: body?.tier ?? tier, used: body?.limit ?? QUOTA[tier].limit });
          setBlockedTier(body?.tier ?? tier);
          return;
        }
        if (!res.body) throw new Error('no stream');

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buf = '';

        for (;;) {
          const { value, done: streamDone } = await reader.read();
          if (streamDone) break;
          buf += value;

          // NDJSON — 완성된 줄만 처리하고 잘린 꼬리는 버퍼에 남긴다
          const lines = buf.split('\n');
          buf = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            const ev = JSON.parse(line) as AskEvent;

            switch (ev.type) {
              case 'quota':
                // 서버가 정본. 화면의 "남은 횟수"와 벽은 이 값으로만 움직인다.
                setQuota({ tier: ev.tier, used: ev.used });
                break;
              case 'conversation':
                conversationId.current = ev.conversationId;
                /*
                 * URL 을 대화 id 로 바꾼다. `replaceState` 를 쓰는 이유: push 면
                 * 뒤로가기가 "질문 전 빈 방"으로 돌아가 대화가 사라진 것처럼 보인다.
                 * 라우터를 안 쓰는 이유: navigate 하면 이 컴포넌트가 리마운트돼
                 * 진행 중인 스트림이 끊긴다.
                 */
                history.replaceState(null, '', `/c/${ev.conversationId}`);
                break;
              case 'stage':
                addStage(ev.label);
                break;
              case 'block':
                putBlock(ev.id, ev.block);
                break;
              case 'patch':
                appendDelta(ev.id, ev.delta);
                break;
              case 'done':
                setBusy(false);
                break;
              case 'error':
                putBlock('err', { kind: 'failure', message: ev.message });
                setBusy(false);
                break;
            }
          }
        }
      } catch (e) {
        // 언마운트·중단으로 인한 abort 는 에러가 아니다
        if (signal.aborted) return;
        console.error('[ai] ask stream failed:', e);
        putBlock('neterr', {
          kind: 'failure',
          message: '연결이 끊겼어요. 다시 시도해 주세요.',
        });
      } finally {
        /*
         * 서버가 예외로 죽어도 스트림은 정상 종료될 수 있다 — 그 경우 done 이벤트가 없다.
         * 여기서 풀어주지 않으면 Composer 가 busy 인 채로 영구히 잠긴다.
         */
        if (!signal.aborted) setBusy(false);
      }
    },
    [tier, putBlock, appendDelta, addStage],
  );

  /**
   * 진행 중인 요청. 언마운트 때만 끊는다.
   *
   * ★★cleanup 에서 abort 하면 **StrictMode 에서 답이 영영 안 온다**(실측 2026-08-08).
   * dev 는 mount→unmount→remount 를 하는데, 순서가
   *   ① 마운트: 질문 발사(쿼터 소비)
   *   ② 언마운트: cleanup 이 그 요청을 abort
   *   ③ 리마운트: `fired.current` 가 이미 true 라 재발사 안 함
   * 이 되어 **서버는 200 으로 답했는데 화면은 "답변을 준비하고 있어요"에서 영구 정지**한다.
   * 쿼터만 깎이고 답은 못 본다. curl 로는 절대 안 잡힌다 — React 이중 마운트에서만 난다.
   *
   * 그래서 effect cleanup 이 아니라 **ref 에 담아두고 언마운트 시 한 번만** 끊는다.
   */
  const inFlight = useRef<AbortController | null>(null);

  /*
   * ⚠️ **여기서 언마운트 abort 를 하지 않는다.**
   *
   * StrictMode(dev)는 mount→unmount→remount 를 흉내내므로, cleanup 에 abort 를 걸면
   * 방금 발사한 요청을 **자기가 죽인다**. 실측 2026-08-08: Next 로그에 `Compiled /api/ask`
   * 는 찍히는데 `POST /api/ask 200` 이 안 찍혔다(=요청이 시작됐다가 중단됨).
   * 화면은 "답변을 준비하고 있어요"에서 영구 정지하고 쿼터만 깎인다.
   *
   * 진짜 이탈(탭 닫기·페이지 이동)은 브라우저가 커넥션을 끊고, chat 서버가
   * `res.on('close')` 로 감지해 도구 루프를 멈춘다 — 서버 쪽 방어가 이미 있으므로
   * 클라에서 굳이 언마운트 abort 를 걸 이유가 없다.
   * (프로덕션 빌드엔 StrictMode 이중 마운트가 없지만, dev 에서 앱이 안 도는 게 더 큰 손해다.)
   */

  const start = useCallback(
    (question: string) => {
      /*
       * 연타 방지용 abort 도 걸지 않는다 — StrictMode 이중 호출에서 자기 요청을 죽인다.
       * 중복 전송은 `busy` 로 막는다(Composer 의 전송 버튼이 disabled 된다).
       */
      const ac = new AbortController();
      inFlight.current = ac;
      void ask(question, ac.signal);
    },
    [ask],
  );

  /** 홈에서 넘어온 첫 질문 자동 발사. 한 번만 — StrictMode 이중 실행도 막는다. */
  const fired = useRef(false);
  useEffect(() => {
    if (!pendingQuestion || fired.current) return;
    fired.current = true;
    start(pendingQuestion);
  }, [pendingQuestion, start]);

  /** 입력창·되묻기 칩에서 오는 새 질문. */
  const submit = useCallback((question: string) => start(question), [start]);

  return (
    <AskContext.Provider value={submit}>
      <div className="flex flex-1 flex-col gap-3.5 pt-4 pb-2">
        {turns.map((turn, i) =>
          turn.role === 'user' ? (
            <p
              key={`u${i}`}
              className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-gray-900 px-4 py-2.5 text-[14.5px] font-medium text-white md:max-w-[70%]"
            >
              {turn.text}
            </p>
          ) : (
            <div key={`a${i}`} className="flex flex-col gap-3">
              {/*
               * ★단계(작업 추적)는 **답변 위**에 온다. 순서가 뒤집히면
               * "무엇을 근거로 답했나"가 답 아래로 밀려 근거→결론 흐름이 깨진다
               * (단발 구조일 때의 배치가 원래 이랬는데 멀티턴으로 옮기며 뒤집혔다).
               * 진행 중인 마지막 턴에만 붙인다.
               */}
              {turn.stages.length > 0 && (
                <Stages stages={turn.stages} done={i !== turns.length - 1 || !busy} />
              )}
              <AnswerBubble blocks={turn.blocks} />
              {/* 아직 블록이 하나도 없으면 답이 들어올 자리를 스켈레톤으로 잡아둔다 */}
              {i === turns.length - 1 && busy && turn.blocks.length === 0 && <AnswerSkeleton />}
            </div>
          ),
        )}

        {walled && <QuotaWall tier={blockedTier} />}

        {/* scroll-mb: 하단 sticky 입력바(약 88px) 뒤에 마지막 블록이 가리지 않게 */}
        <div ref={tailRef} className="h-4 scroll-mb-24" />
      </div>

      {/* 헤더와 같은 이유로 배경만 전폭. 데스크톱에서 흰 띠가 잘려 보이지 않게 */}
      <div className="sticky bottom-0 -mx-[50vw] w-screen self-center bg-white/85 px-[calc(50vw-min(50vw,240px)+1rem)] pt-3 pb-5 backdrop-blur md:px-[calc(50vw-min(50vw,360px)+1.5rem)]">
        <Composer busy={busy} quota={quota} inRoom onSubmit={submit} />
      </div>
    </AskContext.Provider>
  );
}
