import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

/** 상품 상세 — 시스템 UINavigationBar. 타이틀·검색·공유는 화면이 setOptions 로 채운다. */
export const productDetailHeaderOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerTintColor: '#101828',
  headerBackButtonDisplayMode: 'minimal',
  headerTitleAlign: 'left',
  headerStyle: {backgroundColor: '#ffffff'},
  title: '',
};

/** 댓글 — 시스템 헤더. */
export const commentsHeaderOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerTintColor: '#101828',
  headerBackButtonDisplayMode: 'minimal',
  headerStyle: {backgroundColor: '#ffffff'},
  title: '댓글',
};
