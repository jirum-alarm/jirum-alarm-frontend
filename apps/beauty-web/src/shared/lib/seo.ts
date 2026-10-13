import { BASE_PATH } from '@/shared/config/beauty';

/** 이 앱 페이지의 절대 URL(canonical·og:url). basePath 를 직접 붙인다 — 메타데이터 URL 엔 basePath 가 자동으로 안 붙는다. */
export const beautyUrl = (base: string, path: string = '') =>
  `${base}${BASE_PATH}${path === '/' ? '' : path}`;

/** 상품 목록 ItemList JSON-LD — web /beauty·/toss 와 같은 모양(상세 URL 은 본 서비스 /products/{id}). */
export function itemListJsonLd(
  base: string,
  name: string,
  items: { id: string; title: string; path?: string }[],
) {
  if (items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.title,
      url: `${base}${item.path ?? `/products/${item.id}`}`,
    })),
  };
}

/** `</script>` 가 상품 제목에 섞여도 스크립트가 끊기지 않게 — JSON 안의 `<` 를 이스케이프한다. */
export const jsonLdHtml = (data: object) => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c'),
});
