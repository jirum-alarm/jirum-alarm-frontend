'use client';

import { useEffect, useState } from 'react';

type QrMatrix = boolean[][];

/**
 * 주소 하나를 QR 로 그린다(SVG, 칸마다 rect 대신 한 path). 라이브러리는 PC 모달이 실제로 열릴 때만 받는다 —
 * 상세 페이지 번들에 넣지 않으려고 동적 import.
 */
export default function PageQrCode({
  value,
  size,
  className,
}: {
  value: string;
  size: number;
  className?: string;
}) {
  const [matrix, setMatrix] = useState<QrMatrix | null>(null);

  useEffect(() => {
    let alive = true;
    void import('qrcode-generator').then(({ default: qrcode }) => {
      // typeNumber 0 = 길이에 맞춰 자동. M = 15% 복원 — 화면 QR 이라 이 정도면 충분하고 칸이 덜 촘촘하다.
      const qr = qrcode(0, 'M');
      qr.addData(value);
      qr.make();
      const count = qr.getModuleCount();
      const rows = Array.from({ length: count }, (_, r) =>
        Array.from({ length: count }, (_, c) => qr.isDark(r, c)),
      );
      if (alive) setMatrix(rows);
    });
    return () => {
      alive = false;
    };
  }, [value]);

  if (!matrix) {
    return <div style={{ width: size, height: size }} className={className} aria-hidden />;
  }

  const count = matrix.length;
  const d = matrix
    .flatMap((row, r) => row.map((dark, c) => (dark ? `M${c} ${r}h1v1h-1z` : '')))
    .join('');
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${count} ${count}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="이 상품을 폰에서 여는 QR 코드"
      className={className}
    >
      {/* 테마와 무관하게 흰 바탕·검은 칸 — 다크에서 뒤집히면 스캐너가 못 읽는다. */}
      <rect width={count} height={count} className="fill-fixed-white" />
      <path d={d} className="fill-fixed-900" />
    </svg>
  );
}
