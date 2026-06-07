# EAS 배포 운영 계획

## 원칙

- 배포 실행은 GitHub Actions에서 관리한다.
- 네이티브 빌드는 EAS Cloud Build에 맡긴다.
- production 배포는 자동 실행하지 않고 수동 실행 + GitHub Environment approval을 사용한다.
- `package.json` scripts는 로컬 재현/디버깅용 보조 명령으로만 사용한다.

## 배포 종류

| 종류              | 목적                   | 방식                                  | 대상        |
| ----------------- | ---------------------- | ------------------------------------- | ----------- |
| Development Build | 개발자 dev-client      | EAS Build `development`               | 개발자      |
| Preview Build     | 팀 QA 앱               | EAS Build `preview`                   | 팀원/테스터 |
| Production Build  | 새 앱 버전 출시        | EAS Build `production` + Store Submit | 실제 사용자 |
| Preview OTA       | QA 앱 JS/assets 패치   | EAS Update `preview` channel          | 팀원/테스터 |
| Production OTA    | 운영 앱 JS/assets 패치 | EAS Update `production` channel       | 실제 사용자 |

## GitHub Actions

| Workflow                   | Trigger                        | 역할                             |
| -------------------------- | ------------------------------ | -------------------------------- |
| `mobile-validation`        | `pull_request`, `push`         | 타입체크/린트/테스트/스모크 빌드 |
| `mobile-build-development` | `workflow_dispatch`            | 개발자용 dev-client 생성         |
| `mobile-build-preview`     | `workflow_dispatch`            | 팀 QA용 preview 앱 생성          |
| `mobile-build-production`  | `workflow_dispatch` + approval | 스토어 제출용 production 앱 생성 |
| `mobile-ota-preview`       | `workflow_dispatch`            | preview channel OTA 배포         |
| `mobile-ota-production`    | `workflow_dispatch` + approval | production channel OTA 배포      |

## 트리거 정책

```text
PR 생성/수정
-> mobile-validation 자동 실행

main merge
-> mobile-validation 자동 실행
-> 배포는 자동 실행하지 않음

개발 앱 필요
-> mobile-build-development 수동 실행

팀 QA 앱 필요
-> mobile-build-preview 수동 실행

새 앱 버전 출시
-> mobile-build-production 수동 실행 + approval

QA용 JS 패치
-> mobile-ota-preview 수동 실행

운영 JS 패치
-> mobile-ota-production 수동 실행 + approval
```

## Build vs OTA 기준

OTA 가능:

```text
- JS/TS 로직 변경
- UI/스타일 변경
- 문구 변경
- API 호출 로직 변경
- 이미지/assets 변경
```

새 Build 필요:

```text
- native dependency 추가/삭제
- Expo SDK / React Native 업그레이드
- android/ 또는 ios/ 수정
- 앱 권한 변경
- Firebase native 설정 변경
- app.json의 네이티브 반영 항목 변경
```

## 권장 흐름

JS 변경:

```text
PR -> merge -> Preview OTA -> 확인 -> Production OTA 10% -> Production OTA 100%
```

네이티브 변경:

```text
PR -> merge -> Preview Build -> 확인 -> Production Build -> Store Submit
```

## Secret 관리

| 위치                          | 관리 대상                                              |
| ----------------------------- | ------------------------------------------------------ |
| EAS Credentials               | Android keystore, iOS certificate/provisioning profile |
| EAS Environment file variable | `google-services.json`, `GoogleService-Info.plist`     |
| GitHub Secrets                | `EXPO_TOKEN`                                           |

커밋 금지:

```text
google-services.json
GoogleService-Info.plist
keystore
certificate
credentials.json
Google Play service account JSON
```
