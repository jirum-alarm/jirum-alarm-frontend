'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/shared/lib/cn';

type ViewerImage = { src: string; fallbackSrc?: string; alt: string };

/**
 * 상품 사진 크게 보기 — 검은 바탕 전체 화면. 닫기: ✕ 버튼·바탕 탭·Esc·뒤로가기.
 * 확대는 브라우저 손가락 확대에 맡긴다(touch-action: pinch-zoom — 배경 스크롤은 막고 확대만 허용). 무거운 뷰어 라이브러리를 들이지 않는다.
 *
 * 뒤로가기: 열 때 history 에 한 칸을 쌓는다(지금 state 를 복사 — Next 라우터가 자기 칸으로 알아보게).
 * 그래서 폰 뒤로가기는 페이지를 떠나지 않고 뷰어만 닫는다. ✕·바탕·Esc 로 닫을 때도 그 칸을 history.back() 으로 걷는다.
 */
function ImageViewer({ image, onClose }: { image: ViewerImage; onClose: () => void }) {
  const [src, setSrc] = useState(image.src);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    // StrictMode 이중 실행에서 두 칸 쌓지 않게 — 이미 뷰어 칸이면 그대로.
    if (!window.history.state?.imageViewer) {
      window.history.pushState({ ...window.history.state, imageViewer: true }, '');
    }
    const onPopState = () => {
      if (!window.history.state?.imageViewer) onCloseRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestViewerClose(onCloseRef.current);
    };
    window.addEventListener('popstate', onPopState);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const close = () => requestViewerClose(onClose);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      data-testid="image-viewer"
      className="bg-fixed-900 fixed inset-0 z-80 flex items-center justify-center"
      style={{ touchAction: 'pinch-zoom' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 원본 크기 그대로(확대용) — next/image 리사이즈를 거치지 않는다 */}
      <img
        src={src}
        alt={image.alt}
        className="max-h-full max-w-full object-contain"
        onError={() => {
          if (image.fallbackSrc && src !== image.fallbackSrc) setSrc(image.fallbackSrc);
        }}
      />
      <button
        ref={closeRef}
        type="button"
        aria-label="닫기"
        onClick={close}
        className="text-fixed-white bg-fixed-900/60 absolute top-[max(12px,env(safe-area-inset-top))] right-3 flex size-11 items-center justify-center rounded-full"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>,
    document.body,
  );
}

function requestViewerClose(onClose: () => void) {
  // 뷰어가 쌓은 칸이면 뒤로 — popstate 가 onClose 를 부른다. 아니면(칸이 이미 걷혔으면) 바로 닫는다.
  if (window.history.state?.imageViewer) window.history.back();
  else onClose();
}

/**
 * 누르면 크게 보는 사진. children 은 지금 그리는 사진(서버 렌더 그대로) — 감싸는 버튼만 클라이언트다.
 * 상세 대표 사진을 눌러 보는 사람이 많았는데 아무 일이 없었다(Clarity dead click 1위 화면, 2026-10-20).
 */
export default function ZoomableImage({
  src,
  fallbackSrc,
  alt,
  className,
  children,
}: {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="사진 크게 보기"
        data-image-viewer-trigger
        className={cn('block cursor-zoom-in', className)}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      {open && <ImageViewer image={{ src, fallbackSrc, alt }} onClose={() => setOpen(false)} />}
    </>
  );
}
