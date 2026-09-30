import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

/**
 * OS 접근성 설정 하나를 구독한다. 처음엔 false 로 두고(설정을 읽기 전 한 프레임은
 * 평소대로 그린다) 값이 오면 바꾼다 — 설정을 바꾸면 앱을 다시 켜지 않아도 따라간다.
 */
function useAccessibilitySetting(
  read: () => Promise<boolean>,
  event: 'reduceMotionChanged' | 'screenReaderChanged',
): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    read()
      .then(value => {
        if (alive) setEnabled(value);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(event, setEnabled);
    return () => {
      alive = false;
      sub.remove();
    };
  }, [read, event]);

  return enabled;
}

const readReduceMotion = () => AccessibilityInfo.isReduceMotionEnabled();
const readScreenReader = () => AccessibilityInfo.isScreenReaderEnabled();

/** "동작 줄이기" 가 켜졌는가. 무한 반복 애니메이션·자동 넘김을 끌 때 쓴다. */
export function useReduceMotion(): boolean {
  return useAccessibilitySetting(readReduceMotion, 'reduceMotionChanged');
}

/** VoiceOver/TalkBack 이 켜졌는가. 읽는 도중 내용이 저절로 바뀌면 안 되는 곳에 쓴다. */
export function useScreenReaderEnabled(): boolean {
  return useAccessibilitySetting(readScreenReader, 'screenReaderChanged');
}
