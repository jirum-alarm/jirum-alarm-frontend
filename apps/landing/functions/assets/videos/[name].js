// Cloudflare Pages 는 정적 파일의 Range 요청에 206 대신 전체(200)를 준다(2026-10-12 운영 실측).
// iOS Safari 는 <video> 를 Range 로만 읽어서 200 이면 재생하지 않는다 — 영상 경로만 여기서 206 으로 답한다.
// 영상은 3~4MB 라 통째로 읽어 잘라도 Workers 메모리 안이다.

const parseRange = (header, size) => {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start;
  let end;
  if (m[1] === '') {
    // bytes=-N : 끝에서 N 바이트
    start = Math.max(0, size - Number(m[2]));
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start > end || start >= size) return null;
  return { start, end };
};

export const onRequest = async ({ request, env }) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') return env.ASSETS.fetch(request);
  // 원본은 Range 없이 받는다
  const asset = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
  if (!asset.ok) return asset;
  const headers = new Headers(asset.headers);
  headers.set('Accept-Ranges', 'bytes');
  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const rangeHeader = request.headers.get('Range');
  if (!rangeHeader) {
    headers.set('Content-Length', String(size));
    return new Response(request.method === 'HEAD' ? null : body, { status: 200, headers });
  }
  const range = parseRange(rangeHeader, size);
  if (!range) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  const { start, end } = range;
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : body.slice(start, end + 1), {
    status: 206,
    headers,
  });
};
