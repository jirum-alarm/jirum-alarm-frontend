'use client';

import { useId } from 'react';

import Switch from '@/shared/ui/common/Switch';

import { PushSettingKey, usePushSetting } from '../../model/usePushSetting';

const ROWS: { key: PushSettingKey; title: string; description: string }[] = [
  {
    key: 'keywordAlert',
    title: '키워드 알림',
    description:
      '등록한 키워드가 들어간 딜이 올라오면 알려드려요. 관심사 알림은 각 관심사 화면에서 끌 수 있어요',
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
 * 계정 단위 푸시 설정. 백엔드(pushSetting / updatePushSetting)는 있었는데 화면이 없어서
 * 2026-10-01 기준 1,204명 전원이 기본값 그대로였다(야간 동의 0명 → 밤 알림 전부 아침으로 밀림).
 */
const PushSettingForm = () => {
  const id = useId();
  const { setting, update, isPending } = usePushSetting();

  return (
    <ul>
      {ROWS.map(({ key, title, description }) => (
        <li key={key} className="flex items-center gap-4 border-b border-gray-200 py-4">
          <label
            htmlFor={`${id}-${key}`}
            className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5"
          >
            <span className="font-medium text-gray-900">{title}</span>
            <span className="text-sm text-gray-500">{description}</span>
          </label>
          <Switch
            id={`${id}-${key}`}
            aria-label={title}
            checked={setting[key]}
            disabled={isPending}
            onCheckedChange={(next) => update({ [key]: next })}
          />
        </li>
      ))}
    </ul>
  );
};

export default PushSettingForm;
