import React, {useRef, useState} from 'react';
import {Pressable, Text, type TextInput, View} from 'react-native';
import BasicLayout from '@/components/layout/BasicLayout.tsx';
import TextField from '@/shared/components/ui/Text/TextField';
import {CircleXIcon, EyeIcon, EyeOffIcon} from '@/shared/components/icons';
import Button from '@/shared/components/ui/Button';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import {Controller, useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {AuthService} from '@/shared/api/auth/auth.service.ts';
import {AuthQueries} from '@/entities/auth';
import useToast from '@/shared/hooks/useToast.ts';
import {handleLoginError, handleLoginSuccess} from './useSocialLogin/lib';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const loginSchema = z.object({
  email: z
    .string({required_error: '이메일을 입력해주세요.'})
    .email('올바른 이메일 형식으로 입력해주세요.'),
  password: z.string({required_error: '비밀번호를 입력해주세요.'}),
});

type LoginForm = z.infer<typeof loginSchema>;

const EmailLoginScreen = () => {
  const insets = useSafeAreaInsets();

  const passwordRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {mutate, isPending, isError} = useMutation({
    mutationFn: AuthService.loginUser,
  });
  const {showToast} = useToast();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: {isValid},
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = handleSubmit(data => {
    mutate(
      {email: data.email, password: data.password},
      {
        onSuccess: async token => {
          await handleLoginSuccess(
            token.login.accessToken,
            token.login.refreshToken,
          );
          await queryClient.refetchQueries({
            queryKey: AuthQueries.keys.loginByRefreshToken(),
          });
          showToast.info('로그인 성공! 알림 설정하고 핫딜을 받아보세요!');
        },
        onError: async () => {
          await handleLoginError();
        },
      },
    );
  });

  return (
    <BasicLayout title="로그인" hasBackButton={true}>
      <KeyboardAwareScrollView
        className="flex-1 bg-white"
        bottomOffset={88}
        extraKeyboardSpace={68}
        keyboardShouldPersistTaps="handled">
        <View className="pt-[20px] px-[20px] mb-[44px]">
          <Text className="text-[24px] text-gray-900 font-pretendard-bold">
            {'이메일과 비밀번호를\n입력해주세요.'}
          </Text>
        </View>
        <View className="flex-1 gap-[32px] px-[20px] pb-[32px]">
          <Controller
            control={control}
            name="email"
            render={({field, fieldState}) => (
              <TextField
                onChangeText={text => {
                  field.onChange(text);
                }}
                value={field.value}
                inputMode="email"
                autoComplete="email"
                autoFocus={true}
                textContentType="emailAddress"
                placeholder="이메일을 입력해주세요."
                label="이메일"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                submitBehavior="submit"
                onSubmitEditing={() => passwordRef.current?.focus()}
                returnKeyType="next"
                suffixIcon={
                  !!field.value && (
                    <Pressable onPress={() => field.onChange('')}>
                      <CircleXIcon />
                    </Pressable>
                  )
                }
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({field, fieldState}) => (
              <TextField
                ref={passwordRef}
                onChangeText={text => {
                  field.onChange(text);
                }}
                value={field.value}
                secureTextEntry={!showPassword}
                placeholder="비밀번호를 입력해주세요."
                label="비밀번호"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                returnKeyType="join"
                submitBehavior="submit"
                onSubmitEditing={onSubmit}
                suffixIcon={
                  <View className="flex-row">
                    <Pressable onPress={() => setShowPassword(prev => !prev)}>
                      {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </Pressable>
                    {!!field.value && (
                      <Pressable onPress={() => field.onChange('')}>
                        <CircleXIcon />
                      </Pressable>
                    )}
                  </View>
                }
              />
            )}
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView offset={{closed: -insets.bottom, opened: 0}}>
        <View className="px-[20px] pb-[20px] items-center bg-white">
          {isError && (
            <Text className="text-error-500 text-[14px] font-pretendard pb-[16px]">
              이메일 혹은 비밀번호가 올바르지 않아요.
            </Text>
          )}
          <Button
            color="primary"
            onPress={onSubmit}
            disabled={!isValid || isPending}
            loading={isPending}>
            로그인
          </Button>
        </View>
      </KeyboardStickyView>
    </BasicLayout>
  );
};

export default EmailLoginScreen;
