import {deriveKeyword as nativeDerive} from '../src/features/keyword-prompt/model/deriveKeyword';
import {deriveKeyword as webDerive} from '../../web/src/features/product-detail/lib/deriveKeyword';

// 상세의 「또 뜨면 알려드릴까요」가 등록하는 키워드. 웹과 앱이 같은 제목에서 다른 키워드를 뽑으면
// 같은 상품인데 플랫폼에 따라 알림이 오고 안 오고가 갈린다. 규칙 테스트는 web 쪽(deriveKeyword.test.ts)에 있다.
const TITLES: string[] = [
  '[지마켓] 다이슨 V15 무선청소기',
  '하루특가) 돌쇠네 수제 떡갈비, 120g, 10팩',
  '티멤) [삼다수] 무라벨 2L, 12개 (9,080원/무료)',
  '🔥인기 [지마켓] 웍스 WORX WX242 드라이버',
  '(무료) Modular Animal Knight Polyart',
  '9/4 네이버포인트',
  '종료된 행사입니다.',
  '펩시제로 210ml 30캔 +사이다제로 210ml 30캔',
  'Rocoren 5,000mAh 자기식 보조배터리',
  'm.2 SSD 1TB',
  '1++ 한우',
];

describe('deriveKeyword — web·앱 같은 결과', () => {
  it.each(TITLES)('%s', (title: string) => {
    expect(nativeDerive(title)).toBe(webDerive(title));
  });
});
