import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { fixed, light } from '@jirum/design-system';
import { ImageResponse } from 'next/og';
import sharp from 'sharp';

import { HotDealType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { hotdealTextMap } from '@/shared/config/hotdeal';

import { parseProductId } from '@/entities/product/lib/product-id';

import { toSeoImageUrl } from '@/features/product-detail/lib/product-seo';
import { buildShareCard } from '@/features/product-detail/lib/share-card';

/**
 * 상품 공유 카드 1200×630 — 카톡·X·스레드 미리보기에 뜨는 이미지.
 *
 * 상세 generateMetadata 가 **공유 링크(utm_source=share)일 때만** og:image 를 여기로 돌린다.
 * 검색엔진이 수집하는 정식 URL 은 그대로 상품 사진이라, 3천만 개 상세를 크롤러가 훑어도 이 라우트는 안 불린다.
 *
 * 글자는 satori 가 폰트로 직접 그린다(컨테이너에 한글 폰트가 없다) — 가변 woff2 는 못 읽어서
 * 같은 서브셋에서 뽑은 정적 TTF 두 굵기를 쓴다(`shared/fonts/og`, 재생성은 fonts/README.md).
 */

const WIDTH = 1200;
const HEIGHT = 630;
const PAD = 48;
const THUMB = HEIGHT - PAD * 2;

// 한 파드에서 한 번만 읽는다(합쳐 1.1MB).
let fontsPromise: Promise<{ semibold: Buffer; extrabold: Buffer; icon: string }> | null = null;
const loadAssets = () => {
  fontsPromise ??= (async () => {
    // standalone 서버는 apps/web 으로 chdir 한다 — dev·운영 모두 cwd 기준 상대 경로가 같다.
    const root = process.cwd();
    const [semibold, extrabold, icon] = await Promise.all([
      readFile(join(root, 'src/shared/fonts/og/Pretendard-600.ttf')),
      readFile(join(root, 'src/shared/fonts/og/Pretendard-800.ttf')),
      readFile(join(root, 'public/apple-touch-icon.png')),
    ]);
    return { semibold, extrabold, icon: `data:image/png;base64,${icon.toString('base64')}` };
  })().catch((e) => {
    fontsPromise = null;
    throw e;
  });
  return fontsPromise;
};

/**
 * CDN 썸네일은 webp 뿐이다(원본 확장자는 403). satori 가 webp 를 못 그리는 버전이 있어
 * sharp 로 정사각 PNG 로 바꿔 넣는다. 못 받으면 사진 없이 그린다 — 카드가 깨지는 것보다 낫다.
 */
const loadThumbnail = async (url: string | null | undefined): Promise<string | null> => {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      // 커뮤니티 썸네일은 세로로 긴 쇼핑몰 캡처가 많다 — 가운데를 자르면 상품 대신 가격표·버튼만 남아 위를 남긴다.
      .resize(THUMB, THUMB, { fit: 'cover', position: 'top' })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
};

// 배지 그라데이션 정지점 — web·앱 HotdealBadge 와 같은 값.
const BADGE_BG: Record<HotDealType, string> = {
  [HotDealType.HotDeal]: 'linear-gradient(90deg, #F19824 0%, #E15A00 51%, #E68B13 100%)',
  [HotDealType.SuperDeal]: `linear-gradient(90deg, #F76C7C 0%, ${light.error[500]} 56%, #F76C7C 100%)`,
  [HotDealType.UltraDeal]: `linear-gradient(90deg, ${light.error[500]} 0%, #BB0016 48%, ${light.error[500]} 100%)`,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  // 카톡 scrap 이 확장자 있는 이미지 주소를 잘 받아서 메타는 `/api/og/product/{id}.jpg` 로 건다.
  const productId = parseProductId((await params).id.replace(/\.jpg$/, ''));
  if (productId === null) return new Response('Not found', { status: 404 });

  const product = await ProductService.getProductInfo({ id: productId }).catch(() => null);
  if (!product) return new Response('Not found', { status: 404 });

  // `hp=1` = 토스 코너 유입 링크(상세가 가격을 숨기는 경로). 카드에서도 숨긴다.
  const hidePrice = new URL(request.url).searchParams.get('hp') === '1';
  const hotDealType = product.hotDealType ?? null;
  const card = buildShareCard({
    title: product.title,
    price: product.price,
    mallName: product.mallName,
    badge: hotDealType ? hotdealTextMap[hotDealType] : null,
    isEnd: product.isEnd,
    hidePrice,
  });

  // DB 썸네일이 .jpg/.png 로 남은 상품이 많은데 CDN 원본은 webp 변환 뒤 지워진다(403) — webp 경로로 읽는다.
  const thumbnailUrl = toSeoImageUrl(product.thumbnail);
  const [assets, thumbnail] = await Promise.all([loadAssets(), loadThumbnail(thumbnailUrl)]);
  const gray = light.gray;

  const image = new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        padding: PAD,
        gap: PAD,
        background: light.white,
        fontFamily: 'Pretendard',
      }}
    >
      <div
        style={{
          width: THUMB,
          height: THUMB,
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
          overflow: 'hidden',
          background: gray[100],
          position: 'relative',
        }}
      >
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element -- satori 는 img 만 그린다
          <img src={thumbnail} width={THUMB} height={THUMB} alt="" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- satori 는 img 만 그린다
          <img src={assets.icon} width={180} height={180} alt="" style={{ borderRadius: 40 }} />
        )}
        {card.ended ? (
          <div
            style={{
              // satori 는 inset 을 모른다 — 네 변을 따로 준다.
              position: 'absolute',
              top: 0,
              left: 0,
              width: THUMB,
              height: THUMB,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(16, 24, 40, 0.55)',
              color: fixed.white,
              fontSize: 48,
              fontWeight: 800,
            }}
          >
            종료된 딜
          </div>
        ) : null}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 52 }}>
          {hotDealType ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 52,
                padding: '0 22px',
                borderRadius: 14,
                backgroundImage: BADGE_BG[hotDealType],
                color: fixed.white,
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              {card.badge}
            </div>
          ) : null}
          {card.mallName ? (
            <div style={{ fontSize: 30, fontWeight: 600, color: gray[500] }}>{card.mallName}</div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 42,
            fontWeight: 600,
            lineHeight: 1.35,
            color: gray[900],
            lineClamp: 3,
            display: 'block',
            // 낱말 중간에서 끊지 않는다(normal 은 「프라이/팬」처럼 자른다).
            wordBreak: 'keep-all',
          }}
        >
          {card.title}
        </div>

        {card.price ? (
          <div
            style={{
              marginTop: 'auto',
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -1,
              color: card.ended ? gray[400] : gray[900],
              textDecoration: card.ended ? 'line-through' : 'none',
            }}
          >
            {card.price}
          </div>
        ) : (
          <div style={{ marginTop: 'auto', display: 'flex' }} />
        )}

        <div
          style={{
            marginTop: 24,
            paddingTop: 24,
            borderTop: `2px solid ${gray[200]}`,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- satori 는 img 만 그린다 */}
          <img src={assets.icon} width={44} height={44} alt="" style={{ borderRadius: 11 }} />
          <div style={{ fontSize: 30, fontWeight: 800, color: gray[900] }}>지름알림</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: gray[500] }}>
            놓치기 쉬운 핫딜, 알림으로 먼저
          </div>
        </div>
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Pretendard', data: assets.semibold, weight: 600, style: 'normal' },
        { name: 'Pretendard', data: assets.extrabold, weight: 800, style: 'normal' },
      ],
    },
  );

  // ★스트리밍 PNG(청크 전송·Content-Length 없음, 400~500KB)는 카톡 scrap 이 받아 가지 못했다 —
  // og:image 를 이 주소로 걸어도 카드가 상품 사진으로 떨어졌다(2026-10-12 운영 실측, 홈의 .webp 는 정상).
  // 다 그린 뒤 JPEG(~1/5 크기)로 바꿔 길이를 알고 보낸다.
  const jpeg = await sharp(Buffer.from(await image.arrayBuffer()))
    .jpeg({ quality: 88 })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(jpeg.length),
      // 카톡·X 는 받아 간 카드를 자기 쪽에 캐시한다. 우리 쪽은 같은 링크가 연달아 열릴 때만 덜 그리면 된다.
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
    },
  });
}
