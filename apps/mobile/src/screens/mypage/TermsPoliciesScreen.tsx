import React from 'react';
import {View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {TabStackParamList} from '@/navigations/tab/types';
import {tabStackNavigations} from '@/shared/constant/navigations';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {TextRow} from '@/features/mypage/ui/Rows';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_TERMS
>;

/** 약관 및 정책 — 두 줄짜리 목차. web `/mypage/terms-policies`. */
export default function TermsPoliciesScreen({navigation}: Props) {
  return (
    <View className="flex-1 bg-white">
      <StackHeader title="약관 및 정책" onBack={navigation.goBack} />
      <View className="py-6">
        <TextRow
          title="서비스 이용약관"
          onPress={() =>
            navigation.push(tabStackNavigations.POLICY, {kind: 'terms'})
          }
        />
        <TextRow
          title="개인정보 처리방침"
          onPress={() =>
            navigation.push(tabStackNavigations.POLICY, {kind: 'privacy'})
          }
        />
      </View>
    </View>
  );
}
