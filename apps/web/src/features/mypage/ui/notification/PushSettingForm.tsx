'use client';

import { text } from '@jirum/design-system/recipes';
import { Fragment, useId } from 'react';

import Switch from '@/shared/ui/common/Switch';

import { PushSettingKey, usePushSetting } from '@/entities/notification/model/usePushSetting';

import QuietHoursRow from './QuietHoursRow';

const ROWS: { key: PushSettingKey; title: string; description: string }[] = [
  {
    key: 'keywordAlert',
    title: '키워드 알림',
    description: '등록한 키워드나 구독한 관심사의 딜이 올라오면 알려드려요',
  },
  {
    // 푸시 통로가 없어 알림함에만 쌓이는 키워드 알림을 하루 한 통으로(crawling send_email_digest). 토큰이 있으면 안 보낸다.
    key: 'emailDigest',
    title: '키워드 알림 이메일로 받기',
    description: '앱·웹 알림을 받지 않는 동안, 새 딜을 하루 한 번 가입 이메일로 모아 보내드려요',
  },
  {
    // 광고성 정보(정보통신망법 §50) — 서버는 이 동의(marketing)한 유저에게만 "(광고)" 를 붙여 낮에만 보낸다.
    key: 'marketing',
    title: '지금 뜨는 좋은 딜 (광고성 정보 수신 동의)',
    description: '관심 카테고리에서 반응이 뜨거운 딜을 낮 시간에 하루 최대 3번 알려드려요',
  },
  {
    key: 'communityAlert',
    title: '커뮤니티 알림',
    description: '내 글·댓글에 달린 댓글과 좋아요',
  },
  {
    key: 'nightAlerts',
    title: '야간 알림 수신 동의 (21~08시)',
    description: '끄면 밤사이 알림은 아침 8시에 모아서 보내드려요',
  },
];

/**
 * 키워드 알림 받는 기준(서버 keywordAlertLevel). 끄면 딜이 올라오자마자, 켜면 인기글이 되거나 근거로 대박딜이 됐을 때
 * 「콜라 핫딜 떴어요 🔥」로 받는다. 조건(가격·제외 단어)을 늘리는 대신 단계 하나 — 조건은 거의 아무도 안 썼다(10/12).
 * 앱 NotificationSettingScreen 과 같은 문구.
 */
const HOT_ONLY = {
  title: '핫딜이 되면만 받기',
  description:
    '딜이 올라오자마자가 아니라, 반응이 뜨거워지거나 확실히 싸다고 확인됐을 때만 알려드려요',
};

/**
 * 계정 단위 푸시 설정. 백엔드(pushSetting / updatePushSetting)는 있었는데 화면이 없어서
 * 사용자 전원이 기본값 그대로였다(야간 동의 0명 → 밤 알림 전부 아침으로 밀림).
 */
const PushSettingForm = () => {
  const id = useId();
  const { setting, update, isPending } = usePushSetting();

  return (
    <ul>
      {ROWS.map(({ key, title, description }) => (
        <Fragment key={key}>
          <li className="flex items-center gap-4 border-b border-gray-200 py-4">
            <label
              htmlFor={`${id}-${key}`}
              className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5"
            >
              <span className="font-medium text-gray-900">{title}</span>
              <span className={text.muted}>{description}</span>
            </label>
            <Switch
              id={`${id}-${key}`}
              aria-label={title}
              checked={setting[key]}
              disabled={isPending}
              onCheckedChange={(next) => update({ [key]: next })}
            />
          </li>
          {key === 'keywordAlert' && setting.keywordAlert ? (
            <li className="flex items-center gap-4 border-b border-gray-200 py-4 pl-4">
              <label
                htmlFor={`${id}-hot-only`}
                className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5"
              >
                <span className="font-medium text-gray-900">{HOT_ONLY.title}</span>
                <span className={text.muted}>{HOT_ONLY.description}</span>
              </label>
              <Switch
                id={`${id}-hot-only`}
                aria-label={HOT_ONLY.title}
                checked={setting.keywordAlertLevel === 'HOT'}
                disabled={isPending}
                onCheckedChange={(next) => update({ keywordAlertLevel: next ? 'HOT' : 'ALL' })}
              />
            </li>
          ) : null}
        </Fragment>
      ))}
      <QuietHoursRow
        start={setting.quietHoursStart}
        end={setting.quietHoursEnd}
        nightAlerts={setting.nightAlerts}
        disabled={isPending}
        onChange={update}
      />
    </ul>
  );
};

export default PushSettingForm;
