'use server';

import { redirect } from 'next/navigation';

import { getAccessToken } from '@/shared/actions/token';
import { GRAPHQL_ENDPOINT } from '@/shared/config/graphql';
import { PAGE } from '@/shared/config/page';

/**
 * AI 비서 연결(MCP OAuth) 동의 화면의 서버 쪽. 로그인 쿠키(ACCESS_TOKEN)로 백엔드에 직접 묻는다 —
 * 승인 요청은 백엔드가 10분 들고 있고, 허용하면 백엔드가 준 «돌아갈 주소»(AI 비서의 콜백)로 보낸다.
 */
type McpRequestInfo = { clientName: string; redirectHost: string };

const authorizePath = (req: string) => `/mcp/authorize?req=${encodeURIComponent(req)}`;
const loginPath = (req: string) => `${PAGE.LOGIN}?rtnUrl=${encodeURIComponent(authorizePath(req))}`;

async function call<T>(query: string, variables: Record<string, unknown>, token: string) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });
  const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
  // 역할 검사 실패(만료·게스트 토큰)는 로그인부터 다시.
  return {
    data: body.data,
    needsLogin: !!body.errors?.some((e) => /forbidden|unauthorized/i.test(e.message)),
  };
}

export async function loadRequest(req: string): Promise<McpRequestInfo | null> {
  const token = await getAccessToken();
  if (!token) redirect(loginPath(req));
  const { data, needsLogin } = await call<{ mcpAuthorizationRequest: McpRequestInfo | null }>(
    'query($id: String!) { mcpAuthorizationRequest(requestId: $id) { clientName redirectHost } }',
    { id: req },
    token,
  );
  if (needsLogin) redirect(loginPath(req));
  return data?.mcpAuthorizationRequest ?? null;
}

export async function decide(formData: FormData) {
  const req = String(formData.get('req') ?? '');
  const approve = formData.get('approve') === '1';
  const token = await getAccessToken();
  if (!token) redirect(loginPath(req));
  const { data, needsLogin } = await call<{ decideMcpAuthorization: string | null }>(
    'mutation($id: String!, $approve: Boolean!) { decideMcpAuthorization(requestId: $id, approve: $approve) }',
    { id: req, approve },
    token,
  );
  if (needsLogin) redirect(loginPath(req));
  // 만료·이미 처리한 요청이면 같은 화면이 «다시 연결해 달라»를 보여 준다.
  redirect(data?.decideMcpAuthorization ?? authorizePath(req));
}
