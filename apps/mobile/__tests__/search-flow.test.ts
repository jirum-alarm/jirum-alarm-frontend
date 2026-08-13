export {};

const {
  openSearch,
  goTabHome,
  isInSearchStack,
} = require('../src/shared/lib/navigation/search-flow');
const {
  searchStackNavigations,
  tabStackNavigations,
} = require('../src/shared/constant/navigations');

function nav(routeNames: string[], parent?: {popToTop: () => void}) {
  return {
    routeNames,
    navigate: jest.fn(),
    push: jest.fn(),
    popToTop: jest.fn(),
    getState: () => ({routeNames}),
    getParent: () => parent,
  };
}

describe('검색 플로우', () => {
  it('탭 스택에 있으면 검색 스택을 push 한다', () => {
    const n = nav(['TabRoot', 'ProductDetail', 'Search']);
    openSearch(n);
    expect(n.push).toHaveBeenCalledWith(tabStackNavigations.SEARCH);
    expect(n.navigate).not.toHaveBeenCalled();
  });

  it('검색 스택 안이면 검색 홈으로 돌아가고 새로 쌓지 않는다', () => {
    const n = nav(['SearchHome', 'ProductDetail']);
    expect(isInSearchStack(n)).toBe(true);
    openSearch(n);
    expect(n.navigate).toHaveBeenCalledWith(searchStackNavigations.HOME);
    expect(n.push).not.toHaveBeenCalled();
  });

  it('로고는 검색 스택이면 부모 탭 스택을 비운다', () => {
    const parent = {popToTop: jest.fn()};
    const n = nav(['SearchHome', 'ProductDetail'], parent);
    goTabHome(n);
    expect(parent.popToTop).toHaveBeenCalled();
    expect(n.popToTop).not.toHaveBeenCalled();
  });

  it('로고는 탭 스택이면 그 스택만 비운다', () => {
    const n = nav(['TabRoot', 'ProductDetail']);
    goTabHome(n);
    expect(n.popToTop).toHaveBeenCalled();
  });
});
