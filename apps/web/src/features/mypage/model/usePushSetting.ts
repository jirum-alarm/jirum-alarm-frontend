import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';
import { useToast } from '@/shared/ui/common/Toast';

// 수기 TypedDocumentString — codegen 이 깨져 있어서(keyword-setting.service.ts 주석 참고).
export type PushSettingKey = 'keywordAlert' | 'marketing' | 'nightAlerts' | 'communityAlert';
type PushSetting = Record<PushSettingKey, boolean>;

const QueryPushSetting = new TypedDocumentString<
  { pushSetting: PushSetting },
  Record<string, never>
>(`
  query QueryPushSetting {
    pushSetting {
      keywordAlert
      marketing
      nightAlerts
      communityAlert
    }
  }
`);

const MutationUpdatePushSetting = new TypedDocumentString<
  { updatePushSetting: boolean },
  Partial<PushSetting>
>(`
  mutation MutationUpdatePushSetting(
    $keywordAlert: Boolean
    $marketing: Boolean
    $nightAlerts: Boolean
    $communityAlert: Boolean
  ) {
    updatePushSetting(
      keywordAlert: $keywordAlert
      marketing: $marketing
      nightAlerts: $nightAlerts
      communityAlert: $communityAlert
    )
  }
`);

const pushSettingQuery = queryOptions({
  queryKey: ['auth', 'pushSetting'],
  queryFn: () => execute(QueryPushSetting).then((res) => res.data.pushSetting),
});

export const usePushSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(pushSettingQuery);

  const { mutate, isPending } = useMutation({
    mutationFn: (variables: Partial<PushSetting>) => execute(MutationUpdatePushSetting, variables),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: pushSettingQuery.queryKey });
      const previous = queryClient.getQueryData(pushSettingQuery.queryKey);
      queryClient.setQueryData(pushSettingQuery.queryKey, (old) =>
        old ? { ...old, ...variables } : old,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(pushSettingQuery.queryKey, context?.previous);
      toast('알림 설정 변경에 실패했습니다.');
    },
    onSuccess: (_data, variables) => {
      // 광고성 정보 수신 동의·철회는 처리 결과(일자)를 알려야 한다(정보통신망법 §50 ⑦).
      if (variables.marketing !== undefined) toast(marketingConsentMessage(variables.marketing));
    },
  });

  return { setting: data, update: mutate, isPending };
};

/** 광고성 정보 수신 동의·철회 처리 결과 안내 문구. */
export const marketingConsentMessage = (agreed: boolean, now = new Date()) =>
  `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 광고성 정보 수신 ${
    agreed ? '동의' : '철회'
  }가 처리됐어요.`;
