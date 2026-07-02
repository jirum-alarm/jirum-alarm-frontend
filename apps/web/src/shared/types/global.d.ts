// global.d.ts
export {};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    adsbygoogle?: Record<string, unknown>[];
  }
}
