'use client';

import { RoundedLogo } from '@/components/common/icons';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import { EVENT } from '@/constants/mixpanel';
import SearchLinkButton from '@/components/SearchLinkButton';
import Link from 'next/link';

const BackgroundHeader = () => {
  const handleClick = () => {
    mp.track(EVENT.OPEN_KAKAO_TALK.NAME, {
      page: EVENT.PAGE.HOME,
    });
  };

  return (
    <div className="fixed top-0 z-0 h-full w-full max-w-screen-layout-max bg-gray-900">
      <header className="flex h-[56px] w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <RoundedLogo />
          <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
        </div>
        <SearchLinkButton />
      </header>
      <div className="px-5 pb-4 pt-2">
        <Link
          onClick={handleClick}
          className={cn(
            'flex h-[68px] w-full items-center justify-between rounded-lg border border-gray-600 bg-gray-800 py-3 pl-[16px] pr-[6px]',
            '',
          )}
          href={'https://open.kakao.com/o/gJZTWAAg'}
          target="_blank"
        >
          <div>
            <p className="mb-[4px] text-base">
              <span className="text-sm font-medium text-gray-100">핫딜 전용 카톡방 </span>
              <span className="font-semibold text-primary-300">OPEN</span>
            </p>
            <p className="text-s text-gray-200">오픈 카톡방에서 소식을 확인해보세요!</p>
          </div>

          <div className="relative h-[59px] w-[91px]">
            <div className="absolute z-[1] flex h-full flex-col justify-end">
              <KaKaoIcon />
            </div>
            <div className="absolute right-0 z-[0] flex h-full flex-col justify-end">
              <JirumIcon />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const KaKaoIcon = () => {
  return (
    <svg
      width="54"
      height="54"
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect
        x="-1.51709"
        y="7.91895"
        width="48"
        height="48"
        rx="10"
        transform="rotate(-11.6158 -1.51709 7.91895)"
        fill="url(#pattern0_61_25780)"
      />
      <defs>
        <pattern
          id="pattern0_61_25780"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_61_25780" transform="scale(0.00462963)" />
        </pattern>
        <image
          id="image0_61_25780"
          width="216"
          height="216"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
};

const JirumIcon = () => {
  return (
    <svg width="44" height="43" viewBox="0 0 44 43" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_61_25759)">
        <rect
          x="9.52295"
          y="0.949219"
          width="35.226"
          height="35.226"
          rx="12"
          transform="rotate(14.8417 9.52295 0.949219)"
          fill="white"
        />
        <path
          d="M36.9937 18.7392C36.2174 21.6687 33.2935 23.4684 30.3574 22.8773C30.242 22.8637 30.1229 22.8322 30.0039 22.8006C29.8054 22.748 29.609 22.6875 29.4248 22.6132C28.8289 20.7899 27.3984 19.5187 26.0035 18.2739C25.9426 18.2153 25.8737 18.1546 25.8107 18.1039C25.7582 17.7246 25.7338 17.3358 25.7612 16.9437C25.7844 16.5676 25.8415 16.1918 25.9425 15.8108C26.7525 12.7542 29.8837 10.9415 32.9323 11.7494C35.9809 12.5572 37.8036 15.6827 36.9937 18.7392Z"
          fill="black"
        />
        <path
          d="M30.1283 40.1579C29.8274 40.5879 29.4831 40.9895 29.1033 41.3646C28.7579 41.7064 28.3949 42.0181 28.0165 42.2917L7.47818 36.8492C7.28888 36.5696 7.11965 36.2784 6.97052 35.9755C5.95411 33.8794 5.63581 31.297 6.4672 28.4161C9.76375 20.6571 11.528 19.5783 11.528 19.5783C11.528 19.5783 12.7428 27.4026 15.4021 23.1708C16.0338 22.1657 16.4957 21.192 16.8815 20.2492C17.6636 18.3238 18.165 16.5279 19.2891 14.7866C19.9267 13.7916 20.7769 12.8274 21.9996 11.8684C21.9996 11.8684 21.3712 17.3181 23.1886 19.4055C24.9959 21.4988 28.628 23.3109 28.4541 27.4622C28.2781 31.6213 30.165 28.7652 30.165 28.7652C30.165 28.7652 30.2732 30.2807 31.3722 32.7386C31.8548 33.8351 31.6192 37.1288 30.1283 40.1579Z"
          fill="#9EF22E"
        />
        <path
          d="M16.8816 20.2491C17.8383 18.6588 18.4052 17.1607 18.9394 15.7219C19.0574 15.4049 19.1733 15.0957 19.2892 14.7866C18.165 16.5278 17.6637 18.3237 16.8816 20.2491Z"
          fill="black"
        />
        <path
          d="M33.6182 30.2918C33.5181 29.8999 33.4181 29.508 33.3238 29.1262C32.8937 27.4149 32.6158 26.3471 32.2512 25.9276L31.9003 25.5203L31.6032 25.9683C31.3224 26.3867 30.9003 26.7932 30.7707 26.8013C30.7707 26.8013 30.4751 26.5701 30.5512 24.8399C30.5792 24.1251 30.5147 23.4708 30.3577 22.8769C29.7986 20.5621 28.0948 19.0401 26.5483 17.6617C26.2728 17.4187 26.0132 17.18 25.7616 16.9434C25.441 16.646 25.1522 16.3571 24.8915 16.0586C23.1233 14.0097 23.7252 8.46797 23.7399 8.4124L23.8453 7.43772L23.0738 8.04046C20.0503 10.4085 19.1394 12.852 18.1747 15.4342C17.6178 16.9265 17.0404 18.4643 16.0176 20.0795C15.5184 20.8734 15.0466 21.2751 14.6931 21.1984C13.7929 21.0364 12.9707 18.3035 12.6842 16.4348L12.5704 15.7419L12.0204 16.1824C11.9559 16.2333 10.2588 17.6359 6.7683 25.8702C5.58339 28.6745 5.11429 31.1501 5.36847 33.3331C5.48495 34.4006 5.78171 35.3968 6.23869 36.3336C6.2716 36.4018 6.31034 36.48 6.35913 36.5524L7.47854 36.8491C7.28923 36.5695 7.12001 36.2782 6.97087 35.9753C5.95446 33.8792 5.85329 31.4394 6.68469 28.5585C6.90253 27.8005 7.17852 27.0155 7.52482 26.1896C9.81404 20.7892 11.3059 18.3976 12.0308 17.4257C12.3384 18.9261 13.0775 21.62 14.4589 21.986L14.5224 22.0029C15.2633 22.1567 15.9995 21.6551 16.7167 20.5197C16.7737 20.4328 16.8328 20.338 16.8818 20.2491C17.6639 18.3237 18.1653 16.5278 19.2895 14.7865C20.0541 12.831 20.8898 11.0558 22.8388 9.31214C22.74 11.0957 22.7453 14.8271 24.2664 16.5897C24.7074 17.1059 25.2404 17.5955 25.811 18.1035C25.874 18.1542 25.9429 18.2149 26.0038 18.2736C27.3988 19.5184 28.8292 20.7896 29.4251 22.6128C29.651 23.2674 29.7563 23.992 29.7269 24.8084C29.6529 26.5306 29.8939 27.3846 30.5047 27.5805C31.0023 27.7548 31.518 27.3477 31.8682 26.9562C32.0791 27.5389 32.3091 28.4665 32.5242 29.3221C32.6163 29.7119 32.7164 30.1038 32.8244 30.4978C33.2082 31.9674 32.639 36.7446 30.1287 40.1577C29.8278 40.5878 29.4835 40.9894 29.1037 41.3645C28.7582 41.7063 28.3952 42.0179 28.0169 42.2915L29.0172 42.5566C29.2529 42.3727 29.4689 42.1665 29.6871 41.9524C33.3382 38.3063 34.0925 32.1253 33.6182 30.2918Z"
          fill="black"
        />
        <path
          d="M18.9403 27.0051C19.3349 27.1097 19.7396 26.8745 19.8442 26.4799C19.9488 26.0853 19.7136 25.6806 19.319 25.5761C18.9244 25.4715 18.5197 25.7066 18.4152 26.1012C18.3106 26.4959 18.5457 26.9005 18.9403 27.0051Z"
          fill="black"
        />
        <path
          d="M22.1 27.843C22.4946 27.9476 22.8993 27.7124 23.0038 27.3178C23.1084 26.9232 22.8733 26.5185 22.4787 26.4139C22.0841 26.3094 21.6794 26.5445 21.5748 26.9391C21.4702 27.3337 21.7054 27.7384 22.1 27.843Z"
          fill="black"
        />
        <path
          d="M32.3152 14.143L29.1923 16.918C29.1257 16.9769 29.1481 17.0848 29.2355 17.1079L31.2282 17.636C31.2917 17.6528 31.3246 17.721 31.2998 17.7824L30.4345 19.9576C30.3892 20.0646 30.5274 20.1522 30.6061 20.0796L33.8937 17.0678C33.9603 17.009 33.9358 16.909 33.8484 16.8859L31.816 16.3473C31.7525 16.3305 31.7196 16.2623 31.7444 16.2009L32.4747 14.2787C32.512 14.1697 32.3897 14.0863 32.3031 14.1568L32.3152 14.143Z"
          fill="white"
        />
        <path
          d="M18.7622 30.8835C17.3014 30.4964 16.6984 29.1811 16.5876 28.4125C16.5406 28.0772 16.7681 27.7636 17.1034 27.7165C17.4388 27.6695 17.7523 27.897 17.7994 28.2323C17.823 28.4 18.1056 29.8344 19.7641 29.764C20.109 29.745 20.394 30.0159 20.4072 30.3508C20.4184 30.6936 20.1553 30.9808 19.8205 30.994C19.4258 31.0084 19.0697 30.9735 18.7522 30.8893L18.7622 30.8835Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_61_25759">
          <rect
            x="9.52295"
            y="0.949219"
            width="35.226"
            height="35.226"
            rx="12"
            transform="rotate(14.8417 9.52295 0.949219)"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BackgroundHeader;
