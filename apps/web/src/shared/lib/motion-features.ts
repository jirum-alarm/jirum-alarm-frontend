// LazyMotion 이 비동기로 받는 motion 기능 묶음. 초기 번들엔 `m` 컴포넌트(~6KB)만 실린다.
// layout(ViewerCount)·drag(TabbarV2) 를 쓰므로 domAnimation 이 아니라 domMax.
export { domMax as default } from 'motion/react';
