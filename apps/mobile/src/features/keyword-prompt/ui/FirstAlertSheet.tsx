import React, {useEffect, useState} from 'react';
import {Pressable, View} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';

import BottomSheet from '@/shared/components/BottomSheet';
import Button from '@/shared/components/ui/Button';
import Chip from '@/shared/components/ui/Chip';
import {Text} from '@/shared/components/ui/Text/AppText';
import {HomeService} from '@/shared/api/home/home.service';
import {ProductService} from '@/shared/api/product/product.service';
import {StorageKey} from '@/shared/constant/storage-key';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {trackKeywordRegister} from '@/shared/lib/analytics/keyword-tracking';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';
import {showToast} from '@/shared/lib/feedback';
import {isFirstAlertDue, markFirstAlertShown} from '@/shared/lib/first-alert';
import {setAsyncStorage} from '@/shared/lib/persistence';

import {
  invalidateMyKeywords,
  openKeywordSettings,
} from '@/entities/mypage/model/myKeywords';
import {text} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling/className';

// 홈이 먼저 그려지고 숨 돌린 뒤 — PushPermissionPrePrompt 와 같은 박자.
const SHOW_DELAY_MS = 1500;
const MAX_CHIPS = 8;
const PLACEMENT = 'first_alert';

/**
 * 첫 실행에 한 번 — 「이런 거 싸게 뜨면 알려드릴까요?」 인기 키워드를 골라 탭 한 번에 알림 등록 + 권한 요청.
 *
 * 왜: 앱의 가치는 알림인데 키워드가 없으면 받을 게 없다. 10/12 로그인 벽을 없앤 뒤 처음 연 사람 대부분이
 * 게스트로 들어오지만 키워드를 건 사람은 거의 없었다(조건은 shared/lib/first-alert.ts). 계정보다 먼저 가치를 —
 * 로그인은 요구하지 않고, 고르는 즉시 이 기기 게스트 계정에 건다.
 *
 * - 고르지 않으면 버튼이 안 눌린다. 「나중에」·끌어내리기 = 다시 안 띄운다(홈 추천 칩·상세 권유가 남아 있다).
 * - 등록 뒤 OS 권한을 바로 묻는다 — 방금 「알림 받기」를 누른 맥락이 곧 사전 안내다. 사전 안내도 본 것으로 친다.
 * - 계측: keyword_prompt_view/click{placement=first_alert}, keyword_register{source=first_alert},
 *   push_permission_result{source=first_alert}.
 */
export default function FirstAlertSheet() {
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!(await isFirstAlertDue()) || cancelled) return;
      // 추천이 없으면 띄울 게 없다 — 본 것으로 치지 않고 다음 실행에 다시 본다.
      const recommended = await HomeService.getRecommendedKeywords().catch(
        () => [] as string[],
      );
      if (cancelled || recommended.length === 0) return;
      const chips = recommended.slice(0, MAX_CHIPS);
      setKeywords(chips);
      setVisible(true);
      markFirstAlertShown();
      Analytics.track('keyword_prompt_view', {
        placement: PLACEMENT,
        count: chips.length,
      });
    }, SHOW_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const toggle = (keyword: string) =>
    setSelected(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword],
    );

  const dismiss = (action: 'later' | 'custom') => {
    setVisible(false);
    Analytics.track('keyword_prompt_dismiss', {placement: PLACEMENT, action});
  };

  const confirm = async () => {
    if (selected.length === 0 || saving) return;
    setSaving(true);
    Analytics.track('keyword_prompt_click', {
      placement: PLACEMENT,
      count: selected.length,
    });
    const added: string[] = [];
    // 차례로 — 서버가 키워드 수 상한(20)·중복을 본다. 하나가 실패해도 나머지는 건다.
    for (const keyword of selected) {
      try {
        await ProductService.addNotificationKeyword({
          keyword,
          fromRecommendation: true,
        });
        trackKeywordRegister(PLACEMENT, keyword);
        added.push(keyword);
      } catch {
        // 이미 등록됨 등 — 토스트는 결과 한 번만.
      }
    }
    invalidateMyKeywords(queryClient);
    setSaving(false);
    setVisible(false);
    if (added.length === 0) {
      showToast.error(
        '키워드를 저장하지 못했어요. 잠시 뒤 다시 시도해 주세요.',
      );
      return;
    }
    const rest = added.length > 1 ? ` 외 ${added.length - 1}개` : '';
    showToast.success(`'${added[0]}'${rest} 알림을 등록했어요.`, {
      action: {label: '보기', onPress: openKeywordSettings},
    });
    // 시트를 닫은 뒤 묻는다 — iOS 는 Modal 이 남아 있으면 시스템 팝업이 뒤로 숨는다.
    setAsyncStorage(StorageKey.PUSH_PREPROMPT_SHOWN, true).catch(() => {});
    requestPushPermissionIfNeeded(PLACEMENT);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={() => dismiss('later')}
      accessibilityLabel="관심 키워드 알림 받기">
      <View className="px-5 pt-4">
        <Text className="text-center text-lg font-bold text-gray-900">
          이런 거 싸게 뜨면 알려드릴까요?
        </Text>
        <Text className="pt-2 text-center text-sm text-gray-600">
          {
            '골라 두면 핫딜이 올라올 때 바로 알려드려요.\n로그인 없이 받을 수 있어요.'
          }
        </Text>
        <View className="flex-row flex-wrap justify-center gap-2 pt-5">
          {keywords.map(keyword => (
            <Chip
              key={keyword}
              label={keyword}
              selected={selected.includes(keyword)}
              onPress={() => toggle(keyword)}
            />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          className="items-center pt-4"
          onPress={() => {
            dismiss('custom');
            openKeywordSettings();
          }}>
          <Text className={cn(text.muted, 'underline')}>
            찾는 게 없어요 · 직접 입력하기
          </Text>
        </Pressable>
        <View className="flex-row gap-3 pt-5">
          <Button
            color="secondary"
            className="flex-1"
            onPress={() => dismiss('later')}>
            나중에
          </Button>
          <Button
            className="flex-1"
            loading={saving}
            disabled={selected.length === 0}
            onPress={confirm}>
            {selected.length === 0
              ? '골라 주세요'
              : `${selected.length}개 알림 받기`}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
