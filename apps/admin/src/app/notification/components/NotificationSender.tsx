'use client';

import { useCallback, useRef, useState } from 'react';

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

interface SelectedUser {
  id: number;
  email: string;
  nickname: string;
}

const NotificationSender = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('NOTIFICATION_CENTER_AND_PUSH');
  const [target, setTarget] = useState('');
  const [url, setUrl] = useState('');
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

  const removeUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const [sendNotification, { loading }] = useSendNotificationByAdmin({
    onCompleted: () => {
      alert('알림이 발송되었습니다.');
      setTitle('');
      setMessage('');
      setUrl('');
      setSelectedUsers([]);
      setRecipientMode('all');
    },
    onError: (error) => {
      alert(`발송 실패: ${error.message}`);
    },
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert('제목과 메시지를 입력해주세요.');
      return;
    }
    if (recipientMode === 'specific' && selectedUsers.length === 0) {
      alert('수신 대상 사용자를 선택해주세요.');
      return;
    }

    const userCount = recipientMode === 'specific' ? `${selectedUsers.length}명` : '전체 사용자';
    if (!confirm(`${userCount}에게 알림을 발송하시겠습니까?`)) return;

    sendNotification({
      variables: {
        title: title.trim(),
        message: message.trim(),
        type,
        target: target || undefined,
        url: url.trim() || undefined,
        userIds: recipientMode === 'specific' ? selectedUsers.map((u) => Number(u.id)) : undefined,
      },
    });
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
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
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {NOTIFICATION_TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
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

        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            링크 URL (선택)
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 disabled:bg-opacity-60"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            발송
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSender;
