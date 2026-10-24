#!/usr/bin/env python3
"""옛 runtime 백포트 대상 고르기 — 지난 7일 앱 사용자 중 그 바이너리 버전 비율이 문턱 이상인 것만.

AGENTS §Mobile App «어느 runtime 까지?»: 10% 이상이면 내고 그 아래로 떨어지면 끊는다. 브랜치는 지우지 않으니
비율이 다시 오르면 저절로 대상이 된다. GA4 app_info.version 은 바이너리 버전이라 OTA 와 무관하다.
GA4 BigQuery 내보내기를 읽기 전용 서비스 계정으로 읽는다(GA4 Data API 계정은 GTM 권한까지 있어 CI 에 두지 않는다).

  echo '["1.5.8","1.5.7"]' | python3 active-runtimes.py   → 표준출력에 고른 runtime JSON 배열
env: BQ_SA_JSON(서비스 계정 JSON 통째) · BQ_GA4_DATASET(`<프로젝트>.analytics_<속성>`) · MIN_SHARE(기본 0.10)
읽지 못하면 받은 목록을 그대로 내보낸다(놓치는 쪽보다 시끄러운 쪽이 낫다).
공개 레포 Actions 로그라 버전별 사용자 수는 찍지 않는다 — 고른 것·뺀 것만.
"""

import json
import os
import sys
import urllib.request

QUERY = """
SELECT app_info.version AS v, COUNT(DISTINCT user_pseudo_id) AS n
FROM `{dataset}.events_*`
WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('Asia/Seoul'), INTERVAL 7 DAY))
                        AND FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('Asia/Seoul'), INTERVAL 1 DAY))
  AND platform IN ('IOS', 'ANDROID')
GROUP BY v
"""


def shares() -> dict[str, float]:
    from google.oauth2 import service_account
    import google.auth.transport.requests

    info = json.loads(os.environ['BQ_SA_JSON'])
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/bigquery.readonly'])
    creds.refresh(google.auth.transport.requests.Request())
    dataset = os.environ['BQ_GA4_DATASET']
    req = urllib.request.Request(
        f'https://bigquery.googleapis.com/bigquery/v2/projects/{info["project_id"]}/queries',
        data=json.dumps({'query': QUERY.format(dataset=dataset), 'useLegacySql': False, 'timeoutMs': 60000}).encode(),
        headers={'Authorization': f'Bearer {creds.token}', 'Content-Type': 'application/json'},
    )
    res = json.load(urllib.request.urlopen(req))
    if not res.get('jobComplete'):
        raise TimeoutError('BigQuery 가 60초 안에 끝나지 않았다')
    users = {r['f'][0]['v']: int(r['f'][1]['v']) for r in res.get('rows', []) if r['f'][0]['v']}
    total = sum(users.values())
    return {v: n / total for v, n in users.items()} if total else {}


def main() -> None:
    runtimes = json.load(sys.stdin)
    min_share = float(os.environ.get('MIN_SHARE') or 0.10)
    try:
        share = shares()
        if not share:
            raise ValueError('사용자 행이 비었다')
    except Exception as e:  # noqa: BLE001 — 어떤 실패든 전부 내보내는 쪽으로
        print(f'앱 버전 비율을 못 읽어 ota/runtime-* 전부에 낸다: {e}', file=sys.stderr)
        print(json.dumps(runtimes))
        return
    kept = [rt for rt in runtimes if share.get(rt, 0) >= min_share]
    dropped = [rt for rt in runtimes if rt not in kept]
    print(f'지난 7일 앱 사용자 {min_share:.0%} 이상: {", ".join(kept) or "없음"} · 뺌: {", ".join(dropped) or "없음"}', file=sys.stderr)
    print(json.dumps(kept))


if __name__ == '__main__':
    main()
