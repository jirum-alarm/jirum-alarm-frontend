#!/usr/bin/env python3
"""App Store 심사 제출 — store-release 워크플로가 eas build --auto-submit 뒤에 부른다.

eas submit 은 빌드를 App Store Connect 에 올리기만 하고 「심사에 제출」은 하지 않는다. 이 스크립트가 그 뒤를 잇는다:
  처리 끝난 빌드 기다리기 → 버전(없으면 만들기)에 빌드 붙이기 → 「새로운 기능」 문구 → 심사 제출.
승인되면 자동 출시된다(ASC 의 버전 출시 설정).

env: ASC_KEY_ID · ASC_ISSUER_ID · ASC_KEY_P8(PEM 내용) — App Store Connect API 팀 키(앱 관리 권한)
  python3 ios-submit-review.py --notes apps/mobile/store/release-notes.json [--dry-run] [--wait-minutes 120]
--dry-run 은 읽기만 하고 할 일을 찍는다.
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature

APP_ID = '6474611420'
API = 'https://api.appstoreconnect.apple.com'
# 이 상태의 버전이 있으면 이미 심사에 들어간 것 — 같은 버전이면 할 일 없음, 다른 버전이면 멈춘다.
IN_REVIEW = {'WAITING_FOR_REVIEW', 'IN_REVIEW', 'PENDING_DEVELOPER_RELEASE', 'PROCESSING_FOR_APP_STORE'}
EDITABLE = {'PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED', 'INVALID_BINARY'}


def _b64(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b'=').decode()


def _token() -> str:
    key = serialization.load_pem_private_key(os.environ['ASC_KEY_P8'].encode(), None)
    now = int(time.time())
    header = {'alg': 'ES256', 'kid': os.environ['ASC_KEY_ID'], 'typ': 'JWT'}
    payload = {'iss': os.environ['ASC_ISSUER_ID'], 'iat': now, 'exp': now + 900, 'aud': 'appstoreconnect-v1'}
    msg = f'{_b64(json.dumps(header).encode())}.{_b64(json.dumps(payload).encode())}'.encode()
    r, s = decode_dss_signature(key.sign(msg, ec.ECDSA(hashes.SHA256())))
    return f'{msg.decode()}.{_b64(r.to_bytes(32, "big") + s.to_bytes(32, "big"))}'


def call(method: str, path: str, body: dict | None = None) -> dict:
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'Bearer {_token()}', 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req) as res:
            text = res.read()
            return json.loads(text) if text else {}
    except urllib.error.HTTPError as e:
        sys.exit(f'ASC {method} {path} → {e.code}: {e.read().decode()[:800]}')


def find_build(version: str) -> dict | None:
    res = call('GET', f'/v1/builds?filter[app]={APP_ID}&filter[preReleaseVersion.version]={version}&sort=-uploadedDate&limit=1')
    return res['data'][0] if res['data'] else None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('--notes', required=True, help='release-notes.json — {"version": "x.y.z", "ko": "새로운 기능"}')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--wait-minutes', type=int, default=120)
    args = ap.parse_args()

    notes = json.load(open(args.notes))
    version, whats_new = notes['version'], notes['ko'].strip()
    say = lambda m: print(('[dry-run] ' if args.dry_run else '') + m, flush=True)

    versions = call('GET', f'/v1/apps/{APP_ID}/appStoreVersions?filter[platform]=IOS&limit=10')['data']
    for v in versions:
        state = v['attributes']['appStoreState']
        if state in IN_REVIEW:
            if v['attributes']['versionString'] == version:
                say(f'{version} 은 이미 심사 중({state}) — 할 일 없음')
                return
            sys.exit(f'다른 버전 {v["attributes"]["versionString"]} 이 심사 중({state}) — 끝난 뒤 다시')

    # eas build --auto-submit 직후엔 업로드·처리 중이라 VALID 가 될 때까지 기다린다(보통 10~30분).
    deadline = time.time() + args.wait_minutes * 60
    while True:
        build = find_build(version)
        state = build['attributes']['processingState'] if build else '업로드 전'
        if state == 'VALID':
            break
        if state in ('FAILED', 'INVALID'):
            sys.exit(f'{version} 빌드 처리 실패({state})')
        if args.dry_run or time.time() > deadline:
            if args.dry_run:
                say(f'{version} 빌드가 아직 {state} — 실제 실행이면 최대 {args.wait_minutes}분 기다린다')
                return
            sys.exit(f'{version} 빌드가 {args.wait_minutes}분 안에 처리되지 않음({state})')
        print(f'{version} 빌드 {state} — 1분 뒤 다시', flush=True)
        time.sleep(60)
    say(f'빌드 {build["attributes"]["version"]} VALID')

    target = next((v for v in versions if v['attributes']['versionString'] == version), None)
    if target and target['attributes']['appStoreState'] not in EDITABLE:
        sys.exit(f'{version} 버전 상태 {target["attributes"]["appStoreState"]} — 편집할 수 없음')
    if not target:
        say(f'App Store 버전 {version} 만들기')
        if args.dry_run:
            return
        target = call('POST', '/v1/appStoreVersions', {'data': {
            'type': 'appStoreVersions',
            'attributes': {'platform': 'IOS', 'versionString': version},
            'relationships': {'app': {'data': {'type': 'apps', 'id': APP_ID}}},
        }})['data']
    vid = target['id']

    if build['attributes'].get('usesNonExemptEncryption') is None:
        # 지난 빌드들과 같은 답(HTTPS 만 쓴다) — 안 하면 «수출 규정 누락»으로 제출이 막힌다.
        say('수출 규정 답(암호화 사용 안 함) 넣기')
        if not args.dry_run:
            call('PATCH', f'/v1/builds/{build["id"]}', {'data': {'type': 'builds', 'id': build['id'], 'attributes': {'usesNonExemptEncryption': False}}})

    say(f'버전 {version} 에 빌드 {build["attributes"]["version"]} 붙이기')
    if not args.dry_run:
        call('PATCH', f'/v1/appStoreVersions/{vid}/relationships/build', {'data': {'type': 'builds', 'id': build['id']}})

    locs = call('GET', f'/v1/appStoreVersions/{vid}/appStoreVersionLocalizations')['data']
    ko = next((loc for loc in locs if loc['attributes']['locale'].startswith('ko')), None)
    if not ko:
        sys.exit('ko 로컬라이즈가 없음 — App Store Connect 에서 확인')
    say(f'새로운 기능: {whats_new!r}')
    if not args.dry_run:
        call('PATCH', f'/v1/appStoreVersionLocalizations/{ko["id"]}', {'data': {
            'type': 'appStoreVersionLocalizations', 'id': ko['id'], 'attributes': {'whatsNew': whats_new}}})

    say('심사 제출')
    if args.dry_run:
        return
    sub = call('POST', '/v1/reviewSubmissions', {'data': {
        'type': 'reviewSubmissions', 'attributes': {'platform': 'IOS'},
        'relationships': {'app': {'data': {'type': 'apps', 'id': APP_ID}}}}})['data']
    call('POST', '/v1/reviewSubmissionItems', {'data': {
        'type': 'reviewSubmissionItems',
        'relationships': {
            'reviewSubmission': {'data': {'type': 'reviewSubmissions', 'id': sub['id']}},
            'appStoreVersion': {'data': {'type': 'appStoreVersions', 'id': vid}}}}})
    done = call('PATCH', f'/v1/reviewSubmissions/{sub["id"]}', {'data': {
        'type': 'reviewSubmissions', 'id': sub['id'], 'attributes': {'submitted': True}}})['data']
    print(f'IOS-REVIEW SUBMITTED {version} ({done["attributes"].get("state")})', flush=True)


if __name__ == '__main__':
    main()
