'use client';

import { promptCard } from '@jirum/design-system/recipes';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { ProductService } from '@/shared/api/product';
import type { WaitCard as WaitCardData } from '@/shared/api/product/product.service';
import { PAGE } from '@/shared/config/page';
import { isCrawlerBrowser } from '@/shared/config/user-agent';
import useAlertSession from '@/shared/hooks/useAlertSession';
import { useDevice } from '@/shared/hooks/useDevice';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { cn } from '@/shared/lib/cn';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { getGraphqlErrorMessage } from '@/shared/lib/graphql-error';
import { readPushStatus, usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { triggerHaptic } from '@/shared/lib/webview';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

import {
  shownVerdict,
  waitCardCopy,
  waitCardImpressionDetail,
  waitWatchToast,
} from '../lib/wait-card';

/** GA4 (GTM customEvent 태그 wait_card_*·wait_watch_register) — placement·verdict·unit 은 맞춤 측정기준. */
function pushEvent(event: string, props: Record<string, unknown>) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement: 'wait_card',
    ...props,
  });
}

/**
 * 상세 «언제 사나» 카드 — A/B `wait_card_detail_v1`(2026-11-05 00:00 KST 자동 시작, crawling-server 등록부).
 *
 * 왜: 검색으로 상세에 온 사람은 한 장 보고 떠난다(재방문 1.2%). «이 키워드 커뮤니티 핫딜가는 보통 얼마까지 내려가나»
 * (가격 기억)를 보여 주고 그 값에 알림을 걸게 하면 «등록 → 첫 알림 → 재방문» 고리가 이어지나를 잰다. 별도 가격 추적
 * 앱을 만드는 대신 상세에서 수요부터 잰다(⑤ 신사업 조사 10/19).
 *
 * 배정·판정은 서버 — 시작 전·꺼짐·「답」 숨김 군이면 서버가 null/excluded 라 아무것도 안 그린다. 대조군은 그리지 않고
 * «떴을 카드»만 기록한다(price_context_impression wait_card_ctl:<판정>). 모양은 상세 권유 카드(promptCard, 지름알림 파랑) —
 * 아래 구매 버튼과 경쟁하지 않게 옅은 면 + 알약 버튼. 근거 블록(DealEvidenceBlock) 밖에 둔다 — 그 칸은 「답」 숨김 실험이
 * 숨기는 자리라, 안에 넣으면 그 실험 군에 따라 카드가 사라진다.
 */
export default function WaitCard({
  productId,
  source,
  answerKind,
  className,
}: {
  productId: number;
  /** user_history source — detail_mobile | detail_desktop */
  source: string;
  /** 근거 블록 헤드라인 종류 — 가격 답(HISTORY·MARKET)이 있으면 카드는 «지금»을 말하지 않는다 */
  answerKind?: string | null;
  className?: string;
}) {
  const { device } = useDevice();
  const { toast } = useToast();
  const router = useMyRouter();
  const queryClient = useQueryClient();
  const { ensureAlertSession } = useAlertSession();
  const { requestPermission } = useFcmPermission();
  const promptPushChannel = usePushChannelPrompt();
  const [card, setCard] = useState<WaitCardData | null>(null);
  const [watching, setWatching] = useState(false);
  const [pending, setPending] = useState(false);
  const recordedRef = useRef<number | null>(null);

  useEffect(() => {
    // 앱 웹뷰는 상세가 네이티브라 대상 아님. 크롤러는 카드 계산(LLM)을 태우지 않는다.
    if (device.isJirumAlarmApp || isCrawlerBrowser()) return;
    let cancelled = false;
    ProductService.getWaitCard(productId)
      .then((res) => {
        if (cancelled) return;
        setCard(res);
        setWatching(!!res?.watching);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [productId, device.isJirumAlarmApp]);

  const verdict = shownVerdict(card?.verdict ?? null, answerKind);
  const copy = card?.arm === 'card' && card.eligible ? waitCardCopy(card, verdict) : null;

  // 노출 기록 — 두 군 모두(상세 진입당 한 번). 판독이 «카드가 뜰 수 있던 기기»를 이 기록으로 가린다.
  useEffect(() => {
    if (!card?.eligible || recordedRef.current === productId) return;
    const detail = waitCardImpressionDetail(card, verdict);
    if (!detail) return;
    recordedRef.current = productId;
    void ProductService.collectPriceContextImpression({ productId, source, detail }).catch(
      () => {},
    );
    if (card.arm === 'card') pushEvent('wait_card_view', { verdict, unit: card.unit });
  }, [card, productId, source, verdict]);

  if (!card || !copy) return null;

  const handleWatch = async () => {
    if (pending || watching) return;
    setPending(true);
    pushEvent('wait_card_click', { verdict, unit: card.unit });
    void ProductService.collectPriceContextClick({
      productId,
      source,
      detail: 'wait_card:click',
    }).catch(() => {});
    // 권한 요청은 탭 직후 바로 — 네트워크를 기다린 뒤에 부르면 브라우저가 "사용자 동작 없음"으로 막는다(첫 방문 시트와 같다).
    const permission =
      readPushStatus() === 'default' ? requestPermission({ force: true }) : Promise.resolve(null);
    let keyword: string | null = null;
    try {
      if (!(await ensureAlertSession())) return;
      const res = await ProductService.addWaitWatchForProduct(productId);
      keyword = res?.keyword ?? card.keyword;
      setWatching(true);
      triggerHaptic('success');
      pushEvent('wait_watch_register', { verdict, unit: card.unit });
      void queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
      toast.success(waitWatchToast(card), {
        action: { label: '보기', onClick: () => router.push(PAGE.MYPAGE_KEYWORD) },
      });
      await permission;
    } catch (error) {
      triggerHaptic('error');
      toast.error(getGraphqlErrorMessage(error) || '알림을 걸지 못했어요.');
    } finally {
      setPending(false);
    }
    // 걸었는데 받을 통로가 없으면(권한 거절·사파리) 「어디로 받을까요」로 잇는다 — 다른 등록 지점과 같다.
    if (keyword) promptPushChannel(keyword, 'wait_card');
  };

  // 알약은 글 아래 — 오른쪽에 두면 375px 화면에서 «좋은 가격은 100g당 430원 이하»가 세 줄로 쪼개졌다.
  return (
    <div
      className={cn('flex', promptCard.box, 'items-start', promptCard.tone.brand.box, className)}
      data-wait-card={verdict}
    >
      <span
        aria-hidden
        className="bg-secondary-100 text-secondary-600 flex size-7 shrink-0 items-center justify-center rounded-full"
      >
        <ClockTagIcon />
      </span>
      {/* break-keep — 「이하」「좋은」 같은 낱말이 줄 끝에서 쪼개지지 않게. */}
      <div className="min-w-0 flex-1 break-keep">
        <p className={promptCard.title}>{copy.title}</p>
        <p className={promptCard.description}>{copy.detail}</p>
        <button
          type="button"
          onClick={handleWatch}
          disabled={pending || watching}
          className={cn(
            'mt-2 disabled:opacity-60',
            promptCard.action.box,
            promptCard.tone.brand.action.box,
            promptCard.action.text,
            promptCard.tone.brand.action.text,
          )}
        >
          {watching ? '알림 켜짐' : '이 가격 오면 알려줘'}
        </button>
      </div>
    </div>
  );
}

function ClockTagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
