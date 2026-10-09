'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { PendingActionType, usePendingAction } from '@/shared/lib/pending-action';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import Button from '@/shared/ui/common/Button';
import Input from '@/shared/ui/common/Input';
import { useToast } from '@/shared/ui/common/Toast';

import { ProductQueries } from '@/entities/product';

import { useUpdateKeyword } from '@/features/mypage/model';
import { deriveKeyword } from '@/features/product-detail/lib/deriveKeyword';

const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORD_LENGTH = 20;

const segmentCount = (value: string) => [...new Intl.Segmenter().segment(value.trim())].length;

function pushEvent(event: string, props: Record<string, unknown>) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    ...props,
  });
}

/**
 * 가입 직후 키워드 1개를 받는다. 보다 온 상품이 있으면 그 제목에서 뽑은 키워드를 채워 둔다.
 *
 * 2026-10-05 실측: 웹 가입자의 83%가 첫 방문 1시간 안에 가입했고(찜·구매 클릭 직후), 가입 후
 * 78%는 키워드·찜을 하나도 안 남겼다. 이 화면은 "키워드를 등록해보세요" 문장과 홈 버튼뿐이라
 * 의향이 가장 높은 순간을 그냥 흘려보냈다. 등록하면 "어디로 받을까요" 시트가 이어진다.
 */
export default function SignupKeyword({ productId }: { productId: number | null }) {
  const { toast } = useToast();
  const promptPushChannel = usePushChannelPrompt();
  const [input, setInput] = useState('');
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const { data: product } = useQuery({
    ...ProductQueries.productInfo({ id: productId ?? 0 }),
    enabled: productId !== null,
  });
  const suggested = product ? deriveKeyword(product.title) : '';

  // 사용자가 손대기 전까지만 추천으로 채운다 — 지운 걸 다시 채우면 입력이 싸운다.
  const value = touched ? input : suggested;

  useEffect(() => {
    pushEvent('signup_keyword_view', { has_suggestion: productId !== null });
  }, [productId]);

  const { mutate, isPending } = useUpdateKeyword({
    source: 'signup_complete',
    onSuccess: ({ keyword }) => {
      setDone(keyword);
      promptPushChannel(keyword);
    },
    onError: (error) => {
      const gql = error as { response?: { errors?: { message?: string }[] } };
      const message = gql?.response?.errors?.[0]?.message ?? '';
      if (message.includes('이미 등록된')) {
        setDone(value.trim());
        return;
      }
      toast(message || '키워드 저장에 실패했습니다.');
    },
  });

  // 가입 전에 "알림 받기"를 누르고 로그인 벽을 만났다면(추천 칩·구매 후·검색 결과 없음),
  // 신규 가입자는 원래 화면이 아니라 여기로 온다 — 그 의도를 여기서 이어서 등록한다.
  usePendingAction<string>(PendingActionType.NOTIFICATION_KEYWORD_ADD, (pending) => {
    if (!pending) return;
    setTouched(true);
    setInput(pending);
    mutate({ keyword: pending });
  });

  const length = segmentCount(value);
  const invalid = touched && (length < MIN_KEYWORD_LENGTH || length > MAX_KEYWORD_LENGTH);
  const canSubmit = length >= MIN_KEYWORD_LENGTH && length <= MAX_KEYWORD_LENGTH && !isPending;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
    const keyword = value.trim();
    pushEvent('signup_keyword_submit', { used_suggestion: !!suggested && keyword === suggested });
    mutate({ keyword });
  };

  if (done) {
    return (
      <div role="status" className="bg-secondary-50 rounded-lg px-4 py-4 text-left">
        <p className="text-sm font-semibold text-gray-900">알림을 등록했어요</p>
        <p className="mt-1 text-sm text-gray-600">‘{done}’ 핫딜이 올라오면 바로 알려드릴게요</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="text-left">
      <p className="pb-3 text-center font-semibold text-gray-900">
        기다리는 상품이 있나요?
        <br />
        <span className="text-sm font-normal text-gray-500">
          키워드를 남기면 핫딜이 뜰 때 알려드려요
        </span>
      </p>
      <Input
        type="text"
        placeholder="예: 에어팟, 생수, 라면"
        error={invalid}
        helperText={invalid ? '키워드는 2자 이상 20자까지 입력할 수 있어요.' : undefined}
        value={value}
        onChange={(e) => {
          setTouched(true);
          setInput(e.currentTarget.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault();
        }}
      />
      <Button type="submit" className="mt-3 w-full" disabled={!canSubmit}>
        {isPending ? '등록 중' : '알림 받기'}
      </Button>
    </form>
  );
}
