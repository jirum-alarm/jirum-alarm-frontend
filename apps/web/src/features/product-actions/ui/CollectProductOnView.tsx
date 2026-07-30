'use client';

import { useEffect, useRef } from 'react';

import { ProductService } from '@/shared/api/product';

/**
 * 상세 진입 시 post_view 수집을 "클라이언트"에서 1회 호출한다.
 *
 * 이전에는 상세 페이지(SSR Server Component)가 collectProductAction(Server Action)으로
 * 수집했는데, 그 경로의 execute()는 next/headers cookies() 로 deviceId 를 읽는다.
 * 미들웨어가 첫 방문에 막 구운 deviceId 쿠키는 "같은 요청"의 cookies() 에 안 보여서
 * 매 페이지뷰마다 새 deviceId(v4)가 발급됐다 → 운영 91.9% 디바이스가 1상품/1이벤트로
 * 쪼개지는 계측 붕괴의 원인. 클라 경로는 localStorage 기반(DeviceId provider 가 동기화한
 * 안정 id)이라 같은 사람이 같은 deviceId 로 누적된다.
 */
export const CollectProductOnView = ({ productId }: { productId: number }) => {
  // StrictMode 이중 마운트 + 리렌더 중복 호출 방지.
  const collectedRef = useRef(false);

  useEffect(() => {
    if (collectedRef.current) return;
    collectedRef.current = true;
    // fire-and-forget. 실패해도 UX 영향 없음.
    void ProductService.collectProduct({ productId }).catch(() => {});
  }, [productId]);

  return null;
};
