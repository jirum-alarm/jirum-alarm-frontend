import config from '@jirum/prettier';

export default {
  ...config,
  // admin 만 Tailwind 3 이다. prettier-plugin-tailwindcss 0.8 은 tailwindcss 3.4.18 이 내보내는
  // __unstable__loadDesignSystem 을 보고 v4 로 오인해 theme.css 를 찾다 죽는다 — v3 설정 파일을 직접 알려 준다.
  tailwindConfig: './tailwind.config.ts',
};
