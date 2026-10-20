import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import PressableOpacity from '@/shared/components/PressableOpacity';
import {cn} from '@/shared/lib/styling';

/**
 * 누르면 뜻을 알려 주는 배지(토스 신뢰 배지·판매종료) — web ExplainedBadge 와 같은 동작·같은 문구
 * (정본 @jirum/domain/badge-explain). 배지가 버튼처럼 보여 눌러 보는 사람이 많았는데 아무 일이 없었다
 * (web Clarity dead click, 2026-10-20). 다시 누르거나 말풍선을 누르면 닫힌다.
 * 말풍선은 테마와 무관하게 어두운 면 + 흰 글씨(web Tooltip 과 같다) — gray-600·white 는 다크에서 뒤집힌다.
 */
export default function ExplainedBadge({
  lines,
  label,
  children,
}: {
  lines: readonly string[];
  /** 스크린리더용 배지 이름. */
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    // 열렸을 땐 z-10 — 말풍선이 뒤에 그려지는 형제(가격·정보 표)에 덮이지 않게.
    <View className={cn('relative', open && 'z-10')}>
      <PressableOpacity
        onPress={() => setOpen(v => !v)}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`${label} — 뜻 보기`}
        accessibilityState={{expanded: open}}>
        {children}
      </PressableOpacity>
      {open ? (
        <Pressable
          onPress={() => setOpen(false)}
          className="absolute left-0 top-8 z-50 w-56"
          accessibilityRole="button"
          accessibilityLabel="닫기">
          <View className="self-start rounded-lg bg-fixed-600 px-4 py-2.5">
            <Text className="text-13 text-fixed-white">{lines.join('\n')}</Text>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}
