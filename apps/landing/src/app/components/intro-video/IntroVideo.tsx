'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/libs/cn';

import SectionHeader from '../SectionHeader';

// 소개 영상(33초). 원본·렌더 스크립트는 레포 밖 — 다시 만들면 같은 경로·파일명으로 덮어쓴다.
// 폰은 세로, 넓은 화면은 가로. 안 보이는 쪽은 preload="none" 이라 내려받지 않는다.
// 영상 속 커뮤니티 수(3·6·23초 장면)와 이름 줄은 @jirum/domain/service-facts 와 같아야 한다 — 크롤러가 바뀌면 영상도 다시 굽는다.
// 포스터는 그 「N개 커뮤니티 핫딜을 한곳에」 장면(7.5초).
const VIDEOS = [
  {
    key: 'portrait',
    src: '/assets/videos/intro-9x16.mp4',
    poster: '/assets/videos/intro-9x16-poster.webp',
    className: 'aspect-9/16 max-w-90 md:hidden',
  },
  {
    key: 'landscape',
    src: '/assets/videos/intro-16x9.mp4',
    poster: '/assets/videos/intro-16x9-poster.webp',
    className: 'hidden aspect-video max-w-240 md:block',
  },
] as const;

type Gtag = (command: 'event', name: string, params: Record<string, unknown>) => void;

const track = (name: string, params: Record<string, unknown> = {}) => {
  (window as unknown as { gtag?: Gtag }).gtag?.('event', name, params);
};

const IntroVideo = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sent = useRef({ play: false, complete: false });
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // 지금 화면에 보이는 쪽(세로/가로) 영상
  const visibleVideo = () => videoRefs.current.find((v) => v && v.offsetParent !== null) ?? null;

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 사용자 설정은 브라우저에만 있다(서버 HTML 과 첫 렌더를 맞춘다).
    setReduceMotion(reduce);
    const section = sectionRef.current;
    if (!section) return;
    // 반쯤 보이면 소리 없이 재생, 벗어나면 멈춘다. 움직임 줄이기를 켠 사람에겐 자동 재생하지 않는다.
    const io = new IntersectionObserver(
      ([entry]) => {
        const video = visibleVideo();
        if (!video) return;
        if (entry.isIntersecting && !reduce) void video.play().catch(() => {});
        else if (!entry.isIntersecting) video.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  const onPlay = (key: string) => {
    setPlaying(true);
    if (sent.current.play) return;
    sent.current.play = true;
    track('landing_video_play', { video_orientation: key });
  };

  // loop 라 ended 가 안 온다 — 끝 0.5초 안에 들어오면 한 번 다 본 것으로 센다.
  const onTimeUpdate = (video: HTMLVideoElement, key: string) => {
    if (sent.current.complete || !video.duration || video.currentTime < video.duration - 0.5)
      return;
    sent.current.complete = true;
    track('landing_video_complete', { video_orientation: key, with_sound: !video.muted });
  };

  const toggleSound = () => {
    const video = visibleVideo();
    if (!video) return;
    const nextMuted = !muted;
    video.muted = nextMuted;
    if (!nextMuted) {
      // 소리는 처음부터 들어야 흐름이 맞는다(중간에 켜면 장면 한가운데서 음악이 시작된다).
      video.currentTime = 0;
      void video.play().catch(() => {});
      track('landing_video_unmute', { video_orientation: video.dataset.key });
    }
    setMuted(nextMuted);
  };

  const playManually = () => {
    const video = visibleVideo();
    if (!video) return;
    void video.play().catch(() => {});
  };

  return (
    <section
      ref={sectionRef}
      className="flex w-full flex-col items-center bg-gray-50 py-20 lg:py-32"
    >
      <SectionHeader
        keyword="30초 영상"
        title={
          <>
            <span>찾아다니지 마세요</span>
            <br />
            <span>핫딜이 먼저 찾아와요</span>
          </>
        }
        className="pb-8 lg:pb-14"
      />
      <div className="flex w-full justify-center px-5">
        {VIDEOS.map((v, i) => (
          <div
            key={v.key}
            className={cn('relative w-full overflow-hidden rounded-3xl bg-gray-900', v.className)}
          >
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              data-key={v.key}
              className="h-full w-full object-cover"
              src={v.src}
              poster={v.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-label="지름알림 소개 영상: 키워드를 등록하면 원하는 핫딜이 올라올 때 알림이 오고, 지난 1년 핫딜과 가격을 비교해 보여 준다"
              onPlay={() => onPlay(v.key)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => onTimeUpdate(e.currentTarget, v.key)}
            />
            {reduceMotion && !playing ? (
              <button
                type="button"
                onClick={playManually}
                className="absolute inset-0 flex items-center justify-center bg-black/30"
                aria-label="영상 재생"
              >
                <span className="bg-primary-500 text-fixed-900 flex size-16 items-center justify-center rounded-full">
                  <PlayIcon />
                </span>
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleSound}
              className="text-fixed-50 absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2 text-sm font-semibold lg:right-5 lg:bottom-5"
              aria-label={muted ? '소리 켜고 처음부터 보기' : '소리 끄기'}
            >
              {muted ? <MutedIcon /> : <SoundIcon />}
              {muted ? '소리 켜기' : '소리 끄기'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

const PlayIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
  </svg>
);

const MutedIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M11 5L6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6" />
  </svg>
);

const SoundIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M11 5L6 9H3v6h3l5 4V5zM15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14" />
  </svg>
);

export default IntroVideo;
