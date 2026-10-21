import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {brand, fixed} from '@jirum/design-system';
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
import {useGuestLogin} from './useGuestLogin';
import {AuthParamList} from '@/navigations/stack/AuthNavigator';
import {useLoginModal} from './login-modal-context';

const AuthHomeScreen = () => {
  const {
    signInWithKakao,
    signInWithNaver,
    signInWithApple,
    isAppleLoginAvailable,
    isSocialLoginPending,
  } = useSocialLogin();

  const {startGuest, isGuestPending} = useGuestLogin();
  // 게스트가 회원 기능을 눌러 창으로 뜬 경우 — 둘러보기 대신 닫기(LoginModalScreen).
  const loginModal = useLoginModal();

  const navigation = useNavigation<NavigationProp<AuthParamList>>();
  const c = useColors();
  const isDark = useColorScheme() === 'dark';

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
          {loginModal ? (
            <Text style={[styles.hint, {color: c.gray[600]}]}>
              로그인하면 하던 걸 이어서 할 수 있어요
            </Text>
          ) : null}
        </View>
        {/* 로그인 중에만 opacity 가 붙으면 Android Fabric 이 이 View 를 그때 새로 만들며 버튼들을 옮겨
            붙인다 — 네이버 로그인 창에서 막 돌아온 순간 이 이동이 addViewAt 크래시를 냈다. 늘 실제 View 로 둔다. */}
        <View
          collapsable={false}
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
              style={[
                styles.button,
                styles.appleButton,
                // 다크 바탕엔 흰 버튼(검은 로고·글자) — Apple HIG 의 어두운 바탕용 스타일. 예전 fixed-700
                // 회청색은 바탕과 붙어 흐리고 HIG 색(검정·흰색·흰 테두리)에서도 벗어났다(10/10 다크 점검).
                isDark && {backgroundColor: fixed.white},
              ]}
              onPress={() => signInWithApple()}>
              <AppleIcon color={isDark ? fixed[900] : undefined} />
              <Text
                style={[styles.appleButtonText, isDark && {color: fixed[900]}]}>
                Apple로 시작하기
              </Text>
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
        {/* 웹에서 가입한 사람이 앱에서 Apple 로 들어가면 다른 계정이 된다(웹엔 Apple 로그인이
            없다) — 웹에서 걸어 둔 키워드 알림이 안 보여 "알림이 안 온다"가 된다. */}
        <Text style={[styles.hint, {color: c.gray[500]}]}>
          웹에서 쓰던 카카오·네이버 계정으로 로그인하면{'\n'}등록한 키워드
          알림이 그대로 이어져요
        </Text>
        {/* 로그인 벽 대신 선택지 — 게스트도 키워드 알림을 받고, 나중에 로그인하면 계정으로 합쳐진다.
            창으로 떴으면 이미 게스트라 닫기만 한다(하던 화면으로 돌아간다). */}
        <TouchableOpacity
          accessibilityRole="button"
          disabled={isSocialLoginPending || isGuestPending}
          hitSlop={12}
          style={styles.guestButton}
          onPress={loginModal ? loginModal.onClose : startGuest}>
          <Text style={[styles.guestButtonText, {color: c.gray[600]}]}>
            {loginModal ? '다음에 할게요' : '로그인 없이 둘러보기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AuthHomeScreen;

const styles = StyleSheet.create({
  pending: {opacity: 0.5},
  guestButton: {alignSelf: 'center', marginTop: 20, paddingVertical: 8},
  guestButtonText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    textDecorationLine: 'underline',
  },
  hint: {marginTop: 20, fontSize: 13, lineHeight: 19, textAlign: 'center'},
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
    backgroundColor: brand.kakao,
  },
  naverButton: {
    backgroundColor: brand.naver,
  },
  // 라이트는 어두운 버튼에 흰 로고. 다크는 위에서 흰 버튼에 검은 로고로 뒤집는다.
  appleButton: {
    backgroundColor: fixed[800],
  },
  kakaoButtonText: {
    color: fixed[900],
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
