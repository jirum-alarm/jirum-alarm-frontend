'use client';

import { useId } from 'react';

import { PushSettingKey, usePushSetting } from '../../model/usePushSetting';

const ROWS: { key: PushSettingKey; title: string; description: string }[] = [
  {
    key: 'keywordAlert',
    title: '키워드 알림',
    description: '등록한 키워드가 들어간 딜이 올라오면 알려드려요',
  },
  {
    key: 'hotDealAlert',
    title: '지금 뜨는 좋은 딜',
    description: '관심 카테고리에서 반응이 뜨거운 딜을 하루 최대 3번 알려드려요',
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
 * ponytail: 스위치 모양은 PriceDropOnlyToggle 과 같은 hidden checkbox + peer-checked 패턴.
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
          <input
            id={`${id}-${key}`}
            type="checkbox"
            className="peer hidden"
            checked={setting[key]}
            disabled={isPending}
            onChange={(e) => update({ [key]: e.target.checked })}
          />
          <label
            htmlFor={`${id}-${key}`}
            aria-label={title}
            className="peer-checked:bg-primary-500 relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-gray-300 transition-colors peer-disabled:opacity-50 peer-checked:[&>span]:translate-x-5"
          >
            <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform" />
          </label>
        </li>
      ))}
    </ul>
  );
};

export default PushSettingForm;
