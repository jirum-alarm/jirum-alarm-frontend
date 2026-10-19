import { type QueryMypageKeywordQuery } from '@/shared/api/gql/graphql';

class MypageKeywordService {
  private keyword: QueryMypageKeywordQuery;
  private rearId: number;
  constructor() {
    this.keyword = {
      notificationKeywordsByMe: [
        {
          id: '0',
          keyword: '키워드 알림!',
          priceDropOnly: false,
        },
        {
          id: '1',
          keyword: '키워드 알림🔥',
          priceDropOnly: false,
        },
        {
          id: '2',
          keyword: '키워드 알리미',
          priceDropOnly: false,
        },
      ],
    };
    this.rearId = 2;
  }

  public get() {
    return this.keyword;
  }

  public add(keyword: string) {
    if (
      this.keyword.notificationKeywordsByMe.some((notikeyword) => notikeyword.keyword === keyword)
    ) {
      return false;
    }
    this.keyword.notificationKeywordsByMe.push({
      id: String(++this.rearId),
      keyword,
      priceDropOnly: false,
    });
    return true;
  }

  public remove(id: number) {
    const removeIndex = this.keyword.notificationKeywordsByMe.findIndex(
      (keyword) => id === Number(keyword.id),
    );
    this.keyword.notificationKeywordsByMe.splice(removeIndex, 1);
  }
}

const mypageKeyword = new MypageKeywordService();
export { mypageKeyword };
