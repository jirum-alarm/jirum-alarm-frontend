import React from 'react';
import {Text, View} from 'react-native';

import BubbleChatEmpty from '@/shared/components/icons/BubbleChatEmpty';

/**
 * 댓글이 없을 때. web CommentListSkeleton 과 같은 일러스트·문구.
 */
export default function CommentEmpty() {
  return (
    <View className="w-full items-center justify-center pt-6">
      <View className="items-center gap-y-3">
        <BubbleChatEmpty />
        <View className="items-center gap-y-1">
          <Text className="font-semibold text-gray-700">
            첫 후기를 남겨주세요!
          </Text>
          <Text className="text-sm font-medium text-gray-500">
            댓글로 함께 소통해요
          </Text>
        </View>
      </View>
    </View>
  );
}
