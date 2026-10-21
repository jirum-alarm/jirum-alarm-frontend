import * as ReactTestRenderer from 'react-test-renderer';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import AuthHomeScreen from '../src/screens/auth/AuthHomeScreen';

// Android Fabric 은 꾸밈 없는 View 를 납작하게 펴(flatten) 자식을 할아버지에 바로 붙인다. 로그인 중에만
// opacity 를 주면 그 순간 View 가 새로 생기며 버튼들이 옮겨 붙고(풀릴 때 다시 옮겨지고), 네이버 로그인
// 창에서 막 돌아온 Activity 위에서 이 이동이 `addViewAt: failed to insert view` 로 앱을 죽였다.
// 버튼 묶음은 로그인 중이든 아니든 늘 실제 View 여야 한다(collapsable={false}).

const social: {isSocialLoginPending: boolean} = {isSocialLoginPending: false};

jest.mock('../src/screens/auth/useSocialLogin', () => ({
  useSocialLogin: () => ({
    signInWithKakao: jest.fn(),
    signInWithNaver: jest.fn(),
    signInWithApple: jest.fn(),
    isAppleLoginAvailable: false,
    isSocialLoginPending: social.isSocialLoginPending,
  }),
}));

jest.mock('../src/screens/auth/useGuestLogin', () => ({
  useGuestLogin: () => ({startGuest: jest.fn(), isGuestPending: false}),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({navigate: jest.fn()}),
}));

async function renderButtonContainer(
  isSocialLoginPending: boolean,
): Promise<ReactTestRenderer.ReactTestInstance> {
  social.isSocialLoginPending = isSocialLoginPending;
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<AuthHomeScreen />);
  });
  const root = (renderer as ReactTestRenderer.ReactTestRenderer).root;
  // 카카오 버튼(첫 버튼)을 감싼 가장 가까운 View = 버튼 묶음.
  const kakaoButton = root
    .findAllByType(TouchableOpacity)
    .find(b => b.findAllByProps({children: '카카오로 시작하기'}).length > 0);
  let node: ReactTestRenderer.ReactTestInstance | null =
    kakaoButton?.parent ?? null;
  while (node && node.type !== View) {
    node = node.parent;
  }
  if (!node) throw new Error('버튼 묶음 View 를 못 찾음');
  return node;
}

test.each([false, true])(
  '로그인 중(%s)이어도 버튼 묶음은 납작하게 펴지지 않는 실제 View 다',
  async pending => {
    const container = await renderButtonContainer(pending);
    expect(container.props.collapsable).toBe(false);
  },
);

test('로그인 중엔 버튼 묶음을 흐리게 보인다', async () => {
  const container = await renderButtonContainer(true);
  expect(StyleSheet.flatten(container.props.style).opacity).toBe(0.5);
});
