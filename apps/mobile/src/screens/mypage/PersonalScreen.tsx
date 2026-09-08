import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import {Gender} from '@/shared/api/gql/graphql';
import Button from '@/shared/components/ui/Button';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import BirthYearSelect from '@/features/mypage/ui/BirthYearSelect';
import GenderRadioGroup from '@/features/mypage/ui/GenderRadioGroup';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {useUpdatePersonal} from '@/features/mypage/model/mutations';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_PERSONAL
>;

/**
 * 개인정보 수정(출생년도·성별). web `/mypage/account/personal`.
 *
 * ★web `usePersonalInfoFormViewModel` 의 `isValidPersonalInfoInput`(원본과 같으면
 * true)은 **어디서도 쓰이지 않는 죽은 코드**다 — `PersonalInfoForm` 의 저장 버튼은
 * disabled 를 아예 안 건다. 옮기지 않는다(옮기면 web 과 다른 화면이 된다).
 */
export default function PersonalScreen({navigation}: Props) {
  const bottomClip = useHiddenTabBarClipPadding();
  const {data: me} = useQuery(MyPageQueries.me());

  const [birthYear, setBirthYear] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!me || touched) return;
    setBirthYear(me.birthYear ? String(me.birthYear) : null);
    setGender((me.gender as Gender | null) ?? null);
  }, [me, touched]);

  const {mutate, isPending} = useUpdatePersonal(navigation.goBack);

  const contentStyle = [styles.content, {paddingBottom: 20 + bottomClip}];

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="개인정보 수정" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={contentStyle}>
        <View className="px-5 pt-9" style={styles.grow}>
          <Text className="text-2xl font-semibold text-gray-900">
            {'출생년도와 성별을\n수정해주세요.'}
          </Text>
          <View className="pt-[88px]">
            <BirthYearSelect
              value={birthYear}
              onChange={next => {
                setTouched(true);
                setBirthYear(next);
              }}
            />
            <View className="h-10" />
            <GenderRadioGroup
              gender={gender}
              onChange={next => {
                setTouched(true);
                setGender(next);
              }}
            />
          </View>
          {/* web `flex-1 justify-between` — 버튼은 화면 아래에 붙는다. */}
          <View className="justify-end pt-10" style={styles.grow}>
            <Button
              onPress={() =>
                mutate({
                  birthYear: birthYear ? Number(birthYear) : null,
                  gender,
                })
              }
              disabled={isPending}
              loading={isPending}>
              저장
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  grow: {flex: 1},
});
