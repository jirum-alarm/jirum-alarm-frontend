import React, {useState} from 'react';
import {FlatList, Pressable, StyleSheet, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import BottomSheet from '@/shared/components/BottomSheet';
import ArrowRight from '@/shared/components/icons/ArrowRight';
import Switch from '@/shared/components/ui/Switch';

import {
  DEFAULT_QUIET_HOURS,
  describeQuietHours,
  formatHour,
  HOURS,
  type QuietHours,
  toQuietHours,
} from '@jirum/domain/quiet-hours';

type Edge = 'start' | 'end';

/**
 * 방해금지 시간. web `features/mypage/ui/notification/QuietHoursRow`.
 * 그 사이 온 키워드·핫딜·커뮤니티 알림은 끝나는 시각에 모아서 보낸다(공지 제외, 알림함엔 그대로 쌓임).
 *
 * 시 선택은 출생 연도처럼 공용 `BottomSheet` + `FlatList` — picker 패키지는 네이티브라 스토어 빌드가 필요해진다.
 */
export default function QuietHoursRow({
  start,
  end,
  nightAlerts,
  onChange,
}: {
  start: number | null;
  end: number | null;
  nightAlerts: boolean;
  onChange: (next: {
    quietHoursStart: number | null;
    quietHoursEnd: number | null;
  }) => void;
}) {
  const [editing, setEditing] = useState<Edge | null>(null);
  const quiet = toQuietHours(start, end);

  const save = (next: QuietHours | null) =>
    onChange({
      quietHoursStart: next?.start ?? null,
      quietHoursEnd: next?.end ?? null,
    });

  return (
    <View className="border-b border-gray-200 py-4">
      <View accessible={false} className="flex-row items-center gap-4">
        <View className="min-w-0 flex-1">
          <Text className="font-medium text-gray-900">방해금지 시간</Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            정한 시간엔 알림을 울리지 않고, 끝나는 시각에 모아서 보내드려요.
            알림함에는 바로 쌓여요
          </Text>
        </View>
        <Switch
          value={quiet !== null}
          onChange={next => save(next ? DEFAULT_QUIET_HOURS : null)}
          accessibilityLabel="방해금지 시간"
        />
      </View>

      {quiet ? (
        <View className="mt-3 rounded-lg bg-gray-50 p-3">
          <View className="flex-row items-center gap-2">
            <HourButton
              label="시작"
              hour={quiet.start}
              onPress={() => setEditing('start')}
            />
            <Text className="text-gray-500">~</Text>
            <HourButton
              label="끝"
              hour={quiet.end}
              onPress={() => setEditing('end')}
            />
          </View>
          <Text className="mt-2 text-sm text-gray-600">
            {describeQuietHours(quiet, nightAlerts)}
          </Text>
        </View>
      ) : null}

      <BottomSheet
        visible={quiet !== null && editing !== null}
        onClose={() => setEditing(null)}
        accessibilityLabel={`방해금지 ${
          editing === 'end' ? '끝' : '시작'
        } 시각 선택`}>
        <View className="border-b border-gray-100 px-5 pb-3">
          <Text className="text-center text-lg font-bold text-gray-900">
            {editing === 'end' ? '끝나는 시각' : '시작 시각'}
          </Text>
        </View>
        {quiet && editing ? (
          <FlatList
            style={styles.list}
            data={HOURS}
            keyExtractor={hour => String(hour)}
            initialScrollIndex={Math.max(0, quiet[editing] - 3)}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            renderItem={({item: hour}) => {
              const isSelected = hour === quiet[editing];
              // 시작과 끝이 같으면 서버가 거부한다 — 상대편 시각은 고를 수 없게.
              const isBlocked =
                hour === (editing === 'start' ? quiet.end : quiet.start);
              return (
                <Pressable
                  disabled={isBlocked}
                  onPress={() => {
                    save({...quiet, [editing]: hour});
                    setEditing(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: isSelected,
                    disabled: isBlocked,
                  }}
                  accessibilityLabel={formatHour(hour)}
                  style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
                  className="h-12 justify-center px-5">
                  <Text
                    className={
                      isSelected
                        ? 'text-primary-800 text-base font-semibold'
                        : isBlocked
                        ? // eslint-disable-next-line no-restricted-syntax -- 고를 수 없는 시간(비활성) — WCAG 대비 예외
                          'text-base text-gray-300'
                        : 'text-base text-gray-700'
                    }>
                    {formatHour(hour)}
                  </Text>
                </Pressable>
              );
            }}
          />
        ) : null}
      </BottomSheet>
    </View>
  );
}

function HourButton({
  label,
  hour,
  onPress,
}: {
  label: string;
  hour: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`방해금지 ${label} 시각, ${formatHour(hour)}`}
      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}
      className="h-10 flex-1 flex-row items-center justify-between rounded-md border border-gray-300 bg-white px-3">
      <Text className="text-base text-gray-900">{formatHour(hour)}</Text>
      <ArrowRight width={16} height={16} />
    </Pressable>
  );
}

// h-12 = 48pt. initialScrollIndex 는 getItemLayout 이 있어야 정확히 간다.
const ITEM_HEIGHT = 48;

const styles = StyleSheet.create({
  list: {maxHeight: 360},
});
