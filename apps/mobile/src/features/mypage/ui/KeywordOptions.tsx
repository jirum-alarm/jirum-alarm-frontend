import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/Text/TextField';
import type {MyKeyword} from '@/shared/api/mypage';

import {
  parseExcludeKeywords,
  parsePrice,
  summarizeKeywordOptions,
} from '../lib/keyword-options';
import {useUpdateKeywordOptions} from '../model/mutations';

/**
 * 키워드 한 줄 아래 접히는 "알림 조건" — 제외 단어 + 가격 범위. web `KeywordOptions`.
 *
 * 키워드는 제목 부분일치라 "콜라"에 "콜라겐 마스크팩"이 걸린다(2026-10-01 실측: 커뮤니티 딜의
 * ~15%가 이런 오탐). 한글 합성어는 규칙으로 못 걸러서 유저가 제외 단어로 끈다.
 * ★web 처럼 제외 단어는 쉼표로 구분한 입력 하나다 — 칩 입력은 web 과 같이 바꿀 때 함께.
 */
export default function KeywordOptions({keyword}: {keyword: MyKeyword}) {
  const excludeKeywords = keyword.excludeKeywords ?? [];
  const minPrice = keyword.minPrice ?? null;
  const maxPrice = keyword.maxPrice ?? null;

  const [open, setOpen] = useState(false);
  const [excludeInput, setExcludeInput] = useState(excludeKeywords.join(', '));
  const [minInput, setMinInput] = useState(
    minPrice != null ? String(minPrice) : '',
  );
  const [maxInput, setMaxInput] = useState(
    maxPrice != null ? String(maxPrice) : '',
  );
  const {mutate, isPending} = useUpdateKeywordOptions();

  const summary = summarizeKeywordOptions({
    excludeKeywords,
    minPrice,
    maxPrice,
  });

  const save = () =>
    mutate(
      {
        id: Number(keyword.id),
        excludeKeywords: parseExcludeKeywords(excludeInput),
        minPrice: parsePrice(minInput),
        maxPrice: parsePrice(maxInput),
      },
      {onSuccess: () => setOpen(false)},
    );

  return (
    <View className="mt-1">
      <Pressable
        onPress={() => setOpen(prev => !prev)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityState={{expanded: open}}
        accessibilityLabel={`${keyword.keyword} 알림 조건`}
        className="flex-row items-center gap-1.5 self-start">
        <Text className="text-xs text-gray-500 underline">알림 조건</Text>
        {summary ? (
          <Text className="text-xs text-primary-800">{summary}</Text>
        ) : null}
      </Pressable>

      {open ? (
        <View className="mt-3 gap-4 rounded-lg bg-gray-50 p-3">
          <View>
            <Text className="mb-1 text-xs text-gray-700">제외할 단어</Text>
            <TextField
              value={excludeInput}
              onChangeText={setExcludeInput}
              placeholder="쉼표로 구분 (예: 콜라겐, 케이스)"
              maxLength={220}
              accessibilityLabel="제외할 단어"
              helperText="제목에 이 단어가 있으면 알림을 보내지 않아요"
            />
          </View>
          <View>
            <Text className="mb-1 text-xs text-gray-700">가격 범위</Text>
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
            <Text className="mt-1 text-xs text-gray-500">
              비워두면 제한 없음 · 가격을 못 읽은 글은 그대로 알려드려요
            </Text>
          </View>
          <Button
            size="md"
            className="h-10 self-end px-5"
            onPress={save}
            loading={isPending}>
            저장
          </Button>
        </View>
      ) : null}
    </View>
  );
}
