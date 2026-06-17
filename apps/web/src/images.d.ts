// 정적 이미지 import 타입 선언. next/image-types/global이 환경에 따라 안 잡혀
// tsc가 `import x from './a.png'`를 "Cannot find module"로 막던 것을 해소한다.
// Next의 StaticImageData(<Image> src로 바로 사용 가능) 형태로 default export.
declare module '*.png' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.jpg' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.jpeg' {
  const content: import('next/image').StaticImageData;
  export default content;
}

declare module '*.webp' {
  const content: import('next/image').StaticImageData;
  export default content;
}
