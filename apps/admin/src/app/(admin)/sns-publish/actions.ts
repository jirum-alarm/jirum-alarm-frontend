'use server';

// SNS 발행 승인 큐 — publisher 서비스(REST, 별도 배포)를 서버-서버로 프록시 호출.
// publisher 는 ClusterIP(외부 미노출)라 브라우저에서 직접 못 닿음 → admin Next 서버가 대신 호출.
// publisher 는 인증이 없으므로 여기서 어드민인지 확인한다 — 미들웨어는 쿠키 "존재"만 봐서
// 아무 값이나 넣은 accessToken 쿠키로도 서버 액션(반려)이 호출됐다.

import { getAccessToken } from '@/app/actions/token';
import { baseUrl } from '@/constants/endpoint';

const PUBLISHER_API_URL =
  process.env.PUBLISHER_API_URL || 'http://publisher.publisher.svc.cluster.local:3000';

async function assertAdmin(): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('로그인이 필요합니다');
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: '{ adminMe { id } }' }),
    cache: 'no-store',
  });
  const body = (await res.json().catch(() => null)) as {
    data?: { adminMe?: { id: number } };
  } | null;
  if (!body?.data?.adminMe) throw new Error('어드민 권한이 없습니다');
}

export type SnsDraft = {
  id: number;
  productId: number;
  channel: string;
  hookType: string;
  tone: string;
  selectionReason: string | null;
  copy: string;
  imageUrl: string | null;
  targetUrl: string;
  status: string;
  createdAt: string;
};

/** 발행 대기(자동승인 approved·미발행) 목록. 발행 크론(10분)이 잡기 전 반려 가능. */
export async function listAwaiting(): Promise<SnsDraft[]> {
  await assertAdmin();
  const res = await fetch(`${PUBLISHER_API_URL}/internal/drafts/awaiting`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`publisher awaiting ${res.status}`);
  return res.json();
}

/** 반려 — approved→rejected 로 바꿔 발행 크론이 제외. 발행 전에만 유효. */
export async function rejectDraft(id: number): Promise<void> {
  await assertAdmin();
  const res = await fetch(`${PUBLISHER_API_URL}/internal/drafts/${id}/reject`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`publisher reject ${id}: ${res.status}`);
}
