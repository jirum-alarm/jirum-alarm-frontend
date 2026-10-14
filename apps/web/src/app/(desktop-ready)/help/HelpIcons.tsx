import type { SVGProps } from 'react';

/**
 * /help 전용 선 아이콘(24 그리드·2px 선·currentColor). 공용 아이콘 세트는 화면마다 색이 박혀 있어 다크에서 안 뒤집히고,
 * 이 페이지가 쓰는 개념(실시간·최저가 모음·관심사…)에 맞는 모양이 없다. 색은 부모 글자색을 따른다.
 */
const paths = {
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01',
  layers: 'M12 3 2 8l10 5 10-5-10-5zM2 13l10 5 10-5M2 17.5l10 5 10-5',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  chat: 'M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z',
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  zap: 'M13 2 4 14h8l-1 8 9-12h-8l1-8z',
  trophy:
    'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4.5a2.5 2.5 0 0 0 2.6 4M17 6h2.5a2.5 2.5 0 0 1-2.6 4',
  chart: 'M3 3v18h18M7 9l4 4 3-3 5 5',
  hash: 'M4 9h16M4 15h16M10 3 8 21M16 3l-2 18',
  doc: 'M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h4',
  sparkle:
    'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  heart:
    'M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z',
  users:
    'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.7.8 2.8 2.9 3 5.6',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
} as const;

export type HelpIconName = keyof typeof paths;

export default function HelpIcon({
  name,
  ...props
}: { name: HelpIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
