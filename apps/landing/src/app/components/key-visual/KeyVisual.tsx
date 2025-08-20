import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/shared/libs/cn';

import AppDownload from './AppDownload';

const Category = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <Image
    src={src}
    alt={alt}
    className={cn('absolute aspect-square flex-1/3 md:static', className)}
    unoptimized
    width={200}
    height={200}
  />
);

const KeyVisual = () => (
  <section className="mx-auto flex h-full max-h-lvh min-h-svh w-full snap-start flex-col bg-white px-5 pt-14 pb-5 lg:px-8 lg:pb-9">
    <div className="relative flex w-full grow items-center justify-center overflow-hidden rounded-[28px] rounded-bl-none py-5">
      <div className="to-landing-background absolute inset-0 -z-0 bg-linear-to-b from-gray-900 via-37% lg:via-0%" />
      <div className="relative">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/assets/icons/jirum.svg"
            alt="jirum"
            className="mb-2 aspect-square w-[100px] md:mb-0 md:w-[150px] lg:w-[200px]"
            width={200}
            height={200}
            priority
          />
          <h1 className="text-primary-500 text-[44px] leading-[1.3] font-bold md:text-[66px] lg:text-[88px]">
            지름알림
          </h1>
          <p className="text-[32px] leading-[1.3] font-bold text-white md:text-[48px] lg:text-[64px]">
            득템의 시작
          </p>
          <AppDownload type="key-visual" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -mx-5 flex items-center justify-between md:-mx-8">
        <div className="relative flex h-40 w-1/2 items-center justify-between pr-18 md:pr-30 lg:pr-50">
          <Category
            src="/assets/icons/computer.svg"
            alt="컴퓨터"
            className="top-0 -left-1 w-19 md:max-w-46"
          />
          <Category
            src="/assets/icons/cart.svg"
            alt="장바구니"
            className="bottom-0 left-4 w-17.5 md:max-w-41"
          />
          <Category
            src="/assets/icons/game.svg"
            alt="게임"
            className="top-13 left-14 w-14 md:max-w-32"
          />
        </div>
        <div className="relative flex h-40 w-1/2 flex-row-reverse items-center justify-between pl-18 md:pl-30 lg:pl-50">
          <Category
            src="/assets/icons/leisure.svg"
            alt="여가"
            className="right-0 bottom-2 w-20 md:max-w-47.5"
          />
          <Category
            src="/assets/icons/electric.svg"
            alt="전자기기"
            className="top-0.75 right-3 w-15 md:max-w-35"
          />
          <Category
            src="/assets/icons/cosmetics.svg"
            alt="화장품"
            className="top-11.25 right-14.5 w-14 md:max-w-32"
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0">
        <div className="h-16 w-16 rounded-bl-3xl shadow-[0_36px_0_rgb(255,255,255)]" />
        <div className="flex items-end">
          <Link
            href="https://open.kakao.com/o/gJZTWAAg"
            target="_blank"
            className="flex h-16 items-center gap-x-4 rounded-tr-4xl bg-white px-5 lg:px-10 lg:py-9.5"
          >
            <span className="text-xl font-semibold">핫딜 카톡방 입장</span>
            <div className="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full">
              <Image src="/assets/icons/arrow-right.svg" alt="arrow-right" width={24} height={24} />
            </div>
          </Link>
          <div className="h-16 w-16 rounded-bl-3xl shadow-[0_36px_0_rgb(255,255,255)]" />
        </div>
      </div>
    </div>
  </section>
);

export default KeyVisual;
