'use client';

import { useCallback, useRef, useState } from 'react';

import { useConfirm } from '@/components/Confirm';
import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { NotificationTarget, NotificationType } from '@/generated/gql/graphql';
import { useSendNotificationByAdmin } from '@/hooks/graphql/notification';
import { useGetUsersByAdmin, UserListItem } from '@/hooks/graphql/user';

const NOTIFICATION_TYPES = [
  { value: 'NOTIFICATION_CENTER_AND_PUSH', label: '알림센터 + 푸시' },
  { value: 'PUSH_ONLY', label: '푸시만' },
  { value: 'NOTIFICATION_CENTER_ONLY', label: '알림센터만' },
];

const NOTIFICATION_TARGETS = [
  { value: '', label: '전체' },
  { value: 'PRODUCT', label: '상품' },
  { value: 'NOTICE', label: '공지' },
  { value: 'INFO', label: '정보' },
];

type RecipientMode = 'all' | 'specific';

const SERVICE_ORIGIN = 'https://jirum-alarm.com';

// 서버 url 은 @IsUrl() — '/products/1' 같은 상대경로는 Bad Request 다.
// 상대경로는 서비스 도메인을 붙여 절대 URL 로 보내고, 그 밖엔 http(s) 절대 URL 만 통과시킨다.
const normalizeNotificationUrl = (raw: string): { url?: string; error?: string } => {
  const value = raw.trim();
  if (!value) return {};
  const candidate = value.startsWith('/') ? `${SERVICE_ORIGIN}${value}` : value;
  try {
    const parsed = new URL(candidate);
    // @IsUrl 은 TLD 를 요구한다(localhost 등 불가)
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname.includes('.')) {
      throw new Error();
    }
    return { url: candidate };
  } catch {
    return { error: 'https:// 로 시작하는 주소나 /products/123 같은 경로를 입력해주세요.' };
  }
};

interface SelectedUser {
  id: string;
  email: string;
  nickname?: string | null;
}

const NotificationSender = () => {
  const confirm = useConfirm();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('NOTIFICATION_CENTER_AND_PUSH');
  const [target, setTarget] = useState('');
  const [url, setUrl] = useState('');
  const [targetId, setTargetId] = useState('');
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  const { data: userData, loading: userSearchLoading } = useGetUsersByAdmin(
    { keyword: debouncedKeyword, limit: 10 },
    { skip: !debouncedKeyword || recipientMode !== 'specific' },
  );

  const searchResults = userData?.usersByAdmin ?? [];

  const handleUserSearchChange = useCallback((value: string) => {
    setUserSearchKeyword(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedKeyword(value.trim());
      if (value.trim()) setShowUserDropdown(true);
    }, 300);
  }, []);

  const addUser = (user: UserListItem) => {
    if (!selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [
        ...prev,
        { id: user.id, email: user.email, nickname: user.nickname },
      ]);
    }
    setUserSearchKeyword('');
    setDebouncedKeyword('');
    setShowUserDropdown(false);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const [sendNotification, { loading }] = useSendNotificationByAdmin({
    onCompleted: () => {
      toast.success('알림이 발송되었습니다.');
      setTitle('');
      setMessage('');
      setUrl('');
      setTargetId('');
      setSelectedUsers([]);
      setRecipientMode('all');
    },
    onError: (error) => {
      toast.error(`발송 실패: ${error.message}`);
    },
  });

  const normalizedUrl = normalizeNotificationUrl(url);
  // 전체 발송은 NOTICE 토픽으로만 가서 서버가 target·targetId 를 버린다(admin.service).
  const usesTarget = recipientMode === 'specific';
  // 특정 사용자 + 상품이면 targetId 로 알림센터에 상품 카드·상세 링크가 붙는다(없으면 링크 없음).
  const needsTargetId = usesTarget && target === 'PRODUCT';
  const parsedTargetId = Number(targetId);
  const targetIdError =
    needsTargetId && !(Number.isInteger(parsedTargetId) && parsedTargetId > 0)
      ? '상품 ID(숫자)를 입력해주세요.'
      : undefined;

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('제목과 메시지를 입력해주세요.');
      return;
    }
    if (recipientMode === 'specific' && selectedUsers.length === 0) {
      toast.error('수신 대상 사용자를 선택해주세요.');
      return;
    }
    if (normalizedUrl.error || targetIdError) {
      toast.error(normalizedUrl.error ?? targetIdError ?? '입력값을 확인해주세요.');
      return;
    }

    const userCount = recipientMode === 'specific' ? `${selectedUsers.length}명` : '전체 사용자';
    if (!(await confirm({ message: `${userCount}에게 알림을 발송하시겠습니까?` }))) return;

    sendNotification({
      variables: {
        title: title.trim(),
        message: message.trim(),
        type: type as NotificationType,
        target: usesTarget ? ((target || undefined) as NotificationTarget | undefined) : undefined,
        targetId: needsTargetId ? parsedTargetId : undefined,
        url: normalizedUrl.url,
        userIds: recipientMode === 'specific' ? selectedUsers.map((u) => Number(u.id)) : undefined,
      },
    });
  };

  return (
    <Panel className="p-6">
      <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">알림 발송</h3>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            제목 *
          </label>
          <input
            type="text"
            placeholder="알림 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            메시지 *
          </label>
          <textarea
            placeholder="알림 내용"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              발송 방식
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {NOTIFICATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              카테고리
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              disabled={!usesTarget}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {NOTIFICATION_TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {!usesTarget && (
              <p className="mt-1 text-xs text-bodydark2">
                전체 발송은 공지 토픽으로 가서 카테고리가 적용되지 않습니다.
              </p>
            )}
          </div>
        </div>

        {/* 수신 대상 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            수신 대상 *
          </label>
          <div className="mb-3 flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-black dark:text-white">
              <input
                type="radio"
                name="recipientMode"
                value="all"
                checked={recipientMode === 'all'}
                onChange={() => {
                  setRecipientMode('all');
                  setSelectedUsers([]);
                }}
                className="h-4 w-4 accent-primary"
              />
              전체 사용자
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-black dark:text-white">
              <input
                type="radio"
                name="recipientMode"
                value="specific"
                checked={recipientMode === 'specific'}
                onChange={() => setRecipientMode('specific')}
                className="h-4 w-4 accent-primary"
              />
              특정 사용자
            </label>
          </div>

          {recipientMode === 'specific' && (
            <div>
              {/* 선택된 사용자 태그 */}
              {selectedUsers.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                      {user.nickname || user.email}
                      <button
                        type="button"
                        onClick={() => removeUser(user.id)}
                        className="ml-0.5 text-primary hover:text-primary/70"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 사용자 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="이메일 또는 닉네임으로 검색"
                  value={userSearchKeyword}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                  onFocus={() => {
                    if (debouncedKeyword) setShowUserDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowUserDropdown(false), 200);
                  }}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />

                {showUserDropdown && debouncedKeyword && (
                  <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
                    {userSearchLoading ? (
                      <div className="px-4 py-3 text-center text-sm text-bodydark2">검색 중...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-center text-sm text-bodydark2">
                        검색 결과가 없습니다.
                      </div>
                    ) : (
                      searchResults.map((user) => {
                        const isSelected = selectedUsers.some((u) => u.id === user.id);
                        return (
                          <button
                            key={user.id}
                            type="button"
                            disabled={isSelected}
                            onClick={() => addUser(user)}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-gray-2 dark:hover:bg-meta-4 ${
                              isSelected ? 'opacity-50' : ''
                            }`}
                          >
                            <div>
                              <span className="font-medium text-black dark:text-white">
                                {user.nickname || '-'}
                              </span>
                              <span className="ml-2 text-bodydark2">{user.email}</span>
                            </div>
                            {isSelected && <span className="text-xs text-primary">선택됨</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {selectedUsers.length > 0 && (
                <p className="mt-1.5 text-xs text-bodydark2">{selectedUsers.length}명 선택됨</p>
              )}
            </div>
          )}
        </div>

        {needsTargetId && (
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              상품 ID *
            </label>
            <input
              type="number"
              min={1}
              placeholder="알림센터에 붙일 상품 ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {targetId && targetIdError && (
              <p className="mt-1 text-xs text-danger">{targetIdError}</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            링크 URL (선택)
          </label>
          <input
            type="text"
            placeholder="https://jirum-alarm.com/... 또는 /products/123"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            maxLength={1024}
            aria-invalid={!!normalizedUrl.error}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
          {normalizedUrl.error ? (
            <p className="mt-1 text-xs text-danger">{normalizedUrl.error}</p>
          ) : (
            normalizedUrl.url &&
            normalizedUrl.url !== url.trim() && (
              <p className="mt-1 text-xs text-bodydark2">{normalizedUrl.url} 로 발송됩니다.</p>
            )
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:bg-opacity-60"
          >
            {loading && <Spinner size="sm" color="white" />}
            발송
          </button>
        </div>
      </div>
    </Panel>
  );
};

export default NotificationSender;
