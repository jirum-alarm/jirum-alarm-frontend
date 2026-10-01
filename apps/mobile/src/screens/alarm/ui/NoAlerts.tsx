import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import AlarmIllustError from '@/shared/components/icons/AlarmIllustError';
import Button from '@/shared/components/ui/Button';
import {useMyKeywordSet} from '@/features/keyword-prompt/model/myKeywords';

/**
 * 알림이 하나도 없을 때. web `features/alarm/ui/NoAlerts` 와 같은 문구·버튼.
 * ★키워드가 이미 있으면 "등록하세요" 는 사실이 아니다 — 지켜보고 있다고 말해 준다.
 */
export default function NoAlerts({
  onPressKeyword,
}: {
  onPressKeyword: () => void;
}) {
  const watching = useMyKeywordSet().size;
  return (
    <View className="flex-1 items-center justify-center p-11">
      <AlarmIllustError />
      <View className="pb-8 pt-4">
        <Text className="pb-2 text-2xl font-semibold text-gray-900">
          아직 도착한 알림이 없어요
        </Text>
        <Text className="text-center text-gray-500">
          {watching > 0
            ? `키워드 ${watching}개를 지켜보고 있어요.\n새 핫딜이 올라오면 바로 알려드릴게요.`
            : '키워드를 등록하고 알림을 받아보세요.'}
        </Text>
      </View>
      {/*
        ★web 은 <Link>(인라인 <a>) 로 감싸서 버튼이 **글자 폭**만 차지한다.
        RN 엔 인라인 개념이 없어 Button 의 base `w-full` 이 부모를 꽉 채운다
        → 화면 폭 전체를 가로지르는 띠가 됐다. self-start 로 내용 폭만 쓰게 하고
        web 의 lg 높이·좌우 여백을 직접 준다(md variant 는 치수가 비어 있다).
      */}
      <Button
        size="md"
        onPress={onPressKeyword}
        className="h-12 w-auto self-center px-6">
        {watching > 0 ? '키워드 관리' : '키워드 등록'}
      </Button>
    </View>
  );
}
