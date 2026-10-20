#!/usr/bin/env python3
"""운영 GraphQL 스키마 조회 키를 stdout 으로 낸다 — introspection 은 이 키를 x-introspection-key 헤더로 보낼 때만 열린다.

왜: 공개 API 가 스키마를 아무에게나 내주던 것을 막았다(crawling-server introspection-guard.plugin.ts, 2026-10-15).
release-tag 의 운영 스키마 관문(gql-check.mjs)과 codegen 의 스키마 갱신만 이 키로 연다.

env GRAPHQL_INTROSPECTION_KEY 가 있으면 그걸 쓰고, 없으면 로컬 헬퍼(기본 ~/.config/jirum/introspection-key,
env JIRUM_INTROSPECTION_KEY_CMD 로 바꿈)가 stdout 으로 낸 값을 쓴다. 헬퍼 내용은 jirum vault 참고.

  GRAPHQL_INTROSPECTION_KEY=$(python3 scripts/introspection_key.py) pnpm --filter @jirum/graphql-schema refresh
"""
import os
import subprocess
import sys

HELPER = os.path.expanduser(os.environ.get('JIRUM_INTROSPECTION_KEY_CMD', '~/.config/jirum/introspection-key'))


def introspection_key():
    if os.environ.get('GRAPHQL_INTROSPECTION_KEY'):
        return os.environ['GRAPHQL_INTROSPECTION_KEY']
    if not os.path.exists(HELPER):
        return ''
    p = subprocess.run([HELPER], capture_output=True, text=True)
    if p.returncode != 0:
        return ''
    return p.stdout.strip()


if __name__ == '__main__':
    key = introspection_key()
    if not key:
        sys.exit(f'introspection 키를 못 찾음 — env GRAPHQL_INTROSPECTION_KEY 를 넣거나 {HELPER} 를 확인')
    print(key)
