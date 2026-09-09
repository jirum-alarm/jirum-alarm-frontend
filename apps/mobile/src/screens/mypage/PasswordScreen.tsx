import React, {useCallback, useState} from 'react';
import {Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import Button from '@/shared/components/ui/Button';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import PasswordField from '@/features/mypage/ui/PasswordField';
import StackHeader from '@/features/mypage/ui/StackHeader';
import {FORM_CTA_BOTTOM} from '@/features/mypage/ui/Rows';
import {useUpdatePassword} from '@/features/mypage/model/mutations';
import {usePasswordCheck} from '@/features/mypage/model/usePasswordCheck';
import {validatePassword} from '@/features/mypage/lib/validation';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.MYPAGE_PASSWORD
>;

/**
 * 비밀번호 변경. web `/mypage/account/password`.
 *
 * ★web 은 단계를 **URL 쿼리(`?step=current|change`)** 로 들고 `router.replace`
 * 로 초기화한다. 앱은 그럴 필요가 없다 — 화면 하나 안의 state 로 충분하고,
 * 뒤로가기는 헤더가 직접 가른다(1단계면 pop, 2단계면 1단계로).
 * (URL 로 들고 있으면 앱에선 딥링크로 2단계에 바로 들어오는 구멍이 생긴다.)
 */
export default function PasswordScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();
  const {data: me} = useQuery(MyPageQueries.me());

  const [step, setStep] = useState<'current' | 'change'>('current');

  const handleBack = useCallback(() => {
    if (step === 'change') {
      setStep('current');
      return;
    }
    navigation.goBack();
  }, [navigation, step]);

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="비밀번호 변경" onBack={handleBack} />
      {step === 'current' ? (
        <CurrentPasswordStep
          email={me?.email ?? ''}
          insetBottom={insets.bottom}
          bottomClip={bottomClip}
          onVerified={() => setStep('change')}
        />
      ) : (
        <ChangePasswordStep
          insetBottom={insets.bottom}
          bottomClip={bottomClip}
          onDone={navigation.goBack}
        />
      )}
    </View>
  );
}

/** 1단계 — 현재 비밀번호 확인. web `CurrentPassword` + `CurrentPasswordForm`. */
function CurrentPasswordStep({
  email,
  insetBottom,
  bottomClip,
  onVerified,
}: {
  email: string;
  insetBottom: number;
  bottomClip: number;
  onVerified: () => void;
}) {
  const [value, setValue] = useState('');
  const [failed, setFailed] = useState(false);

  const {mutate, isPending} = usePasswordCheck({
    email,
    onVerified,
    onFailed: () => setFailed(true),
  });

  const submit = () => {
    if (!value || isPending) return;
    mutate(value);
  };

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        bottomOffset={88}
        keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-[88px]">
          <Text className="text-2xl font-semibold text-gray-900">
            {'확인을 위해 현재 비밀번호를\n입력해주세요.'}
          </Text>
        </View>
        <View className="px-5 pt-[88px]">
          <PasswordField
            label="현재 비밀번호"
            placeholder="비밀번호를 입력해주세요."
            value={value}
            autoFocus
            onChangeText={next => {
              setFailed(false);
              setValue(next);
            }}
            onSubmitEditing={submit}
            helper={
              value && failed ? (
                <Text className="text-error-500 text-xs">
                  올바른 비밀번호를 입력해주세요.
                </Text>
              ) : undefined
            }
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{closed: -insetBottom, opened: 0}}>
        <View
          className="bg-white px-5"
          style={{paddingBottom: FORM_CTA_BOTTOM + bottomClip}}>
          <Button onPress={submit} disabled={isPending} loading={isPending}>
            다음
          </Button>
        </View>
      </KeyboardStickyView>
    </>
  );
}

/** 2단계 — 새 비밀번호. web `ChangePassword` + `ChangePasswordForm`. */
function ChangePasswordStep({
  insetBottom,
  bottomClip,
  onDone,
}: {
  insetBottom: number;
  bottomClip: number;
  onDone: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);

  const validity = validatePassword(password);
  const {mutate, isPending} = useUpdatePassword(onDone);

  const submit = () => {
    if (isPending) return;
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    mutate({password});
  };

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        bottomOffset={88}
        keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-[88px]">
          <PasswordField
            label="새 비밀번호"
            placeholder="새 비밀번호를 입력해주세요."
            value={password}
            autoFocus
            onChangeText={setPassword}
            helper={
              <View className="pt-2 pl-1">
                {/*
                  web 은 <ul class="list-disc"> 다. RN 엔 목록 마커가 없어
                  글머리표를 직접 찍는다. 색 규칙은 web 과 같다 —
                  입력 전 회색 / 통과 초록 / 위반 빨강.
                  ⚠️web 의 미입력 색은 gray-400(AA 미달)이라 gray-500 을 쓴다.
                */}
                <RuleText
                  text="8자 이상 30자 이하 입력"
                  empty={!password}
                  invalid={validity.invalidLength}
                />
                <RuleText
                  text="영어, 숫자, 특수문자 중 2가지 이상 조합"
                  empty={!password}
                  invalid={validity.invalidType}
                />
              </View>
            }
          />
          <View className="h-9" />
          <PasswordField
            label="새 비밀번호 확인"
            placeholder="새 비밀번호를 다시 입력해주세요."
            value={confirm}
            onChangeText={next => {
              setMismatch(false);
              setConfirm(next);
            }}
            onSubmitEditing={submit}
            helper={
              confirm && mismatch ? (
                <Text className="text-error-500 text-xs">
                  새 비밀번호와 일치하지 않아요. 다시 확인해주세요.
                </Text>
              ) : undefined
            }
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{closed: -insetBottom, opened: 0}}>
        <View
          className="bg-white px-5"
          style={{paddingBottom: FORM_CTA_BOTTOM + bottomClip}}>
          {/*
            ★web 은 저장 버튼에 disabled 를 걸지 않는다(규칙 위반이면 서버가
            거절). 같은 동작을 유지한다 — 앱만 막으면 "왜 안 눌리지"가 된다.
          */}
          <Button onPress={submit} disabled={isPending} loading={isPending}>
            저장
          </Button>
        </View>
      </KeyboardStickyView>
    </>
  );
}

function RuleText({
  text,
  empty,
  invalid,
}: {
  text: string;
  empty: boolean;
  invalid: boolean;
}) {
  const color = empty
    ? 'text-gray-500'
    : invalid
    ? 'text-error-500'
    : 'text-primary-700';
  return <Text className={`text-xs ${color}`}>{`• ${text}`}</Text>;
}
