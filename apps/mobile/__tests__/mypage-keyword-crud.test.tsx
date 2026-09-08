export {};

/**
 * 키워드 CRUD — **쓰기 흐름을 실행해서** 계약을 못박는다.
 *
 * 목록에서 지우고(낙관적) 실패하면 되돌리는 흐름은 타입도 소스텍스트도 못 본다.
 * 되돌리기가 빠지면 "삭제 실패했는데 목록에선 사라진" 상태가 되고, 다음 진입에
 * 되살아나서 유저는 "지웠는데 왜 또 있냐"로 읽는다.
 */

import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {show: jest.fn()},
}));

jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: jest.fn(() => Promise.resolve(null)),
  setAsyncStorage: jest.fn(() => Promise.resolve()),
  removeAsyncStorage: jest.fn(() => Promise.resolve()),
}));

import {MyPageService} from '../src/shared/api/mypage';
import {useKeywordViewModel} from '../src/features/mypage/model/useKeywordViewModel';

type ViewModel = ReturnType<typeof useKeywordViewModel>;

const INITIAL = [
  {id: '1', keyword: '램', priceDropOnly: false},
  {id: '2', keyword: '닌텐도', priceDropOnly: true},
];

let latest: ViewModel | undefined;

function Consumer() {
  latest = useKeywordViewModel();
  return null;
}

/**
 * ⚠️`await Promise.resolve()`(마이크로태스크)만으로는 react-query 가 못 끝난다 —
 * 실제로 그렇게 짰다가 조회 결과가 영영 안 들어와서 헛돌았다. 매크로태스크로 넘긴다.
 */
const flush = async (cycles = 4) => {
  for (let i = 0; i < cycles; i += 1) {
    // ⚠️`setTimeout(resolve, 0)` 로 바로 넘기면 tsc 가 거부한다(resolve 는 인자를
    // 받고 setTimeout 콜백은 0-arity) — jest 는 통과하는데 tsc 가 죽는 자리다.
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  }
};

let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
let client: QueryClient | undefined;

async function render() {
  // gcTime: Infinity — 기본값(5분)이면 GC 타이머가 남아 jest 가 안 끝난다.
  client = new QueryClient({
    defaultOptions: {
      queries: {retry: false, gcTime: Infinity},
      mutations: {retry: false, gcTime: Infinity},
    },
  });
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(
      <QueryClientProvider client={client as QueryClient}>
        <Consumer />
      </QueryClientProvider>,
    );
    await flush();
  });
  // ★한 번 더 — 첫 act 만으로는 조회 결과가 화면에 반영되기 전에 빠져나온다.
  await ReactTestRenderer.act(async () => {
    await flush();
  });
  return client;
}

afterEach(async () => {
  // act 밖에서 unmount 하면 React 가 경고를 찍는다(테스트는 통과하지만 시끄럽다).
  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
  renderer = undefined;
  client?.clear();
  client = undefined;
});

const keywordsOf = () => (latest?.keywords ?? []).map(k => k.keyword);

describe('키워드 목록 · 입력 검증', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latest = undefined;
    jest
      .spyOn(MyPageService, 'getMyKeywords')
      .mockResolvedValue(INITIAL.map(k => ({...k})));
  });

  it('20개 상한으로 조회한다(web KeywordList 의 n/20 과 같은 값)', async () => {
    await render();
    expect(MyPageService.getMyKeywords).toHaveBeenCalledWith(20);
    expect(keywordsOf()).toEqual(['램', '닌텐도']);
  });

  it('규칙에 안 맞는 입력은 등록 버튼이 안 열린다', async () => {
    await render();
    await ReactTestRenderer.act(async () => {
      latest?.handleChange('가');
    });
    expect(latest?.error).toBe(true);
    expect(latest?.canSubmit).toBe(false);

    await ReactTestRenderer.act(async () => {
      latest?.handleChange('갤럭시');
    });
    expect(latest?.error).toBe(false);
    expect(latest?.canSubmit).toBe(true);
  });

  it('등록되면 입력창을 비운다(web useKeywordInput.onSuccess: reset)', async () => {
    const add = jest
      .spyOn(MyPageService, 'addKeyword')
      .mockResolvedValue({addNotificationKeyword: true} as never);

    await render();
    await ReactTestRenderer.act(async () => {
      latest?.handleChange('  갤럭시  ');
    });
    await ReactTestRenderer.act(async () => {
      latest?.submit();
      await flush();
    });

    // ★앞뒤 공백을 떼서 보낸다. 안 떼면 서버에 ' 갤럭시 ' 가 들어가 매칭이 안 된다.
    // (react-query 가 mutationFn 에 두 번째 인자로 context 를 넘기므로 첫 인자만 본다)
    expect(add.mock.calls[0][0]).toEqual({keyword: '갤럭시'});
    expect(latest?.value).toBe('');
  });

  it('규칙 위반 상태에서 submit 해도 요청이 안 나간다', async () => {
    const add = jest.spyOn(MyPageService, 'addKeyword');
    await render();
    await ReactTestRenderer.act(async () => {
      latest?.handleChange('가');
    });
    await ReactTestRenderer.act(async () => {
      latest?.submit();
      await flush();
    });
    expect(add).not.toHaveBeenCalled();
  });
});

describe('삭제 — 낙관적 업데이트와 롤백', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latest = undefined;
    jest
      .spyOn(MyPageService, 'getMyKeywords')
      .mockResolvedValue(INITIAL.map(k => ({...k})));
  });

  it('누르는 즉시 목록에서 사라진다', async () => {
    let resolveDelete: (value: unknown) => void = () => {};
    jest
      .spyOn(MyPageService, 'removeKeyword')
      .mockImplementation(
        () => new Promise(resolve => (resolveDelete = resolve)) as never,
      );

    await render();
    await ReactTestRenderer.act(async () => {
      latest?.removeKeyword('1');
      await flush();
    });
    // 서버 응답이 아직 안 왔는데도 목록에서 빠져 있어야 한다.
    expect(keywordsOf()).toEqual(['닌텐도']);

    await ReactTestRenderer.act(async () => {
      resolveDelete({removeNotificationKeyword: true});
      await flush();
    });
  });

  /**
   * ★★처음엔 조회 mock 이 항상 성공하게 두고 이걸 썼는데, **롤백을 지워도
   * 통과했다**(되돌려 실패시키는 확인에서 걸렸다) — `onSettled` 의 재조회가
   * 목록을 되살려서 롤백이 있는지 없는지 구분이 안 됐다.
   * 실제 상황도 같다: 네트워크가 끊겼으면 재조회도 실패하므로 **롤백만이
   * 목록을 되살린다.** 그래서 첫 조회만 성공시키고 이후 재조회를 실패시킨다.
   */
  it('★실패하면 되돌린다 (재조회도 실패하는 상황)', async () => {
    (MyPageService.getMyKeywords as jest.Mock).mockReset();
    (MyPageService.getMyKeywords as jest.Mock)
      .mockResolvedValueOnce(INITIAL.map(k => ({...k})))
      .mockRejectedValue(new Error('offline'));
    jest
      .spyOn(MyPageService, 'removeKeyword')
      .mockRejectedValue(new Error('boom'));

    await render();
    expect(keywordsOf()).toEqual(['램', '닌텐도']);

    await ReactTestRenderer.act(async () => {
      latest?.removeKeyword('1');
      await flush(20);
    });

    expect(keywordsOf()).toEqual(['램', '닌텐도']);
  });

  it('id 를 숫자로 보낸다(스키마가 Float! 이다 — 문자열이면 서버가 거절)', async () => {
    const remove = jest
      .spyOn(MyPageService, 'removeKeyword')
      .mockResolvedValue({removeNotificationKeyword: true} as never);

    await render();
    await ReactTestRenderer.act(async () => {
      latest?.removeKeyword('2');
      await flush();
    });
    expect(remove.mock.calls[0][0]).toEqual({id: 2});
  });
});

describe('가격 하락 알림 토글 — 키워드 단위', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latest = undefined;
    jest
      .spyOn(MyPageService, 'getMyKeywords')
      .mockResolvedValue(INITIAL.map(k => ({...k})));
  });

  it('누른 키워드만 즉시 바뀐다(유저 전역 설정이 아니다)', async () => {
    let resolveToggle: (value: unknown) => void = () => {};
    jest
      .spyOn(MyPageService, 'updateKeywordPriceDropOnly')
      .mockImplementation(
        () => new Promise(resolve => (resolveToggle = resolve)) as never,
      );

    await render();
    await ReactTestRenderer.act(async () => {
      latest?.updatePriceDropOnly('1', true);
      await flush();
    });

    expect(
      (latest?.keywords ?? []).map(k => [k.keyword, k.priceDropOnly]),
    ).toEqual([
      ['램', true],
      ['닌텐도', true],
    ]);

    await ReactTestRenderer.act(async () => {
      resolveToggle({updateNotificationKeywordPriceDropOnly: true});
      await flush();
    });
  });

  /** 위 삭제 롤백과 같은 이유로 재조회도 실패시킨다. */
  it('★실패하면 되돌린다 (재조회도 실패하는 상황)', async () => {
    (MyPageService.getMyKeywords as jest.Mock).mockReset();
    (MyPageService.getMyKeywords as jest.Mock)
      .mockResolvedValueOnce(INITIAL.map(k => ({...k})))
      .mockRejectedValue(new Error('offline'));
    jest
      .spyOn(MyPageService, 'updateKeywordPriceDropOnly')
      .mockRejectedValue(new Error('boom'));

    await render();
    await ReactTestRenderer.act(async () => {
      latest?.updatePriceDropOnly('2', false);
      await flush(20);
    });

    expect(
      (latest?.keywords ?? []).map(k => [k.keyword, k.priceDropOnly]),
    ).toEqual([
      ['램', false],
      ['닌텐도', true],
    ]);
  });
});
