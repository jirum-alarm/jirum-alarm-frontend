'use client';

import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

import { Info, Thumbsdown, Thumbsup } from '@/components/common/icons';
import Tooltip from '@/components/common/Tooltip';
import SectionHeader from '@/components/SectionHeader';
import { cn } from '@/lib/cn';
import { ProductQuery } from '@/shared/api/gql/graphql';

import ProductReport from './ProductReport';
import ReactionKeywords from './ReactionKeywords';

const nanSafe = (num: number) => (isNaN(num) ? 0 : num);

export default function CommunityReaction({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  const positiveCount = product?.positiveCommunityReactionCount || 0;
  const negativeCount = product?.negativeCommunityReactionCount || 0;
  const allCount = positiveCount + negativeCount;

  const handleCommunityLinkClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.COMMUNITY_LINK_CLICK.NAME, {
    //   page: EVENT.PAGE.DETAIL,
    // });
  };

  return (
    <>
      {/* @TODO: remove after add hotdeal index section */}
      <section className="mb-4 px-5">
        <SectionHeader
          title={
            <>
              커뮤니티 반응
              {!!product.positiveCommunityReactionCount && (
                <span className="text-secondary-500">{product.positiveCommunityReactionCount}</span>
              )}
            </>
          }
          right={
            <div>
              <Tooltip
                align="right"
                polygonOffset={8}
                content={
                  <p className="text-[13px] text-white">
                    <strong className="font-semibold">실제 커뮤니티</strong> 사용자들의
                    <br />
                    핫딜 리뷰를 요약해 확인해요
                  </p>
                }
              >
                <button aria-label="커뮤니티 반응" title="커뮤니티 반응" className="-m-2 flex p-2">
                  <Info />
                </button>
              </Tooltip>
            </div>
          }
        />
        <div className="mt-1 flex flex-col gap-y-4">
          {allCount !== 0 ? (
            <Reaction
              positiveCount={positiveCount}
              negativeCount={negativeCount}
              allCount={allCount}
            />
          ) : (
            <NoReaction />
          )}
          <ReactionKeywords
            productId={+product.id}
            provider={product.provider.nameKr}
            url={product.url!}
          />
          <ProductReport product={product} />
        </div>
      </section>
    </>
  );
}

const Reaction = ({
  positiveCount,
  negativeCount,
  allCount,
}: {
  positiveCount: number;
  negativeCount: number;
  allCount: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 'all' });

  const positivePercent = nanSafe((positiveCount / allCount) * 100);
  const negativePercent = nanSafe((negativeCount / allCount) * 100);

  const isPositive = positivePercent >= 50;

  const radius = 58;
  const stroke = 12;
  const circumference = Math.PI * radius;

  const progress = isPositive
    ? (positivePercent / 100) * circumference
    : (negativePercent / 100) * circumference;

  const strokeLinecap = 'round';

  return (
    <div ref={ref} className="rounded-lg bg-gray-800 pb-6">
      <div className="flex justify-between pb-[10px]">
        <div className="flex items-center gap-x-1.5 px-4 pb-3 pt-4">
          {<Thumbsup active={isPositive} />}
          <span className={cn(['font-semibold', isPositive ? 'text-white' : 'text-gray-400'])}>
            구매할래요!
          </span>
        </div>

        <div className="flex items-center gap-x-1.5 px-4 pb-3 pt-4">
          <span className={cn(['font-semibold', !isPositive ? 'text-white' : 'text-gray-400'])}>
            아쉬워요
          </span>
          {<Thumbsdown active={!isPositive} />}
        </div>
      </div>
      <div className="relative flex h-[80px] w-full items-end justify-center">
        <span
          className={cn([
            isPositive ? 'font-semibold text-gray-300' : 'text-sm font-medium text-gray-400',
          ])}
        >
          {positiveCount}명
        </span>
        <div className="flex h-full w-[162px] justify-center">
          <svg
            width="162"
            height="80"
            viewBox="0 0 162 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(23, 10)">
              {/* 배경 반원 */}
              <path
                d="M 0,58 A 58,58 0 0 1 116,58"
                fill="transparent"
                stroke="#667085"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={0}
                strokeLinecap={strokeLinecap}
              />
              {/* 진행 반원 */}
              {isInView &&
                (isPositive ? (
                  <motion.path
                    d="M 0,58 A 58,58 0 0 1 116,58"
                    fill="transparent"
                    stroke={isPositive ? '#467DFB' : '#F36677'}
                    strokeWidth={stroke}
                    strokeLinecap={strokeLinecap}
                    initial={{
                      strokeDasharray: `0, ${circumference}`,
                    }}
                    animate={{
                      strokeDasharray: `${progress}, ${circumference - progress}`,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                ) : (
                  <motion.path
                    d="M 116,58 A 58,58 0 0 0 0,58"
                    fill="transparent"
                    stroke="#F36677"
                    strokeWidth={stroke}
                    strokeLinecap={strokeLinecap}
                    initial={{
                      strokeDasharray: `0, ${circumference}`,
                    }}
                    animate={{
                      strokeDasharray: `${circumference - progress}, ${progress}`,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                ))}
            </g>
          </svg>
        </div>
        <span
          className={cn([
            !isPositive ? 'font-semibold text-gray-300' : 'text-sm font-medium text-gray-400',
          ])}
        >
          {negativeCount}명
        </span>

        <div className={cn(['absolute -bottom-1 left-1/2 -translate-x-1/2'])}>
          <span
            className={cn([
              'text-[32px] font-semibold leading-[38px]',
              isPositive ? 'text-secondary-50' : 'text-error-100',
            ])}
          >
            {positivePercent.toFixed(0)}
          </span>
          <span className="absolute bottom-0 left-full text-base text-white">%</span>
        </div>
      </div>
    </div>
  );
};

const NoReaction = () => {
  return (
    <div className="flex h-[156px] items-center justify-center gap-[4px] rounded-[8px] border border-gray-200 px-[28px] py-[24px]">
      <div className="flex aspect-square w-[60px] items-center justify-center">
        <svg
          width="33"
          height="51"
          viewBox="0 0 33 51"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M26.0652 50.1309C26.1215 50.5434 25.7934 50.909 25.3809 50.909H17.2059C16.8309 50.909 16.5215 50.609 16.5215 50.2246V42.3121H16.7746C17.3934 42.3121 18.0309 42.3027 18.6871 42.2746C18.7715 42.2746 18.8559 42.2652 18.9309 42.2559L19.5121 46.9902C19.5402 47.2059 19.7277 47.3746 19.9527 47.3746H23.2902C23.2902 47.3746 25.6809 47.3746 26.0652 50.1309Z"
            fill="#98A2B3"
          />
          <path
            d="M14.8816 42.2656V50.225C14.8816 50.6094 14.5723 50.9094 14.1973 50.9094H6.02227C5.60977 50.9094 5.29102 50.5438 5.34727 50.1313C5.72227 47.375 8.12227 47.375 8.12227 47.375H11.4504C11.6754 47.375 11.8629 47.2062 11.891 46.9906L12.5004 42.0781C13.2598 42.1719 14.0473 42.2375 14.8816 42.2656Z"
            fill="#98A2B3"
          />
          <path
            d="M30.6216 31.9051C30.331 33.0863 29.8903 34.2676 29.2622 35.3926C27.1716 39.152 23.5997 41.1488 18.6591 41.3363C11.206 41.6176 6.26533 40.2863 3.52783 37.2582C1.29658 34.7738 0.555955 31.1457 1.25908 26.1582C1.31533 25.7457 1.38096 25.3426 1.43721 24.9582C1.44658 24.8738 1.46533 24.7895 1.47471 24.7051C2.64658 18.8457 3.77158 17.6645 3.77158 17.6645C3.77158 17.6645 7.39971 25.9426 9.09658 20.4957C9.49971 19.202 9.72471 17.9926 9.87471 16.8395C9.88408 16.802 9.88408 16.7551 9.89346 16.7082C10.4466 14.7395 10.6247 12.977 10.7935 11.2613C10.831 10.9051 10.8685 10.5582 10.906 10.2113V10.1832C10.906 10.1832 10.9247 10.1363 10.9341 10.1082C11.3466 8.82383 12.0028 7.51133 13.0716 6.0957C13.0716 6.0957 13.9716 12.2926 16.5872 14.0645C19.1935 15.8457 23.731 16.7832 24.7528 21.4145C25.7747 26.0551 27.0216 22.352 27.0216 22.352C27.0216 22.352 27.5841 23.9926 29.5153 26.3832C30.1341 27.1613 30.6778 29.327 30.6216 31.9051Z"
            fill="#E4E7EC"
          />
          <path
            d="M17.8252 23.6934C18.2912 23.6934 18.6689 23.3156 18.6689 22.8496C18.6689 22.3836 18.2912 22.0059 17.8252 22.0059C17.3592 22.0059 16.9814 22.3836 16.9814 22.8496C16.9814 23.3156 17.3592 23.6934 17.8252 23.6934Z"
            fill="#98A2B3"
          />
          <path
            d="M14.0938 23.6934C14.5597 23.6934 14.9375 23.3156 14.9375 22.8496C14.9375 22.3836 14.5597 22.0059 14.0938 22.0059C13.6278 22.0059 13.25 22.3836 13.25 22.8496C13.25 23.3156 13.6278 23.6934 14.0938 23.6934Z"
            fill="#98A2B3"
          />
          <path
            d="M15.0312 28.0266C13.3062 28.0266 12.2562 26.7516 11.9093 25.936C11.7593 25.5797 11.9187 25.1672 12.2749 25.0172C12.6312 24.8672 13.0437 25.0266 13.1937 25.3828C13.2687 25.561 13.9999 27.061 15.8093 26.4985C16.1843 26.3766 16.578 26.5922 16.6905 26.9578C16.803 27.3328 16.5968 27.7266 16.2312 27.8391C15.7999 27.9703 15.3968 28.036 15.0218 28.036L15.0312 28.0266Z"
            fill="#98A2B3"
          />
          <path
            d="M31.2499 23.0469C31.0249 22.6531 30.7999 22.25 30.5843 21.8562C29.6093 20.0844 28.9906 18.9875 28.4656 18.6312L27.9593 18.2844L27.7624 18.875C27.5843 19.4094 27.2374 19.9906 27.0874 20.0375C27.0874 20.0281 26.6937 19.8687 26.2718 17.9375C25.4187 14.0469 22.4093 12.5187 19.7562 11.1781C18.9218 10.7469 18.1249 10.3437 17.4593 9.89375C14.9093 8.15 13.9624 1.85937 13.9531 1.79375L13.7843 0.6875L13.1093 1.5875C10.4749 5.075 10.1749 8.0375 9.86557 11.1687C9.68744 12.9781 9.49994 14.8437 8.85307 16.925C8.52494 17.9469 8.12182 18.5281 7.70932 18.5562H7.67182C6.62182 18.5562 4.95307 15.8375 4.09994 13.8875L3.78119 13.1469L3.29369 13.7937C3.23744 13.8781 1.77494 15.9219 0.331193 26.0281C-0.418807 31.3062 0.396818 35.1875 2.83432 37.8875C4.89682 40.175 8.08432 41.5625 12.4999 42.0781C13.2593 42.1719 14.0468 42.2375 14.8812 42.2656C15.4156 42.2937 15.9593 42.3125 16.5218 42.3125H16.7749C17.3937 42.3125 18.0312 42.3031 18.6874 42.275C18.7718 42.275 18.8562 42.2656 18.9312 42.2562C24.0312 42.0031 27.8843 39.7906 30.0874 35.8531C32.7874 31.0062 32.2718 24.8562 31.2499 23.0469ZM30.6218 31.9062C30.3312 33.0875 29.8906 34.2687 29.2624 35.3937C28.2124 37.2781 26.7968 38.7125 25.0249 39.7062C24.8093 39.8281 24.5843 39.95 24.3499 40.0531C23.6843 40.3719 22.9624 40.6344 22.2031 40.8312C21.9406 40.9062 21.6687 40.9625 21.3968 41.0187C21.1343 41.075 20.8531 41.1219 20.5812 41.1594C20.2906 41.2062 19.9999 41.2437 19.6999 41.2625C19.4093 41.2906 19.1093 41.3094 18.8093 41.3281C18.7624 41.3375 18.7062 41.3375 18.6593 41.3375C17.9187 41.3656 17.2062 41.375 16.5218 41.375C15.9593 41.375 15.4062 41.3562 14.8812 41.3281C14.4312 41.3094 13.9906 41.2812 13.5687 41.2437C13.2406 41.2156 12.9218 41.1875 12.6124 41.15C12.3499 41.1219 12.0968 41.0844 11.8437 41.0469C11.6187 41.0187 11.3937 40.9812 11.1781 40.9437C10.6624 40.85 10.1656 40.7469 9.69682 40.6344C9.48119 40.5781 9.26557 40.5219 9.04994 40.4562C8.90932 40.4187 8.77807 40.3812 8.64682 40.3437C8.38432 40.2594 8.13119 40.175 7.88744 40.0812C7.43744 39.9125 7.01557 39.7344 6.62182 39.5469C6.48119 39.4719 6.34057 39.4062 6.20932 39.3312C5.45932 38.9281 4.79369 38.4594 4.21244 37.9344C4.09994 37.8406 3.99682 37.7469 3.90307 37.6437C3.77182 37.5219 3.64994 37.3906 3.52807 37.2594C1.29682 34.775 0.556193 31.1469 1.25932 26.1594C1.31557 25.7469 1.38119 25.3437 1.43744 24.9594C1.44682 24.875 1.46557 24.7906 1.47494 24.7062C2.34682 19.0625 3.19057 16.3531 3.66869 15.1625C4.44682 16.7281 6.04994 19.4937 7.68119 19.4937C7.70932 19.4937 7.73744 19.4937 7.76557 19.4937C8.61869 19.4469 9.28432 18.6781 9.74369 17.2156C9.79994 17.0469 9.84682 16.8781 9.89369 16.7188C10.4468 14.75 10.6249 12.9875 10.7937 11.2719C10.8312 10.9156 10.8687 10.5687 10.9062 10.2219V10.1937C11.1781 7.78437 11.5718 5.57187 13.2218 3.05937C13.6437 5.05625 14.7312 9.17187 16.9343 10.6812C17.6468 11.1594 18.4624 11.5812 19.3343 12.0219C21.9218 13.3344 24.5937 14.6937 25.3531 18.1437C25.7749 20.0656 26.2906 20.9375 27.0312 20.975C27.6593 21.0312 28.0718 20.4219 28.3531 19.8969C28.7468 20.4687 29.2812 21.4344 29.7593 22.3156C29.9843 22.7094 30.2093 23.1125 30.4343 23.5156C31.0531 24.6219 31.5499 28.2219 30.6218 31.9156V31.9062Z"
            fill="#98A2B3"
          />
        </svg>
      </div>
      <p>
        <span className="font-semibold text-gray-700">커뮤니티 반응을 모으고 있어요!</span>
        <br />
        <span className="text-sm text-gray-500">잠시후 다시 확인해 주세요</span>
      </p>
    </div>
  );
};
