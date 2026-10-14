import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';
import { useToast } from '@/shared/ui/common/Toast';

// 수기 TypedDocumentString — codegen 이 깨져 있어서(keyword-setting.service.ts 주석 참고).
export type PushSettingKey = 'keywordAlert' | 'marketing' | 'nightAlerts' | 'communityAlert';
/** 방해금지 시간(KST 시 0~23). 둘 다 null = 꺼짐 — 서버는 둘을 함께 받는다(하나만 보내면 거부). */
type QuietHoursSetting = { quietHoursStart: number | null; quietHoursEnd: number | null };
/** 키워드 알림 받는 기준 — ALL 올라오는 즉시 / HOT 핫딜·대박딜이 됐을 때만(서버 KeywordAlertLevel). */
export type KeywordAlertLevel = 'ALL' | 'HOT';
type PushSetting = Record<PushSettingKey, boolean> &
  QuietHoursSetting & { keywordAlertLevel: KeywordAlertLevel };

const QueryPushSetting = new TypedDocumentString<
  { pushSetting: PushSetting },
  Record<string, never>
>(`
  query QueryPushSetting {
    pushSetting {
      keywordAlert
      keywordAlertLevel
      marketing
      nightAlerts
      communityAlert
      quietHoursStart
      quietHoursEnd
    }
  }
`);

const MutationUpdatePushSetting = new TypedDocumentString<
  { updatePushSetting: boolean },
  Partial<PushSetting>
>(`
  mutation MutationUpdatePushSetting(
    $keywordAlert: Boolean
    $keywordAlertLevel: KeywordAlertLevel
    $marketing: Boolean
    $nightAlerts: Boolean
    $communityAlert: Boolean
    $quietHoursStart: Int
    $quietHoursEnd: Int
  ) {
    updatePushSetting(
      keywordAlert: $keywordAlert
      keywordAlertLevel: $keywordAlertLevel
      marketing: $marketing
      nightAlerts: $nightAlerts
      communityAlert: $communityAlert
      quietHoursStart: $quietHoursStart
      quietHoursEnd: $quietHoursEnd
    )
  }
`);

export const pushSettingQuery = queryOptions({
  queryKey: ['auth', 'pushSetting'],
  queryFn: () => execute(QueryPushSetting).then((res) => res.data.pushSetting),
});

export const usePushSetting = () => {
  const { data } = useSuspenseQuery(pushSettingQuery);
  const { update, isPending } = useUpdatePushSetting();
  return { setting: data, update, isPending };
};

/** 설정 바꾸기만(낙관적 갱신·실패 되돌림) — 설정 화면 밖(알림함 권유 등)에서도 쓴다. */
export const useUpdatePushSetting = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast.error('알림 설정 변경에 실패했습니다.');
    },
    onSuccess: (_data, variables) => {
      // 광고성 정보 수신 동의·철회는 처리 결과(일자)를 알려야 한다(정보통신망법 §50 ⑦).
      if (variables.marketing !== undefined) toast(marketingConsentMessage(variables.marketing));
    },
  });

  return { update: mutate, isPending };
};

/** 광고성 정보 수신 동의·철회 처리 결과 안내 문구. */
export const marketingConsentMessage = (agreed: boolean, now = new Date()) =>
  `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 광고성 정보 수신 ${
    agreed ? '동의' : '철회'
  }가 처리됐어요.`;
