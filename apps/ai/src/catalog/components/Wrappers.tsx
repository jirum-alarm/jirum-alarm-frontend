import React from 'react';

import CommunityReview from '../../features/answer/ui/CommunityReview';
import ExampleChips from '../../features/answer/ui/ExampleChips';

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export const Card = ({ children }: { children: React.ReactNode }) => (
  <p className="text-15 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 leading-relaxed text-gray-800">
    {children}
  </p>
);

export const SectionLabel = ({ title, aside }: { title: string; aside?: React.ReactNode }) => (
  <div className="mb-2 flex items-baseline justify-between gap-2">
    <span className="text-sm font-bold text-gray-900">{title}</span>
    {aside != null && <span className="text-11 shrink-0 text-gray-500 tabular-nums">{aside}</span>}
  </div>
);

export function Verdict({
  props,
}: {
  props: {
    dealCount: number;
    lowest: number | null;
    tier?: 'S' | 'A' | 'B' | 'C';
    average?: number;
  };
}) {
  const getTierConfig = (tier?: string) => {
    switch (tier) {
      case 'S':
        return {
          label: '무조건 사세요',
          color: 'bg-success-500',
          bg: 'from-success-500 to-success-700',
          text: 'text-success-50',
        };
      case 'A':
        return {
          label: '가격이 좋아요',
          color: 'bg-secondary-500',
          bg: 'from-secondary-500 to-secondary-700',
          text: 'text-secondary-50',
        };
      case 'B':
        return {
          label: '평범한 가격이에요',
          color: 'bg-warning-500',
          bg: 'from-warning-500 to-warning-600',
          text: 'text-warning-50',
        };
      case 'C':
        return {
          label: '지금은 비싸요',
          color: 'bg-error-500',
          bg: 'from-error-500 to-error-600',
          text: 'text-error-50',
        };
      default:
        return {
          label: '최저가 발견!',
          color: 'bg-secondary-500',
          bg: 'from-secondary-500 to-secondary-700',
          text: 'text-secondary-50',
        };
    }
  };

  const config = getTierConfig(props.tier);

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br ${config.bg} relative mt-1 mb-2 overflow-hidden px-6 py-6 text-white shadow-lg`}
    >
      {/* Decorative flair */}
      <div className="pointer-events-none absolute top-0 right-0 -mt-8 -mr-8 size-32 rounded-full bg-white opacity-10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col gap-1.5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-11 inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 font-bold backdrop-blur-sm">
            {props.tier ? `${props.tier}급 핫딜` : '핫딜 분석'}
          </span>
          <span className="text-sm font-bold tracking-tight">{config.label}</span>
        </div>

        {props.lowest != null ? (
          <div>
            <span className={`text-13 ${config.text} mb-0.5 block font-medium opacity-90`}>
              현재 찾은 최저가
            </span>
            <div className="mt-0.5 flex items-baseline gap-1">
              <b className="text-[40px] leading-none font-extrabold tracking-tighter tabular-nums drop-shadow-sm">
                {props.lowest.toLocaleString('ko-KR')}
              </b>
              <span className="text-xl font-bold opacity-90">원</span>
            </div>
            {props.average != null && props.average > props.lowest && (
              <div className="mt-2 inline-block rounded-md bg-black/10 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                평균가 {props.average.toLocaleString()}원 대비{' '}
                <b className="text-white">{(props.average - props.lowest).toLocaleString()}원</b>{' '}
                저렴해요!
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 text-xl font-bold">현재 핫딜을 찾지 못했어요</div>
        )}
      </div>
    </div>
  );
}

export function Review({ props }: { props: { summary?: any; title: string } }) {
  return (
    <div className="mt-1 rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">💬</span>
        <span className="text-sm font-bold text-gray-900">커뮤니티 사람들은 이렇게 말해요</span>
      </div>

      {props.summary?.summary && (
        <blockquote className="before:bg-secondary-500 relative mt-2 mb-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 shadow-sm before:absolute before:top-2 before:bottom-2 before:left-0 before:w-1 before:rounded-r-md before:content-['']">
          &quot;{props.summary.summary}&quot;
        </blockquote>
      )}

      <div className="flex flex-wrap gap-2 text-xs font-medium">
        {props.summary?.satisfaction && (
          <span className="border-error-100 bg-error-50 text-error-700 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
            <span>❤️</span> {props.summary.satisfaction}
          </span>
        )}
        {props.summary?.price && (
          <span className="border-secondary-100 bg-secondary-50 text-secondary-700 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1">
            <span>💰</span> {props.summary.price}
          </span>
        )}
      </div>
    </div>
  );
}

export function Failure({ props }: { props: { message: string } }) {
  return (
    <p className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
      {props.message}
    </p>
  );
}
