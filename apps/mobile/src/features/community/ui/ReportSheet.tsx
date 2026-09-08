import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useMutation} from '@tanstack/react-query';

import {CommunityService} from '@/shared/api/community';
import {UserReportReason} from '@/shared/api/gql/graphql';
import Button from '@/shared/components/ui/Button';
import {showToast} from '@/shared/lib/feedback';
import {cn} from '@/shared/lib/styling';

import {buildReportVariables, REPORT_REASONS} from '../lib/report';

import CommunitySheet from './CommunitySheet';
import {gaps} from './community-styles';

/** web `features/community/ui/ReportModal` 대응. 문구·사유 목록을 그대로 옮겼다. */
export default function ReportSheet({
  visible,
  postId,
  onClose,
}: {
  visible: boolean;
  postId: number;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<UserReportReason | null>(null);
  const [description, setDescription] = useState('');

  const close = () => {
    setReason(null);
    setDescription('');
    onClose();
  };

  const {mutate: report, isPending} = useMutation({
    mutationFn: () =>
      CommunityService.report(
        buildReportVariables({postId, reason: reason!, description}),
      ),
    onSuccess: () => {
      showToast.info('신고가 접수되었어요.');
      close();
    },
    onError: () => {
      showToast.info('신고에 실패했어요.');
    },
  });

  return (
    <CommunitySheet
      visible={visible}
      onClose={close}
      accessibilityLabel="글 신고하기">
      <View className="px-5 pt-2">
        <Text className="text-base font-semibold text-gray-900">
          글 신고하기
        </Text>
        <Text className="pt-3 text-sm text-gray-600">
          신고 사유를 선택하면 운영팀이 검토 후 처리해드릴게요.
        </Text>

        <View className="pt-4" style={gaps.g12}>
          {REPORT_REASONS.map(item => {
            const selected = reason === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setReason(item.value)}
                accessibilityRole="radio"
                accessibilityState={{selected}}
                accessibilityLabel={item.label}
                style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
                className="flex-row items-center py-1">
                <View
                  className={cn(
                    'h-5 w-5 items-center justify-center rounded-full border-2',
                    selected
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300',
                  )}>
                  {selected ? (
                    <View className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </View>
                <Text className="pl-3 text-sm text-gray-800">{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {reason === UserReportReason.Other ? (
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="신고 내용을 입력해주세요"
            placeholderTextColor="#98A2B3"
            multiline
            className="mt-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-900"
            style={styles.descriptionInput}
          />
        ) : null}

        <View className="flex-row pt-6" style={gaps.g12}>
          <Button color="secondary" className="flex-1" onPress={close}>
            취소
          </Button>
          <Button
            className="flex-1"
            disabled={!reason || isPending}
            loading={isPending}
            onPress={() => report()}>
            신고
          </Button>
        </View>
      </View>
    </CommunitySheet>
  );
}

const styles = StyleSheet.create({
  /** '기타' 사유 입력칸. web h-24 textarea. */
  descriptionInput: {
    height: 96,
    textAlignVertical: 'top',
  },
});
