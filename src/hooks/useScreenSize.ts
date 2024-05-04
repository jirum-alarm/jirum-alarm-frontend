import { useState, useEffect } from 'react';

type ScreenSizes = {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  // 2xl
  txl: boolean;
};

const breakpoints: { [key in keyof ScreenSizes]: string } = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  txl: '(min-width: 1536px)',
};

/**
 * @description tailiwindcss breakpoints를 따르는 화면 사이즈 확인 훅
 * @example const { sm, md, lg, xl, txl } = useScreen();
 * */
function useScreen(): ScreenSizes {
  const [screenSizes, setScreenSizes] = useState<ScreenSizes>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    txl: false,
  });

  useEffect(() => {
    const mediaQueries: { [key in keyof ScreenSizes]: MediaQueryList } = {
      sm: window.matchMedia(breakpoints.sm),
      md: window.matchMedia(breakpoints.md),
      lg: window.matchMedia(breakpoints.lg),
      xl: window.matchMedia(breakpoints.xl),
      txl: window.matchMedia(breakpoints.txl),
    };

    function updateMatch(): void {
      setScreenSizes({
        sm: mediaQueries.sm.matches,
        md: mediaQueries.md.matches,
        lg: mediaQueries.lg.matches,
        xl: mediaQueries.xl.matches,
        txl: mediaQueries.txl.matches,
      });
    }

    updateMatch();

    Object.values(mediaQueries).forEach((mq) => mq.addEventListener('change', updateMatch));

    return () => {
      Object.values(mediaQueries).forEach((mq) => mq.removeEventListener('change', updateMatch));
    };
  }, []);

  return screenSizes;
}

export default useScreen;
