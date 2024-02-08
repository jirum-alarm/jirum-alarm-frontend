import { HttpResponse, graphql } from 'msw';
import { mypageKeyword } from './service';

const QueryMypageKeyword = graphql.query('QueryMypageKeyword', async () => {
  return HttpResponse.json({
    data: mypageKeyword.get(),
  });
});

const MutationRemoveNotificationKeyword = graphql.mutation(
  'MutationRemoveNotificationKeyword',
  ({ variables }) => {
    mypageKeyword.remove(variables.id);
    return HttpResponse.json({
      data: {
        removeNotificationKeyword: true,
      },
    });
  },
);

const MutationAddNotificationKeyword = graphql.mutation(
  'MutationAddNotificationKeyword',
  ({ variables }) => {
    const isSuccess = mypageKeyword.add(variables.keyword);
    if (isSuccess) {
      return HttpResponse.json({
        data: {
          removeNotificationKeyword: true,
        },
      });
    }
    return HttpResponse.json({
      data: null,
      errors: [
        {
          extensions: {
            code: 'BAD_USER_INPUT',
            response: {
              error: 'Bad Request',
              message: '이미 등록된 키워드 알림입니다.',
              statusCode: 400,
            },
          },
          message: '이미 등록된 키워드 알림입니다.',
        },
      ],
    });
  },
);

export { QueryMypageKeyword, MutationRemoveNotificationKeyword, MutationAddNotificationKeyword };
