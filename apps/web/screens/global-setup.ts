// 실행 전: 지난 결과를 지우고, next dev 면 화면마다 한 번씩 불러 컴파일을 끝내 둔다
// (첫 컴파일 중 dev 서버가 페이지를 다시 불러 «Execution context was destroyed» 로 흔들렸다).
// 설정 파일은 워커마다 다시 읽히므로 이런 일은 여기서 한 번만. webServer 는 이보다 먼저 뜬다.
import { rmSync } from 'node:fs';
import { join } from 'node:path';

import type { FullConfig } from '@playwright/test';

import { PAGES } from './pages';

export default async function globalSetup(config: FullConfig) {
  rmSync(join(__dirname, '.out'), { recursive: true, force: true });
  const baseURL = config.projects[0]?.use.baseURL;
  if (process.env.SCREENS_SERVER === 'start' || !baseURL) return;
  for (const page of PAGES) {
    await fetch(new URL(page.path, baseURL)).catch(() => undefined);
  }
}
