'use client';

import { useEffect, useRef, useState } from 'react';

import { isBlocked } from '../model/quota';
import { readQuota, spendQuota } from '../model/quotaStore';

import AnswerBubble from './AnswerBubble';
import AnswerSkeleton from './AnswerSkeleton';
import Composer from './Composer';
import QuotaWall from './QuotaWall';
import Stages from './Stages';

import type { AnswerBlock } from '../model/answer';
import type { QuotaState, Tier } from '../model/quota';
import type { AskEvent } from '@/app/api/ask/route';

/**
 * 한 방 = 한 질문. 질문을 또 하면 Composer 가 새 URL 로 push 하고
 * 이 컴포넌트는 key 로 리마운트된다 — 뒤로가기가 직전 질문으로 돌아간다.
 *
 * 답변은 저장하지 않는다. 앞으로가기로 돌아오면 같은 질문을 다시 스트리밍한다.
 */
export default function Chat({ question, tier }: { question: string; tier: Tier }) {
  const [stages, setStages] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<AnswerBlock[]>([]);
  const [done, setDone] = useState(false);
  const tailRef = useRef<HTMLDivElement>(null);

  /**
   * 쿼터. null 은 "아직 안 읽음" — localStorage 는 서버에 없으므로
   * 첫 렌더에서 읽으면 hydration 이 어긋난다. 마운트 후에 채운다.
   */
  const [quota, setQuota] = useState<QuotaState | null>(null);
  const walled = quota != null && isBlocked(quota);

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
  }, [stages, blocks, done]);

  useEffect(() => {
    if (!question) return;

    /*
     * 소비는 스트림 시작 **전에** 한 번. 남아 있으면 쓰고, 없으면 벽을 세우고 끝낸다.
     * 여기서 `spendQuota` 가 돌려준 상태를 그대로 쓰는 이유: 소비 직후의 값이라
     * 이 질문이 마지막 1회였는지를 같은 렌더에서 알 수 있다.
     */
    const before = readQuota(tier);
    if (isBlocked(before)) {
      setQuota(before);
      setDone(true);
      return;
    }
    setQuota(spendQuota(tier));

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: question }),
          signal: ac.signal,
        });
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
            if (ev.type === 'stage') {
              setStages((prev) => [...prev, ev.label]);
            } else if (ev.type === 'block') {
              setBlocks((prev) => [...prev, ev.block]);
            } else if (ev.type === 'done') {
              setDone(true);
            } else {
              setBlocks((prev) => [...prev, { kind: 'failure', message: ev.message }]);
              setDone(true);
            }
          }
        }

        // 서버가 예외로 죽어도 finally 가 스트림을 정상 종료시킨다 — 그 경우 done 이벤트가 없다.
        // 여기서 풀어주지 않으면 Composer 가 busy 인 채로 영구히 잠긴다.
        setDone(true);
      } catch (e) {
        // 언마운트로 인한 abort 는 에러가 아니다
        if (ac.signal.aborted) return;
        console.error('[ai] ask stream failed:', e);
        setBlocks((prev) => [
          ...prev,
          { kind: 'failure', message: '연결이 끊겼어요. 다시 시도해 주세요.' },
        ]);
        setDone(true);
      }
    })();

    return () => ac.abort();
  }, [question, tier]);

  return (
    <>
      <div className="vt-room flex flex-1 flex-col gap-3.5 pt-4 pb-2">
        {/* vt-bubble: 홈에서 누른 예시 칩이 이 버블로 날아와 앉는다(hero) */}
        <p className="vt-bubble ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-gray-900 px-4 py-2.5 text-[14.5px] font-medium text-white md:max-w-[70%]">
          {question}
        </p>
        {!walled && <Stages stages={stages} done={done} />}
        {walled ? (
          <QuotaWall tier={quota.tier} />
        ) : blocks.length === 0 && !done ? (
          <AnswerSkeleton />
        ) : (
          <AnswerBubble blocks={blocks} />
        )}
        {/* scroll-mb: 하단 sticky 입력바(약 88px) 뒤에 마지막 블록이 가리지 않게 */}
        <div ref={tailRef} className="h-4 scroll-mb-24" />
      </div>

      {/* 헤더와 같은 이유로 배경만 전폭. 데스크톱에서 흰 띠가 잘려 보이지 않게 */}
      <div className="sticky bottom-0 -mx-[50vw] w-screen self-center bg-white/85 px-[calc(50vw-min(50vw,240px)+1rem)] pt-3 pb-5 backdrop-blur md:px-[calc(50vw-min(50vw,360px)+1.5rem)]">
        <Composer busy={!done} quota={quota} inRoom />
      </div>
    </>
  );
}
