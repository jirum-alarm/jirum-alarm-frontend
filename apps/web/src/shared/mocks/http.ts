// dev:mock 용 독립 목 서버. msw 3 에서 @mswjs/http-middleware 가 @msw/serve 로 바뀌었고,
// 독립 서버(createServer)가 있어 express 를 따로 띄울 필요가 없다.
import { createServer } from '@msw/serve';

import { handlers } from './handlers';

const port = 9090;

createServer(...handlers).listen(port, () =>
  console.log(`Mock server is running on port: ${port}`),
);
