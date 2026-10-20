import {DealEvidenceKind} from '../src/shared/api/gql/graphql';
import {evidenceMoreTarget} from '../src/screens/detail/lib/evidence-target';

/**
 * 근거 블록 「근거 보기 ›」 — 내려갈 섹션이 그려져 위치를 알 때만 띄운다(web 과 같은 원칙).
 * 예전엔 가격 추이가 로딩 중·점 2개 미만·holdout 이라 안 그려져도 링크가 떠서 눌러도 아무 일이 없었다.
 */
describe('evidenceMoreTarget', () => {
  const none = {priceHistory: false, community: false};

  it('대상 섹션이 아직 안 그려졌으면 링크 없음', () => {
    expect(evidenceMoreTarget(DealEvidenceKind.History, none)).toBeNull();
    expect(evidenceMoreTarget(DealEvidenceKind.Community, none)).toBeNull();
  });

  it('그려진 섹션으로만', () => {
    const ready = {priceHistory: true, community: false};
    expect(evidenceMoreTarget(DealEvidenceKind.History, ready)).toBe(
      'priceHistory',
    );
    expect(evidenceMoreTarget(DealEvidenceKind.Community, ready)).toBeNull();
    expect(
      evidenceMoreTarget(DealEvidenceKind.Community, {
        priceHistory: false,
        community: true,
      }),
    ).toBe('community');
  });

  it('다나와(MARKET) 근거는 블록 안 숫자가 근거라 링크가 없다', () => {
    expect(
      evidenceMoreTarget(DealEvidenceKind.Market, {
        priceHistory: true,
        community: true,
      }),
    ).toBeNull();
  });
});
