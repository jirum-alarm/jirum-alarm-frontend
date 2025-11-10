import http from 'http';
import https from 'https';

// HTTP Agent 설정 - Keep-Alive 및 Connection Pooling 최적화
const httpAgent = new http.Agent({
  keepAlive: true, // Keep-Alive 활성화
  keepAliveMsecs: 1000, // Keep-Alive 간격 (ms)
  maxSockets: 50, // 호스트당 최대 소켓 수
  maxFreeSockets: 10, // 유휴 소켓 최대 개수
  timeout: 60000, // 소켓 타임아웃 (ms)
});

// HTTPS Agent 설정 - Keep-Alive 및 Connection Pooling 최적화
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

/**
 * 커스텀 fetch 함수 - HTTP Agent를 사용하여 Keep-Alive 및 Connection Pooling 활성화
 * Node.js Runtime에서만 사용 가능 (Edge Runtime에서는 사용 불가)
 */
export async function customFetch(url: string, options: RequestInit = {}) {
  const urlObj = new URL(url);
  const agent = urlObj.protocol === 'https:' ? httpsAgent : httpAgent;

  return fetch(url, {
    ...options,
    // @ts-ignore - Node.js fetch에서 agent 옵션 지원
    agent,
    headers: {
      ...options.headers,
      Connection: 'keep-alive',
    },
  });
}
