#!/usr/bin/env python3
"""운영 GraphQL 스키마 조회 키를 stdout 으로 낸다 — introspection 은 이 키를 x-introspection-key 헤더로 보낼 때만 열린다.

왜: 공개 API 가 스키마를 아무에게나 내주던 것을 막았다(crawling-server introspection-guard.plugin.ts, 2026-10-15).
release-tag 의 운영 스키마 관문(gql-check.mjs)과 codegen 의 스키마 갱신만 이 키로 연다.

키는 Infisical prod /crawling-server LOCAL_JSON 의 graphql.introspectionKey(dev /crawling-server-dev 도 같은 값).
env GRAPHQL_INTROSPECTION_KEY 가 있으면 그걸 쓰고, 없으면 Claude 의 isec.sh 로 읽는다.

  GRAPHQL_INTROSPECTION_KEY=$(python3 scripts/introspection_key.py) pnpm --filter @jirum/graphql-schema refresh
"""
import json
import os
import subprocess
import sys

ISEC = os.path.expanduser('~/.claude/scripts/isec.sh')


def introspection_key():
    if os.environ.get('GRAPHQL_INTROSPECTION_KEY'):
        return os.environ['GRAPHQL_INTROSPECTION_KEY']
    if not os.path.exists(ISEC):
        return ''
    p = subprocess.run([ISEC, 'secrets', 'get', 'LOCAL_JSON', '--env=prod', '--path=/crawling-server', '--plain'],
                       capture_output=True, text=True)
    if p.returncode != 0:
        return ''
    try:
        return json.loads(p.stdout).get('graphql', {}).get('introspectionKey', '')
    except ValueError:
        return ''


if __name__ == '__main__':
    key = introspection_key()
    if not key:
        sys.exit('introspection 키를 못 찾음 — env GRAPHQL_INTROSPECTION_KEY 를 넣거나 isec.sh 를 확인')
    print(key)
