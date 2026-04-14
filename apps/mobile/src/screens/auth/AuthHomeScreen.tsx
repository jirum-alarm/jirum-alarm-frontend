import React from 'react';
import {Text, Image, View, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '@/shared/constant/colors.ts';
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
  } = useSocialLogin();

  const navigation = useNavigation<NavigationProp<AuthParamList>>();

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.illustSection}>
          <Image
            source={require('@/shared/assets/LoginLogo.png')}
            style={styles.imageIllust}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.subtitle}>핫딜의 시작</Text>
            <Text style={styles.title}>지름알림</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, styles.kakaoButton]}
            onPress={() => signInWithKakao()}>
            <KaKaoIcon />
            <Text style={styles.kakaoButtonText}>카카오로 시작하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, styles.naverButton]}
            onPress={() => signInWithNaver()}>
            <NaverIcon />
            <Text style={styles.naverButtonText}>네이버로 시작하기</Text>
          </TouchableOpacity>
          {isAppleLoginAvailable && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.button, styles.appleButton]}
              onPress={() => signInWithApple()}>
              <AppleIcon />
              <Text style={styles.appleButtonText}>Apple로 시작하기</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, styles.emailButton]}
            onPress={() =>
              navigation.navigate(authNavigations.AUTH_EMAIL_LOGIN)
            }>
            <EmailIcon />
            <Text style={styles.emailButtonText}>이메일로 시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default AuthHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
    color: COLORS.GRAY_900,
    textAlign: 'center',
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 38,
    color: COLORS.GRAY_900,
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
    borderColor: COLORS.GRAY_200,
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  kakaoButton: {
    backgroundColor: '#FBE84C',
  },
  naverButton: {
    backgroundColor: '#02C75A',
  },
  appleButton: {
    backgroundColor: COLORS.GRAY_800,
  },
  kakaoButtonText: {
    color: '#101828',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  naverButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  appleButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  emailButtonText: {
    color: '#101828',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});
