import {createContext, type RefObject, useContext} from 'react';
import type WebView from 'react-native-webview';

export type WebviewRefContextType = {
  webviewRef: RefObject<WebView | null>;
};

export const WebviewRefContext = createContext<WebviewRefContextType | null>(
  null,
);

export const useWebviewContext = () => {
  const context = useContext(WebviewRefContext);
  if (context === null) {
    throw new Error(
      'useWebviewContext must be used within a WebviewRefContext',
    );
  }
  return context;
};
