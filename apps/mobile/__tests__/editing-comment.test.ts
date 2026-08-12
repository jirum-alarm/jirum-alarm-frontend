export {};

const {
  setReplyTarget,
  setUpdateTarget,
  clearEditingComment,
  getEditingComment,
  subscribeEditingComment,
} = require('../src/entities/comment/editing-comment');

const comment = (id: number) =>
  ({id: String(id), content: `내용 ${id}`} as never);

/**
 * web 의 document.dispatchEvent 3종(cancel/reply/update)을 대체한 스토어.
 * 그 이벤트들이 실제로 하던 일이 이 값 하나를 set 하는 것뿐이었다.
 */
describe('editingComment 스토어', () => {
  beforeEach(() => clearEditingComment());

  it('기본값은 null', () => {
    expect(getEditingComment()).toBeNull();
  });

  it('답글/수정 대상을 status 와 함께 담는다', () => {
    setReplyTarget(comment(1));
    expect(getEditingComment()).toEqual({
      comment: {id: '1', content: '내용 1'},
      status: 'reply',
    });

    setUpdateTarget(comment(2));
    expect(getEditingComment()).toEqual({
      comment: {id: '2', content: '내용 2'},
      status: 'update',
    });
  });

  it('clear 하면 null 로 돌아간다', () => {
    setReplyTarget(comment(1));
    clearEditingComment();
    expect(getEditingComment()).toBeNull();
  });

  it('변경 시 구독자에게 알린다', () => {
    let calls = 0;
    const unsub = subscribeEditingComment(() => {
      calls++;
    });

    setReplyTarget(comment(1));
    setUpdateTarget(comment(1));
    clearEditingComment();
    expect(calls).toBe(3);

    unsub();
    setReplyTarget(comment(2));
    expect(calls).toBe(3); // 구독 해제 후에는 안 온다
  });

  // 이미 null 인데 또 알리면 useSyncExternalStore 가 불필요하게 리렌더한다.
  it('이미 비어 있으면 clear 가 알리지 않는다', () => {
    let calls = 0;
    const unsub = subscribeEditingComment(() => {
      calls++;
    });
    clearEditingComment();
    expect(calls).toBe(0);
    unsub();
  });
});
