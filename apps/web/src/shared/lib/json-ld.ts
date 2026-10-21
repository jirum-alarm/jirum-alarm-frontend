/** `</script>` 가 상품 제목에 섞여도 스크립트가 끊기지 않게 — JSON 안의 `<` 를 이스케이프한다(beauty-web `shared/lib/seo.ts` 와 같은 규칙). */
export const jsonLdHtml = (data: unknown) => ({
  __html: JSON.stringify(data).replace(/</g, '\\u003c'),
});
