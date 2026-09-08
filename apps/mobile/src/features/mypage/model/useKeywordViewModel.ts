import {useCallback, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import {MyPageService, type MyKeyword} from '@/shared/api/mypage';
import {showToast} from '@/shared/lib/feedback';

import {isValidKeyword} from '../lib/validation';

/**
 * 키워드 알림 화면의 입력 + 목록 + 토글. web
 * `useKeywordInput` · `useKeywordList` · `update-keyword` · `remove-keyword` ·
 * `update-price-drop-only` 를 한 뷰모델로 합쳤다(화면이 하나라 나눌 이유가 없다).
 *
 * ★web 은 등록 성공 뒤 `useFcmPermission().requestPermission()` 을 부른다.
 * 앱은 **옮기지 않는다** — 알림 권한은 `useFCMTokenManager`(FCMHandler)가 앱
 * 진입 때 이미 요청하고 토큰까지 서버에 등록한다. 여기서 또 요청하면 이미
 * 결정된 권한이라 아무 일도 안 나거나(권한 허용) OS 가 무시한다(거부).
 * 웹 전용 보상 로직이지 앱에서 잃는 동작이 아니다.
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

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({queryKey: MyPageQueries.keys.keywords()}),
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
      return invalidate();
    },
    onError: () => showToast.info('키워드 저장에 실패했습니다.'),
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
      return {previous};
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          MyPageQueries.keys.keywords(),
          context.previous,
        );
      }
      showToast.info('키워드 삭제에 실패했습니다.');
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
        showToast.info('알림 설정 변경에 실패했습니다.');
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
    removeKeyword: (id: string) => removeKeyword({id: Number(id)}),
    updatePriceDropOnly: (id: string, priceDropOnly: boolean) =>
      updatePriceDropOnly({id: Number(id), priceDropOnly}),
    isTogglingPriceDrop,
  };
}
