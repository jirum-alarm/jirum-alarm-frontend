import { warn } from 'console'
import { HttpResponse, graphql, http } from 'msw'

const QueryProducts = graphql.query('QueryProducts', () => {
  const product = (productId: number) => {
    const id = productId.toString()

    return {
      id,
      title: 'darkflash upmost 850w 80plus gold 풀모듈 atx3.0 화이트',
      mallId: null,
      url: 'https://coolenjoy.net/bbs/jirum/2573340',
      providerId: 2,
      provider: { nameKr: '쿨앤조이' },
      category: 'PC관련',
      categoryId: 1,
      searchAfter: [id],
      thumbnail: null,
      postedAt: '2023-12-11t15:58:25.000z',
    }
  }

  const products = Array.from({ length: 20 }, (_, index) => product(Date.now() + index))

  return HttpResponse.json({
    data: {
      products,
    },
  })
})

const QueryCategories = graphql.query('QueryCategories', () => {
  const categories = [
    {
      id: '1',
      name: '컴퓨터',
    },
    {
      id: '2',
      name: '생활/식품',
    },
    {
      id: '3',
      name: '화장품',
    },
    {
      id: '4',
      name: '의류/잡화',
    },
    {
      id: '5',
      name: '도서',
    },
    {
      id: '6',
      name: '가전/가구',
    },
    {
      id: '7',
      name: '등산/레저',
    },
    {
      id: '8',
      name: '상품권',
    },
    {
      id: '9',
      name: '디지털',
    },
    {
      id: '10',
      name: '육아',
    },
    {
      id: '11',
      name: '기타',
    },
  ]

  return HttpResponse.json({
    data: {
      categories,
    },
  })
})

const QueryMe = graphql.query('QueryMe', () => {
  return HttpResponse.json({
    data: {
      me: {
        id: 1,
        email: 'jirumalarm@gmail.com',
        nickname: '지름알림',
      },
    },
  })
})

// This funciton should be add handlers to last, if not can't mock apis
const Operation = graphql.operation(({ query, variables }) => {
  console.warn('[MSW] unhandled api found ', query, variables)

  return HttpResponse.json({ errors: [{ message: 'Request failed' }] })
})

export const handlers = [QueryProducts, QueryCategories, QueryMe, Operation]
