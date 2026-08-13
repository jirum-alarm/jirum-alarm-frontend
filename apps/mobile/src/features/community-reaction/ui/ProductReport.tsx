import React, {useState} from 'react';
import {Modal, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {ProductService} from '@/shared/api/product/product.service';
import Button from '@/shared/components/ui/Button';
import PressableScale from '@/shared/components/PressableScale';
import {showToast} from '@/shared/lib/feedback';
import {
  usePendingAction,
  useRequireLogin,
} from '@/shared/hooks/useRequireLogin';
import {PendingActionType} from '@/shared/lib/pending-action';

/**
 * 판매 종료 제보. web ProductReport 와 같은 문구·위치(커뮤니티 반응 아래).
 * 확인 시트는 댓글 메뉴와 같이 Modal 자작 — 버튼 2개라 라이브러리가 필요 없다.
 */
export default function ProductReport({
  productId,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const insets = useSafeAreaInsets();
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
      showToast.info('제보해주셔서 감사해요 :)');
    },
    onError: () => {
      setOpen(false);
      showToast.info('이미 종료 제보된 상품입니다 :(');
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

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}>
          <Pressable onPress={() => {}}>
            <View
              className="rounded-t-[20px] bg-white px-5 pt-8"
              style={{paddingBottom: Math.max(insets.bottom, 20)}}>
              <Text className="text-center text-xl font-bold text-gray-900">
                판매가 종료된 상품인가요?
              </Text>
              <Text className="py-3 text-center text-gray-700">
                더 빠른 핫딜 확인을 위해{'\n'}종료된 상품을 제보해 주세요!
              </Text>
              <View className="flex-row gap-3 pt-2">
                <Button
                  color="secondary"
                  className="flex-1"
                  onPress={() => setOpen(false)}>
                  취소
                </Button>
                <Button
                  className="flex-1"
                  loading={isPending}
                  onPress={() => mutate()}>
                  종료 제보하기
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
