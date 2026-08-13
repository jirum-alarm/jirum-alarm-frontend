import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import Svg, {Path} from 'react-native-svg';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import PressableScale from '@/shared/components/PressableScale';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';
import {showToast} from '@/shared/lib/feedback';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {PendingActionType} from '@/shared/lib/pending-action';

import {deriveKeyword} from '@/features/keyword-prompt/model/deriveKeyword';

/** 키워드 등록 최소 길이. web MIN_KEYWORD_LENGTH 와 맞춘다. */
const MIN_KEYWORD_LENGTH = 2;

/**
 * 구매 링크를 누른 직후에만 뜨는 알림 등록 배너.
 *
 * ★ 글자 수는 Array.from 으로 센다.
 * web 은 Intl.Segmenter 를 쓰지만 Hermes 지원이 확실하지 않다. 한글·영문은
 * 코드포인트 단위로 충분하고, 이모지가 든 제목은 어차피 키워드로 부적합하다.
 */
export default function PostPurchaseKeywordPrompt({
  show,
  title,
  productId,
  isUserLogin,
  onClose,
}: {
  show: boolean;
  title: string;
  productId: number;
  isUserLogin: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [done, setDone] = useState(false);
  const {requireLogin} = useRequireLogin(`/products/${productId}`);

  const keyword = deriveKeyword(title);
  const hasKeyword = Array.from(keyword).length >= MIN_KEYWORD_LENGTH;

  // 이미 등록된 키워드면 권유를 띄우지 않는다 — 눌러야 알려주는 것보다 낫고,
  // 지표도 "등록 가능한 경우"만 세게 되어 등록률이 정확해진다.
  const {data: myKeywords} = useQuery({
    ...ProductQueries.myKeywords({limit: 20}),
    enabled: show && isUserLogin && hasKeyword,
  });

  const alreadyRegistered = (myKeywords ?? []).some(
    // 서버가 저장할 때 소문자로 바꾸므로 비교도 소문자로.
    item => item?.keyword?.toLowerCase() === keyword.toLowerCase(),
  );

  const {mutate: addKeyword, isPending} = useMutation({
    mutationFn: () =>
      ProductService.addNotificationKeyword({
        keyword,
        fromRecommendation: true,
        priceDropOnly: true,
      }),
    onSuccess: () => {
      // 배너를 없애지 않고 안내 문구로 바꾼다. 사라지면 등록된 건지 눌림이
      // 씹힌 건지 알 수 없다 — 결과를 남겨두는 쪽이 신뢰를 만든다.
      setDone(true);
      queryClient.invalidateQueries({
        queryKey: ProductQueries.keys.myKeywords(),
      });
    },
    onError: error => {
      const message =
        error instanceof Error ? error.message : String(error ?? '');
      if (message.includes('이미 등록된')) {
        setDone(true);
        return;
      }
      showToast.info(message || '키워드 저장에 실패했습니다.');
    },
  });

  usePendingAction(PendingActionType.NOTIFICATION_KEYWORD_ADD, () => {
    addKeyword();
  });

  const visible = show && hasKeyword && (done || !alreadyRegistered);

  // 상품이 바뀌면 이전 상품의 완료 상태가 남지 않도록 초기화.
  useEffect(() => {
    setDone(false);
  }, [title]);

  useEffect(() => {
    if (!visible || done) return;
    MixpanelService.track('keyword_prompt_view', {keyword});
  }, [visible, done, keyword]);

  if (!visible) return null;

  if (done) {
    return (
      <View
        accessibilityRole="alert"
        className="flex-row items-center gap-x-3 bg-secondary-50 px-5 py-3">
        <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-500">
          {/* ✓ 글리프 대신 SVG — 글꼴에 U+2713 이 없으면 두부가 된다. */}
          <Svg width={15} height={15} viewBox="0 0 20 20" fill="none">
            <Path
              d="M4 10.5l4 4 8-8.5"
              stroke="#ffffff"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-gray-800">
            알림을 등록했어요
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
            ‘{keyword}’ 새 딜이 나오면 알려드려요
          </Text>
        </View>
        <PressableScale onPress={onClose} accessibilityLabel="알림 안내 닫기">
          <View className="h-11 justify-center px-2">
            <Text className="text-xs text-gray-500">닫기</Text>
          </View>
        </PressableScale>
      </View>
    );
  }

  return (
    <View className="flex-row items-center gap-x-3 bg-gray-50 px-5 py-3">
      <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200">
        <Text className="text-xs">🔔</Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-semibold text-gray-800">
          더 싸지면 알려드릴까요?
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          ‘{keyword}’ 가격을 지켜볼게요
        </Text>
      </View>
      <View className="flex-row items-center">
        <PressableScale
          onPress={() => {
            MixpanelService.track('keyword_prompt_click', {
              keyword,
              logged_in: isUserLogin,
            });
            if (requireLogin(PendingActionType.NOTIFICATION_KEYWORD_ADD)) {
              return;
            }
            addKeyword();
          }}
          disabled={isPending}
          accessibilityRole="button"
          accessibilityLabel="알림 받기">
          <View className="h-11 justify-center px-2">
            <Text className="text-xs font-semibold text-secondary-600">
              {isPending ? '등록 중' : '알림 받기'}
            </Text>
          </View>
        </PressableScale>
        <PressableScale onPress={onClose} accessibilityLabel="알림 안내 닫기">
          <View className="h-11 justify-center px-2">
            <Text className="text-xs text-gray-500">닫기</Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}
