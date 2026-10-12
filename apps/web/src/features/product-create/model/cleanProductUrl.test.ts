import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { cleanProductUrl } = require('./cleanProductUrl.ts') as typeof import('./cleanProductUrl');

describe('cleanProductUrl', () => {
  it('2026-10-12 문의 링크 — G마켓 검색 결과 965자 → goodscode 만', () => {
    const pasted =
      'https://item.gmarket.co.kr/Item?spm=gmktpc.searchlist.toporganictier.d0_1.55e63e92rQyJSO&goodscode=4872542635&utparam-url=%7B%22x_object_type%22%3A%22item%22%2C%22query%22%3A%22%EA%B0%90%ED%99%8D%EC%82%AC%EA%B3%BC%22%7D';
    assert.equal(cleanProductUrl(pasted), 'https://item.gmarket.co.kr/Item?goodscode=4872542635');
  });

  it('G마켓 모바일 경로형', () => {
    assert.equal(
      cleanProductUrl('https://m.gmarket.co.kr/vi/product/4872542635?spm=x'),
      'https://item.gmarket.co.kr/Item?goodscode=4872542635',
    );
  });

  it('쿠팡 — itemId·vendorItemId 만 남긴다', () => {
    assert.equal(
      cleanProductUrl(
        'https://www.coupang.com/vp/products/8249773736?itemId=23748804904&vendorItemId=91778307055&q=%EC%82%AC%EA%B3%BC&searchId=abc&sourceType=search&rank=3',
      ),
      'https://www.coupang.com/vp/products/8249773736?itemId=23748804904&vendorItemId=91778307055',
    );
  });

  it('옥션 — ItemNo 대소문자 그대로 유지', () => {
    assert.equal(
      cleanProductUrl('https://itempage3.auction.co.kr/detailview.aspx?ItemNo=E794461319&frm3=V2'),
      'https://itempage3.auction.co.kr/detailview.aspx?ItemNo=E794461319',
    );
  });

  it('스마트스토어 — 상품 id 가 경로에 있어 쿼리를 다 지운다', () => {
    assert.equal(
      cleanProductUrl(
        'https://smartstore.naver.com/dadamfruit/products/5112732856?site_preference=device&NaPm=ct%3Dmu8zvora%7Cci%3Dshopn',
      ),
      'https://smartstore.naver.com/dadamfruit/products/5112732856',
    );
  });

  it('카카오 스토어 공유 링크', () => {
    assert.equal(
      cleanProductUrl('https://store.kakao.com/nongshim/products/597073859?ref=SHARE'),
      'https://store.kakao.com/nongshim/products/597073859',
    );
  });

  it('모르는 쇼핑몰 — 필요한 id 는 남기고 utm 만 지운다', () => {
    assert.equal(
      cleanProductUrl(
        'https://thirtymall.com/detail?id=136594060&utm_source=kakao&utm_medium=share',
      ),
      'https://thirtymall.com/detail?id=136594060',
    );
  });

  it('모르는 쇼핑몰 — 추적 파라미터가 없으면 그대로', () => {
    const url = 'https://www.lotteon.com/p/product/bundle/LO2766270999?dp_infw_cd=CAT60937';
    assert.equal(cleanProductUrl(url), url);
  });

  it('스마트스토어라도 상품 주소가 아니면 규칙을 안 탄다', () => {
    assert.equal(
      cleanProductUrl('https://smartstore.naver.com/store/shoppingstory/detail?id=123&NaPm=x'),
      'https://smartstore.naver.com/store/shoppingstory/detail?id=123',
    );
  });

  it('빈 ? 를 남기지 않는다', () => {
    assert.equal(
      cleanProductUrl('https://ko.aliexpress.com/item/1005005916750177.html?spm=a2g0o'),
      'https://ko.aliexpress.com/item/1005005916750177.html',
    );
  });

  it('URL 이 아니면 그대로', () => {
    assert.equal(cleanProductUrl('사과 5kg'), '사과 5kg');
    assert.equal(cleanProductUrl('javascript:alert(1)'), 'javascript:alert(1)');
  });
});
