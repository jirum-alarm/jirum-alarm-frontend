import React, {useState} from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  View,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/Text/TextField';
import ArrowRight from '@/shared/components/icons/ArrowRight';
import SwipeToDelete from '@/shared/components/SwipeToDelete';
import {tick} from '@/shared/lib/feedback';
import type {MyKeyword} from '@/shared/api/mypage';
import {useColors} from '@/shared/theme/useColors';

import {
  broadenSuggestion,
  describeKeywordFrequency,
  type KeywordFrequency,
} from '@jirum/domain/keyword-frequency';
import {
  parseExcludeKeywords,
  formatPriceInput,
  parsePrice,
  summarizeKeywordAlert,
} from '@jirum/domain/keyword-options';
import {useUpdateKeywordOptions} from '../model/mutations';
import PressableOpacity from '@/shared/components/PressableOpacity';

const DEAL_CHOICES = [
  {
    value: false,
    label: '새 핫딜 모두',
    hint: (k: string) => `‘${k}’ 핫딜이 올라올 때마다 알려드려요`,
  },
  {
    value: true,
    label: '최근 딜보다 쌀 때만',
    hint: () => '최근 올라온 딜보다 싸게 뜬 딜만 알려드려요',
  },
] as const;

/** iOS 숫자 키패드엔 리턴 키가 없어 닫을 길이 없다 — 키보드 위 「완료」 줄. 모든 카드가 같이 쓴다. */
const PRICE_ACCESSORY_ID = 'keyword-price-done';

/**
 * 키워드 카드 한 장. web `KeywordItem` — 접힌 상태엔 "어떤 알림이 오는지" 한 줄 요약만,
 * 누르면 설정이 펼쳐진다.
 *
 * 설정 3개(받을 딜·가격 범위·제외 단어)는 저장 버튼 하나로 같이 저장한다 — 예전엔 "가격 하락
 * 알림" 스위치는 즉시 저장, "알림 조건"은 버튼 저장이라 같은 줄에서 저장 방식이 갈렸다.
 * 제외 단어는 키워드가 제목 부분일치라 생기는 오탐("콜라" → "콜라겐 마스크팩", 2026-10-01 실측
 * 커뮤니티 딜의 ~15%)을 유저가 끄는 용도.
 *
 * 2026-10-08 개편(web 과 같이): 선택 표시가 라임 테두리라 뭐가 골라졌는지 안 보였다 → 라디오 점 +
 * 짙은 테두리. 헤더의 X 가 "닫기"로 읽혀 펼침과 헷갈렸다 → 삭제는 펼친 안쪽으로.
 */
export default function KeywordItem({
  keyword,
  onDelete,
  onOpenDeals,
  onOpenHub,
  defaultOpen = false,
  frequency,
  onBroaden,
  broadening = false,
}: {
  keyword: MyKeyword;
  onDelete: () => void;
  /** 이 키워드로 지금 올라온 딜(검색 결과). */
  onOpenDeals: () => void;
  /**
   * 이 키워드가 공개 키워드 허브 자체면(「삼다수」) 허브 화면으로. 접힌 카드에서도 보이게 머리 줄에 둔다 —
   * 키워드가 맨 위 단위라, 알림을 건 그 단어의 30일 모음으로 바로 가는 길이 카드에 있어야 한다.
   */
  onOpenHub?: () => void;
  /** 알림 한 줄의 키워드 라벨에서 들어오면 펼친 채로 시작한다. */
  defaultOpen?: boolean;
  /** 지난 90일 횟수(서버 keywordDealFrequencies) — 아직 없거나 실패하면 null(줄을 안 그린다). web KeywordItem 과 같다. */
  frequency?: KeywordFrequency | null;
  /** 드문 키워드의 «넓혀 받기» — 제안 키워드를 새로 등록한다(원래 키워드는 그대로). */
  onBroaden?: (keyword: string) => void;
  broadening?: boolean;
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
    formatPriceInput(String(saved.minPrice ?? '')),
  );
  const [maxInput, setMaxInput] = useState(
    formatPriceInput(String(saved.maxPrice ?? '')),
  );
  const {mutate, isPending} = useUpdateKeywordOptions();
  const toggle = () => setOpen(prev => !prev);
  const described = frequency ? describeKeywordFrequency(frequency) : null;
  const suggestion = frequency ? broadenSuggestion(frequency) : null;

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
    <SwipeToDelete
      onDelete={onDelete}
      accessibilityLabel={`${keyword.keyword} 키워드 삭제`}
      actionClassName="ml-2 rounded-xl">
      <View className="rounded-xl border border-gray-200 bg-white">
        <View className="flex-row items-center">
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityState={{expanded: open}}
            accessibilityLabel={`${keyword.keyword} 알림 설정`}
            className="min-w-0 flex-1 py-3.5 pl-4"
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            <Text
              className="text-sm font-semibold text-gray-900"
              numberOfLines={1}>
              {keyword.keyword}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
              {summarizeKeywordAlert(saved)}
            </Text>
            {described ? (
              <Text
                className={
                  described.sparse
                    ? 'mt-0.5 text-xs text-warning-700'
                    : 'mt-0.5 text-xs text-gray-500'
                }
                numberOfLines={1}>
                {described.text}
              </Text>
            ) : null}
          </Pressable>
          {onOpenHub ? (
            <Pressable
              onPress={onOpenHub}
              accessibilityRole="link"
              accessibilityLabel={`${keyword.keyword} 핫딜 모아보기`}
              hitSlop={8}
              style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
              <Text className="py-3.5 pl-2 text-xs font-medium text-gray-700">
                핫딜 모아보기 ›
              </Text>
            </Pressable>
          ) : null}
          {/* 펼침 화살표도 같은 토글 — 읽기 프로그램엔 위 줄 하나로 충분해 숨긴다. */}
          <Pressable
            onPress={toggle}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            hitSlop={8}
            style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
            {/* transform 은 style 로 — 조건부 className + transform 은 NativeWind 에서 레드스크린. */}
            <View
              className="mx-3 my-3.5"
              style={{transform: [{rotate: open ? '-90deg' : '90deg'}]}}>
              <ArrowRight width={20} height={20} color={c.gray[500]} />
            </View>
          </Pressable>
        </View>

        {open ? (
          <View className="gap-5 border-t border-gray-100 p-4">
            {suggestion && onBroaden ? (
              // 드문 키워드(90일 3번 미만) — 첫 낱말(대개 브랜드)로 넓혀 받기. 원래 키워드는 지우지 않는다(같은 딜은 한 번만 온다).
              <View className="rounded-lg bg-gray-50 px-3 py-3">
                <Text className="text-sm text-gray-900">
                  자주 안 올라오는 키워드라 알림이 드물게 와요.
                </Text>
                <Text className="mt-0.5 text-xs text-gray-500">
                  {suggestion.text}
                </Text>
                <View className="mt-3 flex-row">
                  <PressableOpacity
                    onPress={() => onBroaden(suggestion.keyword)}
                    disabled={broadening}
                    accessibilityRole="button"
                    className={
                      broadening
                        ? 'rounded-md bg-primary-500 px-4 py-2 opacity-50'
                        : 'rounded-md bg-primary-500 px-4 py-2'
                    }>
                    <Text className="text-sm font-semibold text-fixed-900">
                      {suggestion.button}
                    </Text>
                  </PressableOpacity>
                </View>
              </View>
            ) : null}
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
              <Text className="mb-1 text-sm font-semibold text-gray-900">
                어떤 딜을 알려드릴까요?
              </Text>
              <View className="gap-2" accessibilityRole="radiogroup">
                {DEAL_CHOICES.map(choice => {
                  const selected = priceDropOnly === choice.value;
                  return (
                    <PressableOpacity
                      key={choice.label}
                      onPress={() => {
                        tick();
                        setPriceDropOnly(choice.value);
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{checked: selected}}
                      className={
                        selected
                          ? 'flex-row items-start gap-3 rounded-lg border border-gray-900 p-3'
                          : 'flex-row items-start gap-3 rounded-lg border border-gray-200 p-3'
                      }>
                      <View
                        className={
                          selected
                            ? 'mt-0.5 h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-gray-900'
                            : 'mt-0.5 h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-gray-300'
                        }>
                        {selected ? (
                          <View className="h-2 w-2 rounded-full bg-gray-900" />
                        ) : null}
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text className="text-sm font-semibold text-gray-900">
                          {choice.label}
                        </Text>
                        <Text className="mt-0.5 text-xs text-gray-500">
                          {choice.hint(keyword.keyword)}
                        </Text>
                      </View>
                    </PressableOpacity>
                  );
                })}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-gray-900">
                가격 범위{' '}
                <Text className="text-xs font-normal text-gray-500">
                  (선택)
                </Text>
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="min-w-0 flex-1">
                  <TextField
                    value={minInput}
                    onChangeText={text => setMinInput(formatPriceInput(text))}
                    placeholder="최소 금액"
                    keyboardType="number-pad"
                    inputAccessoryViewID={PRICE_ACCESSORY_ID}
                    accessibilityLabel="최소 가격"
                  />
                </View>
                <Text className="text-gray-500">~</Text>
                <View className="min-w-0 flex-1">
                  <TextField
                    value={maxInput}
                    onChangeText={text => setMaxInput(formatPriceInput(text))}
                    placeholder="최대 금액"
                    keyboardType="number-pad"
                    inputAccessoryViewID={PRICE_ACCESSORY_ID}
                    accessibilityLabel="최대 가격"
                  />
                </View>
              </View>
              <Text className="text-xs text-gray-500">
                비워 두면 가격과 상관없이 알려드려요. 가격이 안 적힌 글도
                알려드려요.
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-gray-900">
                빼고 싶은 단어{' '}
                <Text className="text-xs font-normal text-gray-500">
                  (선택)
                </Text>
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

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={onDelete}
                accessibilityRole="button"
                accessibilityLabel={`${keyword.keyword} 키워드 삭제`}
                className="h-11 justify-center px-3"
                style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
                <Text className="text-sm text-gray-500">키워드 삭제</Text>
              </Pressable>
              <View className="flex-1">
                <Button
                  size="md"
                  className="h-11"
                  onPress={save}
                  loading={isPending}>
                  저장
                </Button>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SwipeToDelete>
  );
}

/** 키워드 화면에 한 번 그린다(id 로 숫자 칸들이 공유). */
export function PriceKeyboardAccessory() {
  if (Platform.OS !== 'ios') return null;
  return (
    <InputAccessoryView nativeID={PRICE_ACCESSORY_ID}>
      <View className="flex-row justify-end border-t border-gray-200 bg-gray-50 px-4">
        <Pressable
          onPress={Keyboard.dismiss}
          accessibilityRole="button"
          accessibilityLabel="키보드 닫기"
          hitSlop={8}
          className="py-2.5"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text className="text-base font-semibold text-gray-900">완료</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}
