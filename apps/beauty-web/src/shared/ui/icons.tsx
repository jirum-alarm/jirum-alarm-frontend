import type { SVGProps } from 'react';

/**
 * apps/web shared/ui/common/icons 에서 이 앱이 쓰는 것만 옮겼다(Search·Alert·My·ArrowRight·TalkLight·LoadingSpinner·
 * categories/CosmeticsOnIcon). 모양은 그대로, 색은 currentColor·토큰 변수로.
 */

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden {...props}>
    <path
      d="M23 23L17.0001 17M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      strokeLinejoin="round"
    />
  </svg>
);

export const AlertIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={28} height={28} viewBox="0 0 29 28" fill="none" aria-hidden {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="square"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.853 23c.705.622 1.632 1 2.646 1s1.94-.378 2.646-1m3.354-13a6 6 0 1 0-12 0c0 3.09-.78 5.206-1.65 6.605-.735 1.18-1.102 1.771-1.089 1.936.015.182.054.252.2.36.133.099.732.099 1.928.099H21.11c1.197 0 1.795 0 1.927-.098.147-.11.186-.179.2-.361.014-.165-.353-.755-1.088-1.936-.87-1.399-1.65-3.515-1.65-6.605Z"
    />
  </svg>
);

export const MyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M14 17c-3.17 0-5.99 1.53-7.784 3.906-.386.511-.58.767-.573 1.112.005.267.172.604.382.769.272.213.649.213 1.402.213h13.146c.753 0 1.13 0 1.402-.213.21-.165.377-.502.382-.769.006-.345-.187-.6-.573-1.112C19.99 18.531 17.17 17 14 17M14 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9"
    />
  </svg>
);

export const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={20} height={20} viewBox="0 0 24 25" fill="none" aria-hidden {...props}>
    <path
      d="M14.62 12.51 7.561 5.433l.91-.91 7.966 7.987-7.967 7.967-.91-.91z"
      strokeWidth={1.5}
      stroke="currentColor"
    />
  </svg>
);

export const ArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={28} height={28} viewBox="0 0 24 25" fill="none" aria-hidden {...props}>
    <path
      d="M9.38 12.51 16.439 5.433l-.91-.91-7.966 7.987 7.967 7.967.91-.91z"
      strokeWidth={1.5}
      stroke="currentColor"
    />
  </svg>
);

export const TalkLightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={18} height={18} viewBox="0 0 30 30" fill="none" aria-hidden {...props}>
    <path
      d="M14.8957 5.33376C8.9254 5.33376 4.08594 9.15951 4.08594 13.8795C4.08594 16.9514 6.13649 19.6437 9.21403 21.15C8.98795 21.9942 8.39542 24.2082 8.27642 24.6818C8.13015 25.2697 8.49213 25.2618 8.72912 25.1034C8.91493 24.9797 11.6913 23.0925 12.8892 22.2778C13.5392 22.3741 14.2098 22.4254 14.8957 22.4254C20.8657 22.4254 25.7054 18.5987 25.7054 13.8795C25.7054 9.15951 20.8657 5.33376 14.8957 5.33376Z"
      fill="#391B1B"
    />
  </svg>
);

export const CosmeticsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={64} height={64} viewBox="0 0 64 64" fill="none" aria-hidden {...props}>
    <path
      d="M51.0833 31H11.9167C9.75355 31 8 32.7909 8 35V51C8 53.2091 9.75355 55 11.9167 55H51.0833C53.2464 55 55 53.2091 55 51V35C55 32.7909 53.2464 31 51.0833 31Z"
      fill="#FFBE83"
    />
    <path
      d="M13.95 23H49.05C49.5672 23 50.0632 23.2107 50.4289 23.5858C50.7946 23.9609 51 24.4696 51 25V31H12V25C12 24.4696 12.2054 23.9609 12.5711 23.5858C12.9368 23.2107 13.4328 23 13.95 23Z"
      fill="#CF4E06"
    />
    <path
      d="M46.9688 23C46.9688 23 47.4217 18.4604 44.8746 14.7456C43.0803 12.1252 41.1486 9.98225 37.4169 8.19476C37.1493 8.06329 36.8561 7.99671 36.5597 8.00013C36.2634 8.00354 35.9717 8.07687 35.707 8.21449C35.4423 8.3521 35.2117 8.55036 35.0326 8.7941C34.8536 9.03784 34.731 9.32061 34.6742 9.62076C34.3161 11.572 32.7096 13.8968 27.0675 13.8289C19.7879 13.743 16 17.0084 16 23H46.9688Z"
      fill="#FAE4AB"
    />
    <rect x="23" y="40" width="18" height="6" rx="3" fill="white" />
  </svg>
);

export const LoadingSpinner = (props: SVGProps<SVGSVGElement>) => (
  <svg width={32} height={32} stroke="#9EF22E" viewBox="0 0 24 24" aria-hidden {...props}>
    <style>
      {
        '@keyframes spinner_zKoa{to{transform:rotate(360deg)}}@keyframes spinner_YpZS{0%{stroke-dasharray:0 150;stroke-dashoffset:0}47.5%{stroke-dasharray:42 150;stroke-dashoffset:-16}95%,to{stroke-dasharray:42 150;stroke-dashoffset:-59}}'
      }
    </style>
    <g style={{ transformOrigin: 'center', animation: 'spinner_zKoa 2s linear infinite' }}>
      <circle
        cx={12}
        cy={12}
        r={9.5}
        fill="none"
        strokeWidth={3}
        style={{ strokeLinecap: 'round', animation: 'spinner_YpZS 1.5s ease-in-out infinite' }}
      />
    </g>
  </svg>
);
