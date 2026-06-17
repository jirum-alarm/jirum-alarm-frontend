# 유저 핫딜 직접 등록 + 업로드 정보 노출 기획서

> 작성일: 2026-06-17 · 대상 레포: `jirum-alarm-crawling-server`(서버), `jirum-alarm-frontend`(웹/모바일/어드민)

## 1. 목표

상품 상세 화면의 메타 정보 영역에 **"업로드(작성자)" 행**을 노출하고, **일반 유저가 직접 핫딜을 등록**할 수 있는 경로를 만든다. 등록된 유저 핫딜은 크롤링 핫딜과 **동일 테이블·동일 노출**로 다룬다.

업로드 행은 3가지 케이스로 분기한다 (기획 이미지 기준). **식별은 `Product.uploaderType` enum으로 한다** (§2.3 결정 참고):

| 케이스 | 조건 | 표시 |
| --- | --- | --- |
| 크롤링 상품 | `uploaderType === CRAWLED` (기본값) | **업로드 행 미노출** |
| 지름알림(공식) 업로드 | `uploaderType === OFFICIAL` | Primary 컬러 + 지름 아이콘 + "지름알림" |
| 일반 유저 업로드 | `uploaderType === USER` | Gray600 컬러로 `author.nickname` |

---

## 2. 현재 상태 진단 (조사 결과)

### 이미 되어 있는 것 ✅
- **서버 DB/엔티티**: `Product.authorId`(int, nullable) + `author` ManyToOne(User) 관계 존재.
  - [product.entity.ts:52-54](../jirum-alarm-crawling-server/src/product/entity/product.entity.ts) — `authorId`
  - [product.entity.ts:248-250](../jirum-alarm-crawling-server/src/product/entity/product.entity.ts) — `author` 관계 (`@JoinColumn({ name: 'authorId' })`)
  - 마이그레이션 완료: `migration/1741691909165-add-product-author.ts`
- **dev API GraphQL 스키마**: `ProductOutput.author: User` 이미 노출됨 (`apps/web/schema.graphql:1063`). → 로컬 main의 entity엔 `author`에 `@Field()`가 안 보이는데 dev엔 노출돼 있음 = **코드/배포 또는 브랜치 불일치**. 작업 시작 전 서버 main HEAD에서 `@Field()` 유무 재확인 필요.
- **프론트 표시 UI**: 데스크톱/모바일 둘 다 업로드 행이 이미 구현돼 있음.
  - [desktop/ProductInfo.tsx:90-113](apps/web/src/widgets/product-detail/ui/desktop/ProductInfo.tsx)
  - [mobile/ProductInfo.tsx:78-102](apps/web/src/widgets/product-detail/ui/mobile/ProductInfo.tsx)
  - 쿼리도 author 포함: [graphql/product.ts:130-133](apps/web/src/graphql/product.ts) — `author { id nickname }`

### 깨져 있는 것 / 없는 것 🔴
1. **공식(지름알림) 식별 로직이 작동 불가능**
   - 프론트는 `product.author.id === 'admin'`로 분기하는데 ([desktop/ProductInfo.tsx:100,103](apps/web/src/widgets/product-detail/ui/desktop/ProductInfo.tsx)), `User.id`는 자동증가 **숫자 PK** ([user.entity.ts:21-23](../jirum-alarm-crawling-server/src/user/entity/user.entity.ts), GraphQL `ID!`). `'admin'`이라는 id는 존재할 수 없음 → **지름알림 분기는 항상 false**. 공식이 올려도 회색으로만 보임.
2. **`User`에 role 필드 자체가 없음** 🔴 (중요)
   - `user.entity.ts`에 `role` 컬럼이 없음 ([user.entity.ts](../jirum-alarm-crawling-server/src/user/entity/user.entity.ts) 전체에 role 매치 0건). `Role` enum은 [common/enum/role.ts](../jirum-alarm-crawling-server/src/common/enum/role.ts)에만 존재(`USER='user'`, `ADMIN='admin'`)하고, `@Roles(Role.ADMIN)` 가드는 별도 경로(토큰/환경)로 admin을 판정하는 것으로 보임.
   - → **"author.role === ADMIN으로 판별"하려면 먼저 User에 role 컬럼/노출을 추가**해야 함. 사용자가 고른 방식의 전제 조건임.
3. **상품 생성 시 authorId를 채우는 경로가 없음**
   - `IAddProduct`에 `authorId` 없음 ([add-product.interface.ts](../jirum-alarm-crawling-server/src/product/repository/interface/add-product.interface.ts)). 크롤러/배치는 authorId를 세팅하지 않음.
4. **유저/관리자가 상품을 직접 등록하는 mutation·화면이 없음.**

---

## 3. 결정사항 (사용자 확정)

- **범위**: 표시 + **일반 유저 등록까지 풀세트**
- **공식 식별**: 처음엔 `author.role === ADMIN`을 검토했으나, 조사 결과 **role은 DB User 컬럼이 아니라 admin 전용 로그인 경로에서 JWT에만 실리는 값**이었다 ([auth.service.ts:89](../jirum-alarm-crawling-server/src/auth/auth.service.ts) `loginByAdmin → Role.ADMIN`, [jwt-auth.guard.ts](../jirum-alarm-crawling-server/src/common/guard/jwt-auth.guard.ts) `req.user.role` 판정). DB join으로 오는 `author`에는 role이 없어 노출 불가. → **`Product.uploaderType` enum 플래그 신설로 대체.**
- **uploaderType enum**: `CRAWLED`(기본) / `OFFICIAL`(지름알림 공식) / `USER`(일반 유저)
  - **저장 기본값 = `CRAWLED`** (DB `NOT NULL DEFAULT 'CRAWLED'`). 크롤러/배치는 손댈 필요 없이 자동 CRAWLED.
  - **유저 등록 mutation에서만 `USER`로 세팅.** `OFFICIAL`은 지름알림 공식이 등록할 때만 지정.
- **노출 정책**: 크롤링 핫딜과 **동일 테이블·동일 노출** (즉시 노출).
- **등록 폼 필드**: 최소 필드(제목·구매링크 url·가격·썸네일) **+ 내용(content) + 카테고리**

> 미결: 즉시 노출로 가되, 스팸/어뷰징/저품질 유입 리스크(§7)는 따로 정리. 신고(`user-report`)·관리자 hard delete는 이미 있으니 사후 대응은 가능.

### 3-1. 진행 워크플로우 (사용자 지시)
서버를 **먼저 커밋·푸시(dev 배포)** → 프론트 작업 → **검증은 나중에**.
이유: 프론트 code-gen이 dev API 스키마(`jirum-dev-api.kyojs.com/graphql`)에서 타입을 가져오므로, `UploaderType`/`uploaderType`이 dev에 배포돼야 codegen이 성공한다.

---

## 4. 설계 — 서버 (`jirum-alarm-crawling-server`)

### 4-1. Product.uploaderType enum 컬럼 신설 ✅ (구현 완료)
- enum: [src/product/enum/uploader-type.enum.ts](../jirum-alarm-crawling-server/src/product/enum/uploader-type.enum.ts) — `CRAWLED/OFFICIAL/USER`, `registerEnumType(UploaderType)`.
- export: [src/product/enum/index.ts](../jirum-alarm-crawling-server/src/product/enum/index.ts).
- 컬럼: [product.entity.ts](../jirum-alarm-crawling-server/src/product/entity/product.entity.ts) `authorId` 아래 — `@Field(() => UploaderType) @Column({ type:'enum', enum: UploaderType, default: UploaderType.CRAWLED })`. entity의 `@Field`로 GraphQL 자동 노출.
- 마이그레이션: [migration/1779956000000-add-product-uploader-type.ts](../jirum-alarm-crawling-server/src/migration/1779956000000-add-product-uploader-type.ts) — `enum(...) NOT NULL DEFAULT 'CRAWLED'`. 기존 113K+ row 자동 백필.
- 테스트 mock 보정: `test/mock/data/product.data.mock.ts`에 `uploaderType: CRAWLED` 추가.

### 4-2. Product.author 노출은 이미 되어 있었음 (entity @Field 불필요)
- author는 [product-user.resolver.ts:11](../jirum-alarm-crawling-server/src/user/product-user.resolver.ts) `@ResolveField author`가 `authorId`로 User를 로드해 노출 중. (entity의 `author` 관계엔 `@Field` 없음 — ResolveField와 중복되면 충돌하므로 추가하지 않음.) dev 스키마에 `author: User`가 있었던 이유.
- 따라서 표시 기능에 필요한 author + uploaderType 노출은 서버에서 완비됨.

### 4-3. 유저 핫딜 등록 mutation 신설
패턴은 [comment.resolver.ts:50-54](../jirum-alarm-crawling-server/src/comment/comment.resolver.ts)의 `addComment`(`@Roles(Role.USER)` + `req.user.id`)를 그대로 차용.

- `@Roles(Role.USER) @Mutation createUserProduct(args): Product`
- Args(`CreateUserProductArgs`): `title`(필수), `url`(필수, 구매링크), `price`, `thumbnail`, `content`, `categoryId`
- 서비스에서 `IAddProduct`로 매핑하여 insert. **authorId = req.user.id**.
- **`IAddProduct`에 `authorId?: number` 추가** ([add-product.interface.ts](../jirum-alarm-crawling-server/src/product/repository/interface/add-product.interface.ts)).

#### ⚠️ 유니크 제약 처리 (설계 핵심)
- Product는 `@Unique('unique_providerId_externalId', ['providerId', 'externalId'])` ([product.entity.ts:45](../jirum-alarm-crawling-server/src/product/entity/product.entity.ts)).
- `providerId`/`externalId`는 크롤링 출처용. 유저 등록 상품은 출처가 없으므로:
  - **"유저 직접등록"용 가상 provider를 신설** (예: `ProductProvider.USER_SUBMITTED`, type=`community` 또는 신규 type). [product-provider.enum.ts](../jirum-alarm-crawling-server/src/provider/enum/product-provider.enum.ts) + provider row seed.
  - `externalId`는 유저 등록 시 충돌 안 나도록 생성 전략 필요(예: auto-increment 별도 시퀀스, 또는 productId 후처리 업데이트, 또는 timestamp 기반). → **중복 등록(같은 url) 정책도 함께 결정**.

### 4-4. 노출/랭킹 영향
- 동일 테이블·동일 노출이므로 기존 리스트/랭킹/검색 파이프라인에 그대로 포함됨. 유저 상품이 `isHot`/랭킹 로직에 어떻게 잡히는지 확인 — 초기엔 `isHot=false`로 두고 일반 리스트에만 노출 권장.

---

## 5. 설계 — 프론트 (`jirum-alarm-frontend`)

### 5-1. 표시 로직 수정 (깨진 분기 교체)
- 분기 기준을 `uploaderType`으로 교체:
  - `uploaderType === 'CRAWLED'` → 업로드 행 미노출 (행 자체를 `uploaderType !== 'CRAWLED'`일 때만 렌더)
  - `uploaderType === 'OFFICIAL'` → primary(`text-primary-800`) + `<Jirume/>` + "지름알림"
  - `uploaderType === 'USER'` → Gray600 + `author?.nickname`
- 기존 깨진 비교 `author.id === 'admin'` 제거:
  - [desktop/ProductInfo.tsx:95-107](apps/web/src/widgets/product-detail/ui/desktop/ProductInfo.tsx)
  - [mobile/ProductInfo.tsx:84-96](apps/web/src/widgets/product-detail/ui/mobile/ProductInfo.tsx)
- 일반 유저 컬러는 기획상 **Gray600**. 현재 코드는 `text-gray-500`을 씀 → `text-gray-600`으로 맞춤 ([globals.css](apps/web/src/shared/style/globals.css)에 gray-600 토큰 확인). 라벨은 `text-gray-400` 유지.
- 지름 아이콘: 기존 `Jirume`(`@/shared/ui/common/icons/Jirume`) 재사용.

### 5-2. GraphQL 쿼리에 uploaderType 추가
- [graphql/product.ts:130-142](apps/web/src/graphql/product.ts) ProductInfo fragment에 `uploaderType` 추가 (author는 이미 `{ id nickname }` 있음). USER 케이스에서 nickname을 쓰므로 author 유지.
- `product.service.ts`의 `QueryProduct`에도 동일 추가 ([product.service.ts:125-186](apps/web/src/shared/api/product/product.service.ts)).
- 서버가 dev 배포된 후 `pnpm code-gen` ([apps/web/codegen.ts](apps/web/codegen.ts))으로 `UploaderType` enum 타입 + fragment 타입 갱신.

### 5-3. 유저 핫딜 등록 화면/뮤테이션 (신규)
패턴은 커뮤니티 글쓰기([community/write/page.tsx](apps/web/src/app/(desktop-ready)/community/write/page.tsx), [MutationAddCommunityPost](apps/web/src/graphql/community.ts))를 차용.

- 라우트: `app/(desktop-ready)/products/write` (또는 `deals/write`). 로그인 필수(미로그인 → `PAGE.LOGIN` redirect).
- 폼 컴포넌트: 제목 / 구매링크(url) / 가격 / 썸네일(이미지 업로드 또는 url) / 내용(content) / 카테고리 선택.
  - 카테고리는 기존 [QueryCategories](apps/web/src/graphql/category.ts) (`categories { id name }`) 재사용.
- mutation: `graphql/product.ts`에 `MutationCreateUserProduct` 추가 → `code-gen`.
- 진입점: 상품 리스트/홈 등에 "핫딜 등록" CTA. (위치는 디자인 확정 필요)

---

## 6. 작업 순서 (의존성 순)

1. ✅ **서버 ① uploaderType enum 컬럼 + 마이그레이션** (4-1) — **구현 완료, 커밋·푸시 → dev 배포 대기.**
2. **(dev 배포 후) 프론트 ① 표시 분기 수정** (5-1, 5-2): 쿼리에 uploaderType 추가 + code-gen + 분기 교체. → **여기까지가 "표시 정상화" (3케이스 올바르게 동작).**
3. **서버 ② 유저 등록 mutation + 가상 provider + IAddProduct.authorId + uploaderType=USER** (4-3).
4. **프론트 ② 등록 화면/뮤테이션** (5-3).

> 1~2는 "표시"만으로 독립 배포 가능(가치 즉시 발생). 3~4는 "등록" 묶음.
> **현재 진행 워크플로우(§3-1)**: 서버 ①을 먼저 푸시(dev 배포)한 뒤, 배포 확인되면 프론트 ②부터 이어간다. 검증은 나중에.

---

## 7. 리스크 / 미결 항목

- **즉시 노출 = 어뷰징 노출 리스크**: 스팸·광고·허위 핫딜이 검증 없이 메인 리스트에 노출됨. 신고/관리자 삭제는 사후뿐. → 초기 운영 정책(레이트리밋, 신규 유저 제한, 추후 승인제 전환 여지) 합의 필요.
- **유니크 제약 + externalId 생성 전략 + 동일 url 중복 등록 정책** (4-3) — 미확정.
- **썸네일 입력 방식**: 직접 이미지 업로드 vs url 입력. 업로드라면 스토리지/업로드 API 필요(현재 유무 미확인).
- **User.role 추가 방식**(컬럼 신설 vs computed) — 기존 admin 판정 메커니즘 위치 확인 후 결정.
- **dev/main 스키마 불일치**(author @Field) 원인 규명.
- 가격은 서버 `IAddProduct.price`가 **string** 타입임 — 폼 입력/검증 시 포맷 주의.
