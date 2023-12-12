import { HttpResponse, graphql } from 'msw'

const QueryProducts = graphql.query('QueryProducts', ({ query }) => {
  const product = {
    id: '39004',
    title: 'darkflash upmost 850w 80plus gold 풀모듈 atx3.0 화이트',
    mallid: null,
    url: 'https://coolenjoy.net/bbs/jirum/2573340',
    providerid: 2,
    provider: { nameKr: '쿨앤조이' },
    searchafter: ['39004'],
    postedAt: '2023-12-11t15:58:25.000z',
  }

  const products = Array.from({ length: 20 }, () => JSON.parse(JSON.stringify(product)))

  return HttpResponse.json({
    data: {
      products,
    },
  })
})

export const handlers = [QueryProducts]
