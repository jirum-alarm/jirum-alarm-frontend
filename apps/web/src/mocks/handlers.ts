import { INotification, Role } from '@/graphql/interface';
import { HttpResponse, graphql } from 'msw';
import * as keyword from './keyword';
const keywordHandlers = Object.values(keyword);

const QueryProducts = graphql.query('QueryProducts', () => {
  const product = (productId: number) => {
    const id = productId.toString();

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
    };
  };

  const products = Array.from({ length: 20 }, (_, index) => product(Date.now() + index));

  return HttpResponse.json({
    data: {
      products,
    },
  });
});

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
  ];

  return HttpResponse.json({
    data: {
      categories,
    },
  });
});

const QueryNotifications = graphql.query('QueryNotifications', () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('status') === 'no-alarm') {
    return HttpResponse.json({ data: { notifications: [] } });
  }

  const notifications = Array.from({ length: 10 }).flatMap((_, i) => [
    {
      id: (i * 3 + 1).toString(),
      groupId: 1,
      receiverId: 1,
      senderId: 2,
      senderType: Role.ADMIN,
      target: '1',
      targetId: '1',
      title: '[스파오공홈] 스파오 플리스 웜테크 경량자켓등 (24,900원~/무료)',
      message: '[스파오공홈] 스파오 플리스 (24,900원~/무료)',
      url: 'https://spao.com/category/%ED%94%8C%EB%A6%AC%EC%8A%A4%EB%8D%A4%EB%B8%94/219/',
      category: '1',
      createdAt: new Date(Date.now() - (i * 3 + 1) * 60 * 1000),
      readAt: new Date('2024-01-02'),
    },
    {
      id: (i * 3 + 2).toString(),
      groupId: 2,
      receiverId: 1,
      senderId: 2,
      senderType: Role.USER,
      target: '1',
      targetId: '1',
      title: '[G마켓] 하이샤파 기차모양 연필깎이 (19,490원/무배)',
      message: '[G마켓] 하이샤파 (19,490원/무배)',
      url: 'https://item.gmarket.co.kr/Item?goodscode=2175600050',
      category: '2',
      createdAt: new Date(Date.now() - (i * 3 + 2) * 60 * 1000),
      readAt: new Date('2024-01-02'),
    },
    {
      id: (i * 3 + 3).toString(),
      groupId: 2,
      receiverId: 1,
      senderId: 3,
      senderType: Role.USER,
      target: '1',
      targetId: '1',
      title: '[티몬] 삼성전자 갤럭시탭 S9 울트라 WIFI/5G (1,209,000원) (무료)',
      message: '[티몬] 삼성전자 갤럭시탭 (1,209,000원) (무료)',
      url: 'https://www.tmon.co.kr/deal/5481693990',
      category: '3',
      createdAt: new Date(Date.now() - (i * 3 + 3) * 60 * 1000),
      readAt: new Date(),
    },
  ]) as unknown as INotification[];

  return HttpResponse.json<{ data: { notifications: INotification[] } }>({
    data: { notifications },
  });
});

const QueryUnreadNotificationsCount = graphql.query('QueryUnreadNotificationsCount', () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('alarm-status') === 'no-alarm') {
    return HttpResponse.json({ data: { unreadNotificationsCount: 0 } });
  }

  return HttpResponse.json({
    data: {
      unreadNotificationsCount: 3,
    },
  });
});

const QueryMe = graphql.query('QueryMe', async () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get('me-status') === 'no-login') {
    return HttpResponse.json({ data: undefined });
  }

  return HttpResponse.json({
    data: {
      me: {
        id: 1,
        email: 'jirumalarm@gmail.com',
        nickname: '지름알림',
        birthYear: 1997,
        gender: 'MALE',
        favoriteCategories: [1, 2, 3],
      },
    },
  });
});

const MutationLogin = graphql.mutation('MutationLogin', () => {
  return HttpResponse.json({
    data: {
      login: {
        accessToken: 'AYjcyMzY3ZDhiNmJkNTY',
        refreshToken: 'RjY2NjM5NzA2OWJjuE7c',
      },
    },
  });
});

const MutationSignup = graphql.mutation('MutationSignup', () => {
  return HttpResponse.json({
    data: {
      signup: {
        accessToken: 'AYjcyMzY3ZDhiNmJkNTY',
        refreshToken: 'RjY2NjM5NzA2OWJjuE7c',
        user: {
          id: '1',
          email: 'jirumalarm@gmail.com',
          nickname: '지름알림',
          birthYear: 20020202.0,
          gender: 'FEMALE',
          favoriteCategories: [1, 2, 3],
          linkedSocialProviders: ['google'],
        },
      },
    },
  });
});

const MutationUpdateUserProfile = graphql.mutation('MutationUpdateUserProfile', () => {
  return HttpResponse.json({
    data: {
      updateUserProfile: true,
    },
  });
});

const MutationUpdatePassword = graphql.mutation('MutationUpdatePassword', () => {
  return HttpResponse.json({
    data: {
      updatePassword: true,
    },
  });
});

const MutationWithdraw = graphql.mutation('MutationWithdraw', () => {
  return HttpResponse.json({
    data: {
      withdraw: true,
    },
  });
});

const MutationAddPushToken = graphql.mutation('MutationAddPushToken', () => {
  return HttpResponse.json({
    data: {
      addPushToken: true,
    },
  });
});

// This funciton should be add handlers to last, if not can't mock apis
const Operation = graphql.operation(({ query, variables }) => {
  console.warn('[MSW] unhandled api found ', query, variables);

  return HttpResponse.json({ errors: [{ message: 'Request failed' }] });
});

export const handlers = [
  QueryProducts,
  QueryCategories,
  QueryNotifications,
  QueryUnreadNotificationsCount,
  QueryMe,
  MutationLogin,
  MutationSignup,
  MutationUpdateUserProfile,
  MutationUpdatePassword,
  MutationWithdraw,
  MutationAddPushToken,
  ...keywordHandlers,
  Operation,
];
