'use client';

import { useEffect, useRef, useState } from 'react';

import AnswerBubble from './AnswerBubble';
import Stages from './Stages';

import type { AnswerBlock } from '../model/answer';
import type { AskEvent } from '@/app/api/ask/route';

const EXAMPLES = ['콜라 요즘 얼마', '라면 시세', '기저귀 최저가', '무선이어폰', '생수'] as const;

type Turn = {
  id: number;
  question: string;
  stages: string[];
  blocks: AnswerBlock[];
  done: boolean;
};

/** 이 정도 안쪽이면 "바닥을 보고 있다"고 본다. */
const NEAR_BOTTOM_PX = 120;

const isNearBottom = () =>
  window.innerHeight + window.scrollY >= document.body.scrollHeight - NEAR_BOTTOM_PX;

export default function Chat() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const tailRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  /** 새 질문을 보낸 직후 한 번만 강제 스크롤. 블록마다 끌어내리지 않는다. */
  const jumpToTail = useRef(false);

  const started = turns.length > 0;

  /**
   * 스크롤 정책 (블록 스트리밍 UI 의 핵심 UX):
   * - 새 질문 → 질문 말풍선이 보이도록 한 번 이동
   * - 블록 도착 → **유저가 이미 바닥 근처일 때만** 따라간다.
   *   위로 올려 읽고 있으면 건드리지 않는다(읽는 중에 끌어내리면 최악).
   *
   * 이전 구현은 `[turns]` 에 의존해 블록마다(답변당 6회 이상) 강제 스크롤했고,
   * 사용자가 "너무 빠르게 내려간다"고 지적한 원인이었다.
   */
  useEffect(() => {
    if (!started) return;
    const el = tailRef.current;
    if (!el) return;

    if (jumpToTail.current) {
      jumpToTail.current = false;
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      return;
    }
    if (isNearBottom()) el.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, started]);

  const patch = (id: number, fn: (t: Turn) => Turn) =>
    setTurns((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));

  const send = async (raw: string) => {
    const q = raw.trim().slice(0, 40);
    if (!q || busy) return;

    const id = ++seq.current;
    jumpToTail.current = true; // 새 질문은 한 번 강제로 보여준다
    setTurns((prev) => [...prev, { id, question: q, stages: [], blocks: [], done: false }]);
    setDraft('');
    setBusy(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: q }),
      });
      if (!res.body) throw new Error('no stream');

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buf = '';

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += value;

        // NDJSON — 완성된 줄만 처리하고 잘린 꼬리는 버퍼에 남긴다
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          const ev = JSON.parse(line) as AskEvent;
          if (ev.type === 'stage') {
            patch(id, (t) => ({ ...t, stages: [...t.stages, ev.label] }));
          } else if (ev.type === 'block') {
            patch(id, (t) => ({ ...t, blocks: [...t.blocks, ev.block] }));
          } else if (ev.type === 'done') {
            patch(id, (t) => ({ ...t, done: true }));
          } else {
            patch(id, (t) => ({
              ...t,
              blocks: [...t.blocks, { kind: 'failure', message: ev.message }],
              done: true,
            }));
          }
        }
      }
    } catch {
      patch(id, (t) => ({
        ...t,
        blocks: [...t.blocks, { kind: 'failure', message: '연결이 끊겼어요. 다시 시도해 주세요.' }],
        done: true,
      }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!started && (
        <header className="pt-16 pb-7 text-center md:pt-24">
          <p className="mb-2 text-[13px] font-medium text-gray-500">지름알람</p>
          <h1 className="text-[26px] leading-tight font-bold tracking-tight text-gray-900 md:text-[34px]">
            뭐가 싼지 물어보세요
          </h1>
          <p className="mt-2 text-[13.5px] text-gray-500">
            최근 핫딜 데이터로 시세를 계산해서 알려드려요
          </p>
        </header>
      )}

      {started && (
        <div className="flex flex-1 flex-col gap-7 pt-6 pb-2">
          {turns.map((t) => (
            <div key={t.id} className="flex flex-col gap-3.5">
              <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-gray-900 px-4 py-2.5 text-[14.5px] font-medium text-white md:max-w-[70%]">
                {t.question}
              </p>
              <Stages stages={t.stages} done={t.done} />
              <AnswerBubble blocks={t.blocks} />
            </div>
          ))}
          <div ref={tailRef} className="h-4" />
        </div>
      )}

      <div
        className={
          started
            ? 'sticky bottom-0 -mx-4 bg-white/85 px-4 pt-3 pb-5 backdrop-blur md:-mx-6 md:rounded-t-2xl md:px-6'
            : ''
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="relative"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="예) 콜라 요즘 얼마"
            aria-label="검색어"
            maxLength={40}
            enterKeyHint="send"
            className="focus-visible:outline-secondary-400 h-[52px] w-full rounded-full border border-gray-300 bg-white pr-[52px] pl-[46px] text-[15px] shadow-sm placeholder:text-gray-400 focus-visible:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1"
          />
          <svg
            className="pointer-events-none absolute top-[17px] left-4 size-[18px] text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <button
            type="submit"
            disabled={busy || draft.trim().length === 0}
            aria-label="물어보기"
            className="tappable absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-gray-900 text-white disabled:opacity-25"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </form>

        {!started && (
          <div className="mt-5">
            <p className="mb-2.5 text-xs font-medium text-gray-400">이렇게 물어보세요</p>
            <ul className="flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <li key={e}>
                  <button
                    type="button"
                    onClick={() => void send(e)}
                    className="tappable rounded-full border border-gray-200 bg-white/70 px-3.5 py-2 text-[13px] text-gray-700 active:border-gray-400 active:bg-gray-50"
                  >
                    {e}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
