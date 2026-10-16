import { atom } from 'jotai';

// 하단 고정 구매 바가 화면에 그려지지 않은 상품 id(cta-visibility 의 not_rendered). 그 상품 상세에서만
// 가격 아래 본문에 구매 버튼을 대신 보여 준다. 상품 id 로 들고 있어 다른 상세로 넘어가면 저절로 꺼진다.
export const bottomCtaMissingProductAtom = atom<number | null>(null);
