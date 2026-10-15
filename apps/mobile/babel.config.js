/**
 * React Compiler(1.0) — 컴포넌트·훅을 빌드 때 자동 메모한다. 부모가 다시 그려져도 props 가 같은 자식·JSX 는 건너뛴다.
 * 실측(2026-10-15, jest + DevTools 훅으로 커밋당 실행된 컴포넌트 수): 상세 당겨서 새로고침 ~750→1, 스크롤 5회 54→5,
 * 공유 시트 열기 ~750→116, 홈 새로고침(같은 데이터) 1548→142.
 *
 * ★app.json `experiments.reactCompiler` 로 켜지 말 것 — app.json 은 네이티브 지문 입력이라 runtimeVersion 을
 * 올려야 하고(스토어 빌드), 여기 babel 플러그인은 JS 변환만 바꿔 OTA 로 나간다(native:check 통과).
 * node_modules 는 건너뛴다(라이브러리는 컴파일 대상이 아니다). 규칙 위반 컴포넌트(렌더 중 ref 읽기 등)는
 * 컴파일러가 스스로 건너뛰고 원래대로 돈다. 파일 단위로 빼려면 맨 위에 'use no memo'.
 * 끄고 비교하려면 REACT_COMPILER=off (jest·expo export 모두).
 */
module.exports = api => {
  const compilerOn = process.env.REACT_COMPILER !== 'off';
  api.cache.using(() => compilerOn);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
      // 다른 플러그인보다 먼저 — 원본 코드를 보고 분석해야 한다.
      ...(compilerOn
        ? [
            [
              'babel-plugin-react-compiler',
              {
                target: '19',
                sources: filename => !/[\\/]node_modules[\\/]/.test(filename),
              },
            ],
          ]
        : []),
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
