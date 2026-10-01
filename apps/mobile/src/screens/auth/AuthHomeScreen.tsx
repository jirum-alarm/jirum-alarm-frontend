import React from 'react';
import {Image, View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {fixed} from '@/shared/theme/palette';
import {useColors} from '@/shared/theme/useColors';
import {
  AppleIcon,
  EmailIcon,
  KaKaoIcon,
  NaverIcon,
} from '../../shared/components/icons';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {authNavigations} from '@/shared/constant/navigations.ts';
import {useSocialLogin} from './useSocialLogin';
import {AuthParamList} from '@/navigations/stack/AuthNavigator';

const AuthHomeScreen = () => {
  const {
    signInWithKakao,
    signInWithNaver,
    signInWithApple,
    isAppleLoginAvailable,
    isSocialLoginPending,
  } = useSocialLogin();

  const navigation = useNavigation<NavigationProp<AuthParamList>>();
  const c = useColors();

  return (
    <View style={[styles.container, {backgroundColor: c.white}]}>
      <View>
        <View style={styles.illustSection}>
          <Image
            source={require('@/shared/assets/LoginLogo.png')}
            style={styles.imageIllust}
          />
          <View style={styles.titleContainer}>
            <Text style={[styles.subtitle, {color: c.gray[900]}]}>
              핫딜의 시작
            </Text>
            <Text style={[styles.title, {color: c.gray[900]}]}>지름알림</Text>
          </View>
        </View>
        <View
          style={[
            styles.buttonContainer,
            isSocialLoginPending && styles.pending,
          ]}>
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            // 서버 로그인 중 재탭 = 이중 로그인 요청.
            disabled={isSocialLoginPending}
            style={[styles.button, styles.kakaoButton]}
            onPress={() => signInWithKakao()}>
            <KaKaoIcon />
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            // 서버 로그인 중 재탭 = 이중 로그인 요청.
            disabled={isSocialLoginPending}
            style={[styles.button, styles.naverButton]}
            onPress={() => signInWithNaver()}>
            <NaverIcon />
            <Text style={styles.naverButtonText}>네이버로 시작하기</Text>
          </TouchableOpacity>
          {isAppleLoginAvailable && (
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              disabled={isSocialLoginPending}
              style={[styles.button, styles.appleButton]}
              onPress={() => signInWithApple()}>
              <AppleIcon />
              <Text style={styles.appleButtonText}>Apple로 시작하기</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            // 서버 로그인 중 재탭 = 이중 로그인 요청.
            disabled={isSocialLoginPending}
            style={[
              styles.button,
              styles.emailButton,
              {borderColor: c.gray[200]},
            ]}
            onPress={() =>
              navigation.navigate(authNavigations.AUTH_EMAIL_LOGIN)
            }>
            <EmailIcon />
            <Text style={[styles.emailButtonText, {color: c.gray[900]}]}>
              이메일로 시작하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AuthHomeScreen;

const styles = StyleSheet.create({
  pending: {opacity: 0.5},
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustSection: {
    alignItems: 'center',
  },
  imageIllust: {
    width: 101,
    height: 100,
  },
  titleContainer: {
    marginTop: 12,
  },
  subtitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 38,
    textAlign: 'center',
  },
  button: {
    width: 280,
    height: 48,
    borderRadius: 140,
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 56,
    gap: 8,
  },
  emailButton: {
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  kakaoButton: {
    backgroundColor: '#FEE500', // tailwind kakao
  },
  naverButton: {
    backgroundColor: '#02C75A',
  },
  // 흰 Apple 로고가 박힌 아이콘이라 테마와 무관하게 어두운 버튼.
  appleButton: {
    backgroundColor: fixed[800],
  },
  kakaoButtonText: {
    color: '#101828',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  naverButtonText: {
    color: fixed.white,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  appleButtonText: {
    color: fixed.white,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  emailButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});
