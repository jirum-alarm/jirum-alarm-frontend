import { type ClipboardEvent, useState } from 'react';

type Flash = { type: 'ok' | 'error'; text: string };

/** 붙여넣은 원문 → 저장할 값(payload)과 칸에 보일 요약(display). 못 읽으면 null */
export type SessionParser = (raw: string) => { payload: string; display: string } | null;

type Options = {
  parse: SessionParser;
  /** 붙여넣기에서 값을 못 찾았을 때 */
  pasteError: string;
  /** 붙여넣기 성공 안내. null 이면 안내 없음 */
  pasteOk: (raw: string, payload: string) => string | null;
  /** 저장을 눌렀는데 값이 없을 때 */
  emptyError: string;
  savedText: string;
  saveFailText: string;
};

/**
 * 세션 갱신 카드 공통 상태 — 원문(토큰·쿠키)은 화면에 남기지 않고 요약만 보인다.
 * 저장 값은 붙여넣기에서 뽑아 두고, 손으로 친 경우엔 칸의 글자를 다시 읽는다.
 */
export const useSessionForm = ({
  parse,
  pasteError,
  pasteOk,
  emptyError,
  savedText,
  saveFailText,
}: Options) => {
  const [payload, setPayload] = useState('');
  const [display, setDisplay] = useState('');
  const [message, setMessage] = useState<Flash | null>(null);

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (!pasted.trim()) return;
    e.preventDefault();
    const parsed = parse(pasted);
    if (!parsed) {
      setPayload('');
      setDisplay('');
      setMessage({ type: 'error', text: pasteError });
      return;
    }
    setPayload(parsed.payload);
    setDisplay(parsed.display);
    const ok = pasteOk(pasted, parsed.payload);
    setMessage(ok ? { type: 'ok', text: ok } : null);
  };

  /** 저장할 값을 꺼낸다. 없으면 안내를 띄우고 null */
  const takePayload = () => {
    const parsed = parse(payload || display);
    if (!parsed) {
      setMessage({ type: 'error', text: emptyError });
      return null;
    }
    setMessage(null);
    return parsed.payload;
  };

  /** 저장 결과 반영 — 성공이면 칸을 비우고 상태를 다시 읽는다 */
  const onSaved = (ok: boolean, refetch: () => unknown) => {
    if (!ok) {
      setMessage({ type: 'error', text: saveFailText });
      return;
    }
    setMessage({ type: 'ok', text: savedText });
    setPayload('');
    setDisplay('');
    refetch();
  };

  const onSaveError = (e: Error) => setMessage({ type: 'error', text: e.message });

  return {
    value: display,
    onChange: setDisplay,
    onPaste,
    message,
    takePayload,
    onSaved,
    onSaveError,
  };
};
