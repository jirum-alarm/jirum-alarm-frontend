import React, {useState} from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import ConfirmSheet from '@/shared/components/ConfirmSheet';
import PressableScale from '@/shared/components/PressableScale';
import {showToast} from '@/shared/lib/feedback';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {PendingActionType} from '@/shared/lib/pending-action';

/**
 * 판매 종료 제보. web ProductReport 와 같은 문구·위치(커뮤니티 반응 아래).
 * 확인은 앱 공용 `ConfirmSheet` — 다른 확인 시트와 모양을 맞춘다. tone 을 danger 로
 * 두지 않는 건 제보가 지우는 동작이 아니라서다.
 */
export default function ProductReport({
  productId,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const queryClient = useQueryClient();
  const {requireLogin} = useRequireLogin(`/products/${productId}`);
  const {data: stats} = useQuery(ProductQueries.stats({id: productId}));
  const [open, setOpen] = useState(false);

  const {mutate, isPending} = useMutation({
    mutationFn: () => ProductService.reportExpiredProduct({productId}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ProductQueries.keys.stats(productId),
      });
      setOpen(false);
      showToast.info('제보해주셔서 감사해요');
    },
    onError: () => {
      setOpen(false);
      showToast.info('이미 종료 제보된 상품이에요.');
    },
  });

  usePendingAction(PendingActionType.PRODUCT_REPORT, () => {
    setOpen(true);
  });

  if (stats?.isMyReported) {
    return (
      <View className="h-14 flex-row items-center rounded-lg border border-gray-200 bg-white px-4">
        <Text className="text-sm text-gray-600">
          종료된 상품으로 제보해주셔서 감사해요 😄
        </Text>
      </View>
    );
  }

  return (
    <>
      <View className="h-14 flex-row items-center justify-between rounded-lg border border-gray-200 bg-white px-4">
        <Text className="text-sm text-gray-600">
          혹시 판매가 종료된 상품인가요?
        </Text>
        <PressableScale
          onPress={() => {
            if (requireLogin(PendingActionType.PRODUCT_REPORT)) return;
            setOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="종료 제보하기">
          <Text className="text-sm text-gray-900">제보하기</Text>
        </PressableScale>
      </View>

      <ConfirmSheet
        visible={open}
        title="판매가 종료된 상품인가요?"
        description={'더 빠른 핫딜 확인을 위해\n종료된 상품을 제보해주세요!'}
        confirmLabel="종료 제보하기"
        loading={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={() => mutate()}
      />
    </>
  );
}
