import React, {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import {CircleXIcon} from '@/shared/components/icons';
import Button from '@/shared/components/ui/Button';
import TextField from '@/shared/components/ui/Text/TextField';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {FORM_CTA_BOTTOM} from '@/features/mypage/ui/Rows';
import {useUpdateNickname} from '@/features/mypage/model/mutations';
import {
  isValidNickname,
  NICKNAME_HELPER_TEXT,
} from '@/features/mypage/lib/validation';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_NICKNAME
>;

/** 닉네임 수정. web `/mypage/account/nickname`(NickNameForm + useNicknameFormViewModel). */
export default function NicknameScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();
  const {data: me} = useQuery(MyPageQueries.me());

  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);

  // 현재 닉네임을 초기값으로. web 도 me 가 오면 채운다(useEffect).
  // ★유저가 이미 고치고 있으면 덮지 않는다 — 캐시 갱신이 입력을 되돌리면
  // 저장 직전에 값이 튄다.
  useEffect(() => {
    if (me?.nickname && !touched) setValue(me.nickname);
  }, [me?.nickname, touched]);

  const {mutate, isPending} = useUpdateNickname(navigation.goBack);

  const isValid = isValidNickname(value);
  // web `error` — 값이 있고 규칙에 안 맞을 때만 빨갛게.
  const showError = !!value && !isValid;

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="닉네임 수정" onBack={navigation.goBack} />
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        bottomOffset={88}
        keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-9">
          <Text className="text-2xl font-semibold text-gray-900">
            {'변경할 닉네임을\n입력해주세요.'}
          </Text>
        </View>
        <View className="px-5 pt-[88px]">
          <TextField
            value={value}
            onChangeText={next => {
              setTouched(true);
              setValue(next);
            }}
            placeholder="닉네임을 입력해주세요."
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (isValid && !isPending) mutate({nickname: value});
            }}
            error={showError}
            helperText={NICKNAME_HELPER_TEXT}
            suffixIcon={
              !!value && (
                <Pressable
                  onPress={() => {
                    setTouched(true);
                    setValue('');
                  }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="입력 지우기">
                  <CircleXIcon />
                </Pressable>
              )
            }
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{closed: -insets.bottom, opened: 0}}>
        <View
          className="bg-white px-5"
          style={{paddingBottom: FORM_CTA_BOTTOM + bottomClip}}>
          <Button
            onPress={() => mutate({nickname: value})}
            disabled={!isValid || isPending}
            loading={isPending}>
            저장
          </Button>
        </View>
      </KeyboardStickyView>
    </View>
  );
}
