import { MypageKeyword } from '@/graphql/interface/keyword';

class MypageKeywordService {
  private keyword: MypageKeyword;
  private rearId: number;
  constructor() {
    this.keyword = {
      notificationKeywordsByMe: [
        {
          id: '0',
          keyword: '키워드 알림!',
        },
        {
          id: '1',
          keyword: '키워드 알림🔥',
        },
        {
          id: '2',
          keyword: '키워드 알리미',
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
    this.keyword.notificationKeywordsByMe.push({ id: String(++this.rearId), keyword });
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
