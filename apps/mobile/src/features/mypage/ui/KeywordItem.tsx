import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/Text/TextField';
import Close from '@/shared/components/icons/Close';
import type {MyKeyword} from '@/shared/api/mypage';
import {useColors} from '@/shared/theme/useColors';

import {
  parseExcludeKeywords,
  parsePrice,
  summarizeKeywordAlert,
} from '../lib/keyword-options';
import {useUpdateKeywordOptions} from '../model/mutations';

const DEAL_CHOICES = [
  {value: false, label: '새 핫딜 모두'},
  {value: true, label: '평소보다 쌀 때만'},
] as const;

/**
 * 키워드 카드 한 장. web `KeywordItem` — 접힌 상태엔 "어떤 알림이 오는지" 한 줄 요약만,
 * 누르면 설정이 펼쳐진다.
 *
 * 설정 3개(받을 딜·가격 범위·제외 단어)는 저장 버튼 하나로 같이 저장한다 — 예전엔 "가격 하락
 * 알림" 스위치는 즉시 저장, "알림 조건"은 버튼 저장이라 같은 줄에서 저장 방식이 갈렸다.
 * 제외 단어는 키워드가 제목 부분일치라 생기는 오탐("콜라" → "콜라겐 마스크팩", 2026-10-01 실측
 * 커뮤니티 딜의 ~15%)을 유저가 끄는 용도.
 */
export default function KeywordItem({
  keyword,
  onDelete,
  onOpenDeals,
  defaultOpen = false,
}: {
  keyword: MyKeyword;
  onDelete: () => void;
  /** 이 키워드로 지금 올라온 딜(검색 결과). */
  onOpenDeals: () => void;
  /** 알림 한 줄의 키워드 라벨에서 들어오면 펼친 채로 시작한다. */
  defaultOpen?: boolean;
}) {
  const c = useColors();
  const saved = {
    priceDropOnly: keyword.priceDropOnly ?? false,
    excludeKeywords: keyword.excludeKeywords ?? [],
    minPrice: keyword.minPrice ?? null,
    maxPrice: keyword.maxPrice ?? null,
  };

  const [open, setOpen] = useState(defaultOpen);
  const [priceDropOnly, setPriceDropOnly] = useState(saved.priceDropOnly);
  const [excludeInput, setExcludeInput] = useState(
    saved.excludeKeywords.join(', '),
  );
  const [minInput, setMinInput] = useState(
    saved.minPrice != null ? String(saved.minPrice) : '',
  );
  const [maxInput, setMaxInput] = useState(
    saved.maxPrice != null ? String(saved.maxPrice) : '',
  );
  const {mutate, isPending} = useUpdateKeywordOptions();

  const save = () =>
    mutate(
      {
        id: Number(keyword.id),
        excludeKeywords: parseExcludeKeywords(excludeInput),
        minPrice: parsePrice(minInput),
        maxPrice: parsePrice(maxInput),
        priceDropOnly:
          priceDropOnly !== saved.priceDropOnly ? priceDropOnly : undefined,
      },
      {onSuccess: () => setOpen(false)},
    );

  return (
    <View className="rounded-xl border border-gray-200">
      <View className="flex-row items-center">
        <Pressable
          onPress={() => setOpen(prev => !prev)}
          accessibilityRole="button"
          accessibilityState={{expanded: open}}
          accessibilityLabel={`${keyword.keyword} 알림 설정`}
          className="min-w-0 flex-1 flex-row items-center gap-2 py-3 pl-4"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <View className="min-w-0 flex-1">
            <Text
              className="text-sm font-semibold text-gray-900"
              numberOfLines={1}>
              {keyword.keyword}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
              {summarizeKeywordAlert(saved)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            {open ? '접기' : '설정'}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${keyword.keyword} 삭제`}
          className="shrink-0 p-3"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          {/* web 은 gray-400(AA 미달)이었다 — gray-500 을 쓴다. */}
          <Close width={20} height={20} color={c.gray[500]} />
        </Pressable>
      </View>

      {open ? (
        <View className="gap-5 border-t border-gray-100 p-4">
          <Pressable
            onPress={onOpenDeals}
            accessibilityRole="link"
            accessibilityLabel={`${keyword.keyword} 지금 올라온 딜 보기`}
            className="flex-row items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text className="text-sm text-gray-900" numberOfLines={1}>
              {`‘${keyword.keyword}’ 지금 올라온 딜 보기`}
            </Text>
            <Text className="text-sm text-gray-500">›</Text>
          </Pressable>
          <View className="gap-2">
            <Text className="text-xs font-medium text-gray-900">
              어떤 딜을 알려드릴까요?
            </Text>
            <View className="flex-row gap-2" accessibilityRole="radiogroup">
              {DEAL_CHOICES.map(choice => {
                const selected = priceDropOnly === choice.value;
                return (
                  <Pressable
                    key={choice.label}
                    onPress={() => setPriceDropOnly(choice.value)}
                    accessibilityRole="radio"
                    accessibilityState={{checked: selected}}
                    className={
                      selected
                        ? 'flex-1 items-center rounded-lg border border-primary-500 bg-primary-50 py-2.5'
                        : 'flex-1 items-center rounded-lg border border-gray-200 py-2.5'
                    }>
                    <Text
                      className={
                        selected
                          ? 'text-sm font-semibold text-gray-900'
                          : 'text-sm text-gray-500'
                      }>
                      {choice.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="text-xs text-gray-500">
              {priceDropOnly
                ? '이 상품이 평소 가격보다 싸게 올라왔을 때만 알려드려요.'
                : `제목에 ‘${keyword.keyword}’가 들어간 새 핫딜을 모두 알려드려요.`}
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-gray-900">
              가격 범위 <Text className="text-xs text-gray-500">(선택)</Text>
            </Text>
            <View className="flex-row items-center gap-2">
              <View className="min-w-0 flex-1">
                <TextField
                  value={minInput}
                  onChangeText={setMinInput}
                  placeholder="최소 (원)"
                  keyboardType="number-pad"
                  accessibilityLabel="최소 가격"
                />
              </View>
              <Text className="text-gray-500">~</Text>
              <View className="min-w-0 flex-1">
                <TextField
                  value={maxInput}
                  onChangeText={setMaxInput}
                  placeholder="최대 (원)"
                  keyboardType="number-pad"
                  accessibilityLabel="최대 가격"
                />
              </View>
            </View>
            <Text className="text-xs text-gray-500">
              비워두면 가격 상관없이 알려드려요. 가격을 못 읽은 글도 알려드려요.
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-medium text-gray-900">
              빼고 싶은 단어{' '}
              <Text className="text-xs text-gray-500">(선택)</Text>
            </Text>
            <TextField
              value={excludeInput}
              onChangeText={setExcludeInput}
              placeholder="예: 케이스, 필름"
              maxLength={220}
              accessibilityLabel="빼고 싶은 단어"
              helperText="제목에 이 단어가 있으면 알리지 않아요. 여러 개는 쉼표로 구분해요."
            />
          </View>

          <Button size="md" className="h-11" onPress={save} loading={isPending}>
            저장
          </Button>
        </View>
      ) : null}
    </View>
  );
}
