export function normalizeAssetUrl(source: string) {
  try {
    const url = new URL(source);
    url.pathname = url.pathname
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return url.toString();
  } catch {
    return source.replace(/\+/g, '%2B');
  }
}
