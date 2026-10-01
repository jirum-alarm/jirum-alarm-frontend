import {useCallback, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import {MyPageService, type MyKeyword} from '@/shared/api/mypage';
import {showToast} from '@/shared/lib/feedback';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';

import {invalidateMyKeywords} from '@/features/keyword-prompt/model/myKeywords';

import {isValidKeyword} from '../lib/validation';

/**
 * 키워드 알림 화면의 입력 + 목록 + 토글. web
 * `useKeywordInput` · `useKeywordList` · `update-keyword` · `remove-keyword` ·
 * `update-price-drop-only` 를 한 뷰모델로 합쳤다(화면이 하나라 나눌 이유가 없다).
 *
 * ★web 처럼 등록 성공 뒤 알림 권한을 묻는다(`requestPushPermissionIfNeeded`).
 * "앱 진입 때 이미 요청한다"는 iOS 에서만 맞다 — RNFirebase `requestPermission`
 * 은 Android 에서 no-op 이라 Android 13+ 는 POST_NOTIFICATIONS 를 물은 적이 없다.
 * 이미 허용이거나 다시 물을 수 없으면(iOS 거부 확정) 아무것도 안 한다.
 */
export function useKeywordViewModel() {
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const {
    data: keywords,
    isPending,
    isError,
    refetch,
  } = useQuery(MyPageQueries.keywords());

  // 상세 권유 캐시(user·notificationKeywords)도 같이 — 여기서 지운 키워드가 상세에 "등록됨" 으로 남지 않게.
  const invalidate = useCallback(
    () => invalidateMyKeywords(queryClient),
    [queryClient],
  );

  const reset = useCallback(() => {
    setValue('');
    setError(false);
  }, []);

  const {mutate: addKeyword, isPending: isAdding} = useMutation({
    mutationFn: MyPageService.addKeyword,
    onSuccess: () => {
      reset();
      showToast.success('키워드 알림을 등록했어요.');
      requestPushPermissionIfNeeded();
      return invalidate();
    },
    // 서버가 '이미 등록된 키워드'·'최대 20개 초과' 같은 이유를 준다(추천 키워드와 같게).
    onError: (error: unknown) =>
      showToast.error(
        (error instanceof Error && error.message) ||
          '키워드 저장에 실패했어요.',
      ),
  });

  const {mutate: removeKeyword} = useMutation({
    mutationFn: MyPageService.removeKeyword,
    // 목록에서 즉시 지운다. 실패하면 되돌린다 —
    // 삭제는 누른 자리가 바로 사라져야 눌린 걸 알 수 있다.
    onMutate: async ({id}) => {
      await queryClient.cancelQueries({
        queryKey: MyPageQueries.keys.keywords(),
      });
      const previous = queryClient.getQueryData<MyKeyword[]>(
        MyPageQueries.keys.keywords(),
      );
      queryClient.setQueryData<MyKeyword[]>(
        MyPageQueries.keys.keywords(),
        old => (old ?? []).filter(k => Number(k.id) !== id),
      );
      const removed = previous?.find(k => Number(k.id) === id);
      return {previous, removed};
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          MyPageQueries.keys.keywords(),
          context.previous,
        );
      }
      showToast.error('키워드 삭제에 실패했어요.');
    },
    // ★확인 시트 대신 되돌리기 — 원탭 삭제는 빠르지만 잘못 누르면 가격 하락 설정까지 날아갔다.
    // 되살릴 땐 설정(priceDropOnly)도 그대로 다시 건다. 새 id 로 만들어지지만 사용자에겐 같은 키워드다.
    onSuccess: (_data, _vars, context) => {
      const removed = context?.removed;
      if (!removed) return;
      showToast.success(`'${removed.keyword}' 키워드를 삭제했어요.`, {
        label: '되돌리기',
        onPress: () => {
          MyPageService.addKeyword({
            keyword: removed.keyword,
            priceDropOnly: removed.priceDropOnly ?? false,
          })
            .catch(() => showToast.error('되돌리지 못했어요.'))
            .finally(() => invalidate());
        },
      });
    },
    onSettled: () => invalidate(),
  });

  const {mutate: updatePriceDropOnly, isPending: isTogglingPriceDrop} =
    useMutation({
      mutationFn: MyPageService.updateKeywordPriceDropOnly,
      onMutate: async ({id, priceDropOnly}) => {
        await queryClient.cancelQueries({
          queryKey: MyPageQueries.keys.keywords(),
        });
        const previous = queryClient.getQueryData<MyKeyword[]>(
          MyPageQueries.keys.keywords(),
        );
        queryClient.setQueryData<MyKeyword[]>(
          MyPageQueries.keys.keywords(),
          old =>
            (old ?? []).map(k =>
              Number(k.id) === id ? {...k, priceDropOnly} : k,
            ),
        );
        return {previous};
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            MyPageQueries.keys.keywords(),
            context.previous,
          );
        }
        showToast.error('알림 설정 변경에 실패했어요.');
      },
      onSettled: () => invalidate(),
    });

  const handleChange = useCallback((next: string) => {
    setValue(next);
    setError(!isValidKeyword(next));
  }, []);

  const canSubmit = !!value && !error && !isAdding;

  const submit = useCallback(() => {
    if (!canSubmit) return;
    addKeyword({keyword: value.trim()});
  }, [addKeyword, canSubmit, value]);

  /** 추천 칩 — 입력 없이 바로 등록한다. */
  const addDirect = useCallback(
    (keyword: string) => {
      if (isAdding) return;
      addKeyword({keyword, fromRecommendation: true});
    },
    [addKeyword, isAdding],
  );

  return {
    keywords: keywords ?? [],
    isPending,
    isError,
    refetch,
    value,
    error,
    canSubmit,
    handleChange,
    reset,
    submit,
    addDirect,
    isAdding,
    removeKeyword: (id: string) => removeKeyword({id: Number(id)}),
    updatePriceDropOnly: (id: string, priceDropOnly: boolean) =>
      updatePriceDropOnly({id: Number(id), priceDropOnly}),
    isTogglingPriceDrop,
  };
}
