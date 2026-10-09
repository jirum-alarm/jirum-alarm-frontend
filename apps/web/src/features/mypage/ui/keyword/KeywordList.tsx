'use client';

import { useQuery } from '@tanstack/react-query';

import { PAGE } from '@/shared/config/page';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { trackAlarmLink } from '@/shared/lib/trackAlarmLink';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';

import { useUpdateKeyword } from '../../model/update-keyword';
import { useKeywordList } from '../../model/useKeywordList';

import KeywordItem from './KeywordItem';

/** 서버는 키워드를 소문자로 저장한다 — 비교도 소문자·앞뒤 공백 없이. */
const normalize = (keyword: string) => keyword.trim().toLowerCase();

const KeywordList = ({ focus }: { focus?: string }) => {
  const { notificationKeywordsByMe, onDeleteKeyword } = useKeywordList();
  const keywords = notificationKeywordsByMe ?? [];
  // 알림의 키워드 링크에서 왔으면 그 키워드를 맨 앞에 펼쳐 둔다(스크롤 없이 바로 보이게).
  const focused = focus ? normalize(focus) : undefined;
  const ordered = focused
    ? [
        ...keywords.filter((k) => normalize(k.keyword) === focused),
        ...keywords.filter((k) => normalize(k.keyword) !== focused),
      ]
    : keywords;

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-gray-900">내 키워드</h2>
        <div className="flex items-baseline gap-x-3">
          <span className="text-xs text-gray-500">{keywords.length}/20</span>
          {/* 키워드 화면이 막다른 길이던 자리 — 등록한 키워드로 받은 알림을 바로 본다. */}
          <Link
            href={PAGE.ALARM}
            onClick={() => trackAlarmLink('keyword_inbox')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            받은 알림 보기 ›
          </Link>
        </div>
      </div>
      {keywords.length === 0 ? (
        <EmptyKeywords />
      ) : (
        <>
          <p className="mt-1 text-xs text-gray-500">
            키워드를 누르면 알림 받을 조건을 바꿀 수 있어요.
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {ordered.map((keyword) => (
              <KeywordItem
                key={keyword.id}
                defaultOpen={normalize(keyword.keyword) === focused}
                keyword={{
                  id: Number(keyword.id),
                  keyword: keyword.keyword,
                  priceDropOnly: keyword.priceDropOnly ?? false,
                  excludeKeywords: keyword.excludeKeywords ?? [],
                  minPrice: keyword.minPrice ?? null,
                  maxPrice: keyword.maxPrice ?? null,
                }}
                onDelete={() => onDeleteKeyword(keyword.id)}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default KeywordList;

/**
 * 키워드 0개 — 빈 목록 대신 "무엇을 하면 되는지" 를 보여준다. 인기 키워드를 누르면 바로 등록된다
 * (앱 KeywordScreen 의 EmptyKeywords 와 같은 문구·동작). 알림함·검색에서 넘어온 신규 사용자가
 * 빈 화면에 서 있던 자리다. 등록하면 목록이 다시 받아져 이 화면은 저절로 사라진다.
 */
function EmptyKeywords() {
  const { toast } = useToast();
  const promptPushChannel = usePushChannelPrompt();
  const { data } = useQuery(AuthQueries.recommendedKeywords());
  const chips = (data?.recommendedNotificationKeywords ?? []).slice(0, 8);
  const { mutate, isPending } = useUpdateKeyword({
    source: 'mypage_recommend',
    onSuccess: ({ keyword }) => {
      toast.success(`'${keyword}' 키워드 알림을 등록했어요.`);
      promptPushChannel(keyword);
    },
  });

  return (
    <div className="flex flex-col items-center py-8 text-center">
      <p className="text-base font-semibold text-gray-900">아직 등록한 키워드가 없어요</p>
      <p className="mt-1 text-sm text-gray-500">
        갖고 싶은 상품 이름을 등록하면
        <br />새 핫딜이 올라올 때 바로 알려드려요
      </p>
      {chips.length > 0 && (
        <>
          <p className="mt-6 text-xs text-gray-500">요즘 많이 받는 키워드</p>
          <ul className="mt-2 flex flex-wrap justify-center gap-2">
            {chips.map((keyword) => (
              <li key={keyword}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => mutate({ keyword, fromRecommendation: true })}
                  aria-label={`${keyword} 키워드 알림 등록`}
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-50"
                >
                  {keyword}
                  <span className="text-gray-500">+</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
