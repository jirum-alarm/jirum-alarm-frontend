'use client';

import { useEffect } from 'react';

interface KeyboardShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string[]; description: string }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: '탐색',
    shortcuts: [
      { keys: ['↑', '↓'], description: '항목 이동 (위/아래)' },
      { keys: ['←', '→'], description: '패널 전환 (좌측/우측)' },
      { keys: ['Space'], description: '브랜드 상품 확장/축소 (좌측 패널)' },
      { keys: ['Space'], description: '항목 선택/해제 (우측 패널)' },
    ],
  },
  {
    title: '검증 작업',
    shortcuts: [
      { keys: ['Enter'], description: '현재 선택 확정' },
      { keys: ['⌘/Ctrl', 'Enter'], description: '확정 후 다음 상품으로 이동' },
      { keys: ['Shift', 'A'], description: '전체 승인 (모두 선택)' },
      { keys: ['N'], description: '전체 거절 (모두 해제)' },
      { keys: ['⌘/Ctrl', 'Z'], description: '마지막 확정 실행 취소' },
    ],
  },
  {
    title: '보기',
    shortcuts: [
      { keys: ['I'], description: '이미지 비교 모달 열기' },
      { keys: ['?'], description: '단축키 도움말 (이 창)' },
      { keys: ['ESC'], description: '모달 닫기 / 검색창 나가기' },
    ],
  },
];

/**
 * #4: 키보드 단축키 도움말 모달
 *
 * `?` 키를 눌러 열 수 있는 오버레이로 전체 단축키 목록을 보여줍니다.
 */
const KeyboardShortcutModal = ({ isOpen, onClose }: KeyboardShortcutModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === '?') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-lg animate-[fadeIn_0.15s_ease-out] rounded-2xl bg-white shadow-2xl dark:bg-boxdark">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black dark:text-white">키보드 단축키</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm transition-colors dark:hover:bg-meta-4"
          >
            <kbd className="bg-gray-50 font-mono rounded border border-stroke px-1.5 py-0.5 text-xs dark:border-strokedark dark:bg-meta-4">
              ESC
            </kbd>
            <span>닫기</span>
          </button>
        </div>

        {/* Shortcut Groups */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {SHORTCUT_GROUPS.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? 'mt-5' : ''}>
              <h4 className="text-gray-500 dark:text-gray-400 mb-2 text-xs font-semibold uppercase tracking-wider">
                {group.title}
              </h4>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut, i) => (
                  <div
                    key={i}
                    className="hover:bg-gray-50 flex items-center justify-between rounded-lg px-2 py-2 transition-colors dark:hover:bg-meta-4"
                  >
                    <span className="text-sm text-black dark:text-white">
                      {shortcut.description}
                    </span>
                    <div className="ml-4 flex flex-shrink-0 items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          {keyIndex > 0 && (
                            <span className="text-gray-300 dark:text-gray-600 text-xs">+</span>
                          )}
                          <kbd className="bg-gray-50 font-mono inline-flex min-w-[28px] items-center justify-center rounded-md border border-stroke px-2 py-1 text-xs font-medium text-black shadow-sm dark:border-strokedark dark:bg-meta-4 dark:text-white">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-stroke px-6 py-3 dark:border-strokedark">
          <p className="text-gray-400 dark:text-gray-500 text-center text-xs">
            <kbd className="bg-gray-50 font-mono rounded border border-stroke px-1.5 py-0.5 text-xs dark:border-strokedark dark:bg-meta-4">
              ?
            </kbd>{' '}
            키를 눌러 이 도움말을 열거나 닫을 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutModal;
