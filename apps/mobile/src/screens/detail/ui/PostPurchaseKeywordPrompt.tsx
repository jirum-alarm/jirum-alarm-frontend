import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {fixed} from '@jirum/design-system';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import PressableScale from '@/shared/components/PressableScale';
import {CheckIcon} from '@/shared/components/icons';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {showToast, tick} from '@/shared/lib/feedback';
import {trackKeywordRegister} from '@/shared/lib/analytics/keyword-tracking';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {PendingActionType} from '@/shared/lib/pending-action';
import {useAuth} from '@/shared/hooks/useAuth';

import {deriveKeyword} from '@jirum/domain/derive-keyword';
import {invalidateMyKeywords} from '@/features/keyword-prompt/model/myKeywords';

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
  const {requireAlertSession} = useRequireLogin(`/products/${productId}`);
  // 게스트도 키워드를 걸 수 있다 — 등록 여부 조회·등록 모두 세션(회원·게스트) 기준.
  const {isLogin: hasSession} = useAuth();

  const keyword = deriveKeyword(title);
  const hasKeyword = Array.from(keyword).length >= MIN_KEYWORD_LENGTH;

  // 이미 등록된 키워드면 권유를 띄우지 않는다 — 눌러야 알려주는 것보다 낫고,
  // 지표도 "등록 가능한 경우"만 세게 되어 등록률이 정확해진다.
  const {data: myKeywords} = useQuery({
    ...ProductQueries.myKeywords({limit: 20}),
    enabled: show && hasSession && hasKeyword,
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
        // 전부 받기 — 하락 전용은 기준가가 방금 본 핫딜 가격이라 첫 알림이 거의 안 왔다(web 과 같음).
      }),
    onSuccess: () => {
      trackKeywordRegister('post_purchase', keyword);
      // 배너를 없애지 않고 안내 문구로 바꾼다. 사라지면 등록된 건지 눌림이
      // 씹힌 건지 알 수 없다 — 결과를 남겨두는 쪽이 신뢰를 만든다.
      // 토스트 없이 문구만 바뀌므로 손에도 «됐다»를 준다.
      tick();
      setDone(true);
      invalidateMyKeywords(queryClient);
      // web 과 같은 자리 — 알림 권한이 아직 없고 물어볼 수 있을 때만 묻는다.
      requestPushPermissionIfNeeded();
    },
    onError: error => {
      const message =
        error instanceof Error ? error.message : String(error ?? '');
      if (message.includes('이미 등록된')) {
        setDone(true);
        return;
      }
      showToast.error(message || '키워드 저장에 실패했어요.');
    },
  });

  usePendingAction(PendingActionType.NOTIFICATION_KEYWORD_ADD, () => {
    addKeyword();
  });

  const visible = show && hasKeyword && (done || !alreadyRegistered);

  // 띄울 게 없으면(키워드를 못 뽑았거나 이미 등록) 곧바로 다음 권유로 넘긴다. 예전엔 null 만
  // 돌려 큐가 여기서 멈췄다 — [keyword, kakao] 순서인 사람은 오카방 권유를 영영 못 봤다.
  const skip = show && !visible && (!hasKeyword || myKeywords !== undefined);
  useEffect(() => {
    if (skip) onClose();
  }, [skip, onClose]);

  // 상품이 바뀌면 이전 상품의 완료 상태가 남지 않도록 초기화.
  useEffect(() => {
    setDone(false);
  }, [title]);

  // 구매 웹뷰가 위에 떠 있는 동안은 못 보는 노출이다 — 상세가 앞에 왔을 때 센다(PostPurchaseKakaoPrompt 와 같다).
  const focused = useIsFocused();
  const counted = useRef(false);
  useEffect(() => {
    if (!visible || done) {
      counted.current = false;
      return;
    }
    if (!focused || counted.current) return;
    counted.current = true;
    Analytics.track('keyword_prompt_view', {keyword});
  }, [visible, done, focused, keyword]);

  if (!visible) return null;

  if (done) {
    return (
      <View
        accessibilityRole="alert"
        className="flex-row items-center gap-x-3 bg-secondary-50 px-5 py-3">
        <View className="h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-500">
          <CheckIcon
            width={15}
            height={15}
            color={fixed.white}
            strokeWidth={2.2}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-semibold text-gray-800">
            알림을 등록했어요
          </Text>
          <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
            ‘{keyword}’ 새 딜이 나오면 알려드려요
          </Text>
        </View>
        <PressableScale
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="알림 안내 닫기">
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
          또 뜨면 알려드릴까요?
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
          ‘{keyword}’ 핫딜이 올라오면 알려드려요
        </Text>
      </View>
      <View className="flex-row items-center">
        <PressableScale
          onPress={() => {
            Analytics.track('keyword_prompt_click', {
              keyword,
              logged_in: isUserLogin,
            });
            if (
              requireAlertSession(PendingActionType.NOTIFICATION_KEYWORD_ADD)
            ) {
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
        <PressableScale
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="알림 안내 닫기">
          <View className="h-11 justify-center px-2">
            <Text className="text-xs text-gray-500">닫기</Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}
