'use client';

import { button } from '@jirum/design-system/recipes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';

import { GoodPriceService } from '@/shared/api/keyword/good-price.service';
import { PAGE } from '@/shared/config/page';
import { getLastAlarmReadAt, setLastAlarmReadAt } from '@/shared/lib/alarmReadState';
import { cn } from '@/shared/lib/cn';
import { pushDataLayer } from '@/shared/lib/data-layer';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { ThemeQueries } from '@/entities/notification';
import {
  pushSettingQuery,
  useUpdatePushSetting,
} from '@/entities/notification/model/usePushSetting';

import {
  GOOD_PRICE_NUDGE_MIN_ALERTS,
  goodPriceText,
  HEAVY_KEYWORD_ALERTS_PER_DAY,
  normalizeKeyword,
  notificationSource,
  recentKeywordAlertCount,
  topKeywordToday,
} from '../lib/notificationSource';
import { alarmEditModeAtom } from '../model/alarmEditModeAtom';
import { useNotificationsViewModel } from '../model/useNotificationsViewModel';

import AlarmItem from './AlarmItem';
import NoAlerts from './NoAlerts';

export default function AlarmList() {
  const {
    notifications,
    loading,
    noData,
    hasNextData,
    ref,
    onReadNotification,
    onRemoveNotification,
    onRemoveAll,
  } = useNotificationsViewModel();

  const isEditMode = useAtomValue(alarmEditModeAtom);
  const setEditMode = useSetAtom(alarmEditModeAtom);

  const lastReadAt = useMemo(() => getLastAlarmReadAt(), []);

  // 알림 → 그 알림의 설정(키워드는 펼친 채로·관심사 화면·알림 설정). 지운 키워드·없어진 관심사엔
  // 링크를 안 단다 — 눌러도 갈 데가 없다.
  const { data: myKeywords } = useQuery(AuthQueries.myKeywords({ limit: 20 }));
  const { data: themes } = useQuery(ThemeQueries.themes());
  const watching = useMemo(
    () =>
      new Set((myKeywords?.notificationKeywordsByMe ?? []).map((k) => normalizeKeyword(k.keyword))),
    [myKeywords],
  );

  useEffect(() => {
    setLastAlarmReadAt();
  }, []);

  // 키워드 알림을 많이 받은 사람에게 「핫딜이 되면만 받기」 — 설정 화면엔 아무도 안 온다(recentKeywordAlertCount 주석).
  const { toast } = useToast();
  const { data: pushSetting } = useQuery(pushSettingQuery);
  const { update: updatePushSetting } = useUpdatePushSetting();
  const keywordAlertsToday = useMemo(
    () => recentKeywordAlertCount(notifications ?? [], watching),
    [notifications, watching],
  );
  const suggestHotOnly =
    pushSetting?.keywordAlert === true &&
    pushSetting.keywordAlertLevel === 'ALL' &&
    keywordAlertsToday > HEAVY_KEYWORD_ALERTS_PER_DAY;

  // 오늘 가장 시끄러운 키워드 하나를 「좋은 가격일 때만」으로 — 전체를 핫딜만으로 줄이는 것보다 좁은 처방이라 먼저 권한다.
  // 서버(「언제 사나」 엔진)가 그 키워드의 좋은 가격을 말할 수 있을 때만(카테고리·섞인 키워드는 priced=false).
  const queryClient = useQueryClient();
  const topKeyword = useMemo(
    () => topKeywordToday(notifications ?? [], watching),
    [notifications, watching],
  );
  const nudgeKeyword =
    pushSetting?.keywordAlert === true &&
    topKeyword &&
    topKeyword.count >= GOOD_PRICE_NUDGE_MIN_ALERTS
      ? topKeyword.keyword
      : null;
  const { data: goodPrice } = useQuery({
    queryKey: ['goodPriceSuggestion', nudgeKeyword],
    queryFn: () => GoodPriceService.suggestion(nudgeKeyword!),
    enabled: !!nudgeKeyword,
    staleTime: 10 * 60_000,
    retry: false,
  });
  const [goodPriceApplied, setGoodPriceApplied] = useState(false);
  const suggestGoodPrice =
    !goodPriceApplied &&
    !!goodPrice?.priced &&
    !goodPrice.watching &&
    goodPrice.goodPrice != null &&
    goodPrice.goodDealCount < goodPrice.rawMatchCount;
  const { mutate: applyGoodPrice, isPending: applyingGoodPrice } = useMutation({
    mutationFn: (keyword: string) => GoodPriceService.apply(keyword),
    onSuccess: () => {
      setGoodPriceApplied(true);
      if (goodPrice?.goodPrice != null) {
        toast(
          `이제 「${goodPrice.keyword}」는 ${goodPriceText(goodPrice.unit, goodPrice.goodPrice)} 이하일 때만 알려드려요. 키워드 설정에서 되돌릴 수 있어요`,
        );
      }
      queryClient.invalidateQueries({ queryKey: ['goodPriceSuggestion'] });
    },
    onError: () => toast('지금은 바꾸지 못했어요. 잠시 뒤 다시 시도해 주세요'),
  });
  useEffect(() => {
    if (!suggestGoodPrice || !goodPrice) return;
    pushDataLayer({
      event: 'keyword_prompt_view',
      placement: 'inbox_good_price',
      keyword: goodPrice.keyword,
    });
  }, [suggestGoodPrice, goodPrice]);

  return (
    <>
      {/* PC 는 다른 내 메뉴 화면처럼 회색 띠 없이 흰 바탕 — 키워드 알림은 사이드바에 있어 안내 띠는 뺀다. */}
      {isEditMode && (
        <div className="pc:top-14 pc:border-gray-100 pc:bg-white sticky top-14 z-40 border-b border-gray-200 bg-gray-50">
          <div className="flex h-11 items-center justify-end gap-x-3 px-5">
            <button
              type="button"
              onClick={() => {
                // 되돌릴 수 없어 한 번 묻는다(앱과 같은 문구).
                if (!window.confirm('알림을 모두 삭제할까요?')) return;
                onRemoveAll();
                setEditMode(false);
              }}
              className="px-1 text-sm font-medium text-gray-600"
            >
              전체 삭제
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className={cn(
                button.size.xs.box,
                button.size.xs.text,
                button.tone.neutralOutline.box,
                button.tone.neutralOutline.text,
              )}
            >
              완료
            </button>
          </div>
        </div>
      )}
      {!isEditMode && (
        <div className="pc:hidden sticky top-14 z-40 border-b border-gray-200 bg-gray-50">
          {suggestGoodPrice && goodPrice?.goodPrice != null ? (
            <div className="flex items-center justify-between gap-3 px-5 py-2">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-gray-700">
                  「{goodPrice.keyword}」 알림 오늘 {topKeyword?.count}건
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {goodPriceText(goodPrice.unit, goodPrice.goodPrice)} 이하만 받으면{' '}
                  {goodPrice.windowDays}일에 {goodPrice.goodDealCount}번
                </span>
              </span>
              <button
                type="button"
                disabled={applyingGoodPrice}
                onClick={() => {
                  pushDataLayer({
                    event: 'keyword_prompt_click',
                    placement: 'inbox_good_price',
                    keyword: goodPrice.keyword,
                  });
                  applyGoodPrice(goodPrice.keyword);
                }}
                className={cn(
                  'flex shrink-0 items-center justify-center disabled:opacity-50',
                  button.size.xs.box,
                  button.size.xs.text,
                  button.tone.neutralOutline.box,
                  button.tone.neutralOutline.text,
                )}
              >
                좋은 가격만
              </button>
            </div>
          ) : suggestHotOnly ? (
            <div className="flex h-11 items-center justify-between px-5">
              <span className="text-sm font-medium text-gray-600">
                오늘 키워드 알림 {keywordAlertsToday}건 받았어요
              </span>
              <button
                type="button"
                onClick={() => {
                  updatePushSetting({ keywordAlertLevel: 'HOT' });
                  toast('이제 핫딜이 된 딜만 알려드려요. 알림 설정에서 되돌릴 수 있어요');
                }}
                className={cn(
                  'flex items-center justify-center',
                  button.size.xs.box,
                  button.size.xs.text,
                  button.tone.neutralOutline.box,
                  button.tone.neutralOutline.text,
                )}
              >
                핫딜만 받기
              </button>
            </div>
          ) : (
            <div className="flex h-11 items-center justify-between px-5">
              <span className="text-sm font-medium text-gray-600">
                지금 다양한 핫딜 알림을 받아보세요!
              </span>
              <Link
                href={PAGE.MYPAGE_KEYWORD}
                className={cn(
                  'flex items-center justify-center',
                  button.size.xs.box,
                  button.size.xs.text,
                  button.tone.neutralOutline.box,
                  button.tone.neutralOutline.text,
                )}
              >
                키워드 알림
              </Link>
            </div>
          )}
        </div>
      )}
      {!loading && noData ? (
        <NoAlerts />
      ) : (
        <ul className="pc:divide-y pc:divide-gray-100">
          {notifications.map((notification) => {
            const isNew =
              new Date(notification.createdAt).getTime() > lastReadAt && !notification.readAt;
            return (
              <AlarmItem
                key={notification.id}
                notification={notification}
                onRead={onReadNotification}
                onDelete={onRemoveNotification}
                isNew={isNew}
                source={notificationSource(notification.keyword, watching, themes ?? [])}
              />
            );
          })}
          {hasNextData && <div ref={ref} className="h-12 w-full" />}
        </ul>
      )}
    </>
  );
}
