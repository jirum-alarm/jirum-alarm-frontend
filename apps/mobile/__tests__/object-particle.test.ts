import {objectParticle} from '../src/shared/components/SectionErrorRow';

it('받침에 따라 을/를을 고른다', () => {
  expect(objectParticle('커뮤니티')).toBe('를');
  expect(objectParticle('가격 추이')).toBe('를');
  expect(objectParticle('검색 결과')).toBe('를');
  expect(objectParticle('알림')).toBe('을');
  expect(objectParticle('관심 카테고리')).toBe('를');
  expect(objectParticle('내 정보')).toBe('를');
  expect(objectParticle('키워드')).toBe('를');
  expect(objectParticle('TOP10')).toBe('을(를)');
});
