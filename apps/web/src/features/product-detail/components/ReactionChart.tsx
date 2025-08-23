'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

import { ArrowRight, Thumbsdown, Thumbsup } from '@/components/common/icons';
import { cn } from '@/lib/cn';

const DISABLED_COLOR = '#D0D5DD';
const nanSafe = (num: number) => (isNaN(num) ? 0 : num);

export type ReactionChartProps = {
  positiveCount: number;
  negativeCount: number;
  allCount: number;
  url: string;
  provider: string;
  disabled?: boolean;
};

export function ReactionChart({
  positiveCount,
  negativeCount,
  allCount,
  url,
  provider,
  disabled,
}: ReactionChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 'all' });
  const positivePercent = nanSafe((positiveCount / allCount) * 100);
  const negativePercent = nanSafe((negativeCount / allCount) * 100);

  const isPositive = positivePercent >= 50;

  const radius = 217 / 2;
  const stroke = 14;
  const circumference = Math.PI * radius;

  const percent = (isPositive ? positivePercent : negativePercent) / 100;
  const color = isPositive ? '#467DFB' : '#F36677';

  const strokeLinecap = 'round';

  return (
    <div ref={ref} className="rounded-xl bg-white pb-5">
      <div className="flex justify-between">
        <div className="flex items-center gap-x-1.5 px-4 pt-4 pb-3">
          {/* TODO: Add last updated at */}
        </div>

        <div className="flex items-center gap-x-1.5 px-4 pt-4 pb-3">
          <a
            className="text-secondary-500 text flex h-full items-center gap-x-1 font-semibold"
            href={url}
            aria-label={`${provider ?? '커뮤니티'} 반응 보기`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>{provider ?? '커뮤니티'} 반응 보기</span>
            <span className="bg-secondary-500 flex size-5 items-center justify-center rounded-3xl">
              <ArrowRight color="#FFFFFF" width={16} height={16} strokeWidth={1.5} />
            </span>
          </a>
        </div>
      </div>
      <div className="relative flex w-full flex-col items-center justify-center">
        <div className="flex h-[140px] w-[217px] justify-center">
          <svg
            width="217"
            height="115"
            viewBox="0 0 217 115"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(5, 10)">
              {/* 배경 반원 */}
              <path
                d="M7.20996 95.9719C10.9267 46.2193 52.7747 7 103.852 7C154.929 7 196.777 46.2193 200.494 95.9719"
                stroke="#E4E7EC"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={0}
                strokeLinecap={strokeLinecap}
              />

              {/* 진행 반원 */}
              {percent && isInView && (
                <motion.path
                  d="M7.20996 95.9719C10.9267 46.2193 52.7747 7 103.852 7C154.929 7 196.777 46.2193 200.494 95.9719"
                  fill="transparent"
                  stroke={disabled ? DISABLED_COLOR : color}
                  strokeWidth={stroke}
                  strokeLinecap={strokeLinecap}
                  // 경로를 1로 정규화
                  pathLength={1}
                  initial={{
                    strokeDasharray: !disabled ? '0 1' : `${percent} 1`,
                    strokeDashoffset: isPositive ? 0 : 1,
                  }}
                  animate={{
                    strokeDasharray: `${percent} 1`,
                    strokeDashoffset: isPositive ? 0 : 1,
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              )}
            </g>
          </svg>
        </div>

        <div className="absolute bottom-0 mx-auto mt-1 flex w-[217px] items-end justify-between">
          <span className="text-sm font-medium text-gray-500">
            {disabled ? '-' : positiveCount}명
          </span>
          <div>
            <div
              className={cn([
                'text-center text-[44px] leading-[44px] font-semibold text-gray-800',
                disabled && 'text-gray-400',
              ])}
            >
              {disabled ? '00' : positivePercent.toFixed(0)}
              <span className="text-semibold ml-[1px] text-2xl text-gray-400">%</span>
            </div>
            <div className="flex items-center justify-center gap-x-0.5">
              {!disabled &&
                (isPositive ? (
                  <>
                    <span className="text-sm text-gray-500">추천해요</span>
                    <Thumbsup className="size-4.5" active />
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-500">비추천해요</span>
                    <Thumbsdown className="size-4.5" active />
                  </>
                ))}
              {disabled && <span className="text-sm text-gray-500">반응 수집중</span>}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">
            {disabled ? '-' : negativeCount}명
          </span>
        </div>
      </div>
    </div>
  );
}
