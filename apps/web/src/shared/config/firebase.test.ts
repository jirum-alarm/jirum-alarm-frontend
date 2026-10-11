import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const { webPushVapidKey } = require('./firebase.ts') as typeof import('./firebase');

test('API 키(AIza…)는 VAPID 키로 쓰지 않는다 — SDK 기본 키로 간다', () => {
  assert.equal(webPushVapidKey('AIzaSyCpfnPqj8e_uVFTASlpumCYJ9w7R3d-8wQ'), undefined);
  assert.equal(webPushVapidKey(''), undefined);
  assert.equal(webPushVapidKey(undefined), undefined);
});

test('진짜 VAPID 공개키 모양이면 그대로 쓴다', () => {
  const key =
    'BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4';
  assert.equal(webPushVapidKey(key), key);
});

test('토큰을 받는 두 곳이 env 를 직접 읽지 않고 webPushVapidKey() 를 거친다', () => {
  for (const file of ['../lib/firebase/FCMConfig.tsx', '../lib/firebase/useFcmPermission.ts']) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /vapidKey\s*=\s*process\.env/, file);
    assert.match(source, /webPushVapidKey\(\)/, file);
  }
});
