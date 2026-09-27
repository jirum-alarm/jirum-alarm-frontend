import { useCallback, useState } from 'react';

import { useCancelVerification } from '@/hooks/graphql/verification';

import { UndoAction } from '../types';

const MAX_UNDO_STACK = 10;

/**
 * 검증 확정 액션의 실행 취소(Undo) 기능을 제공하는 훅
 *
 * - 최대 10개의 액션을 스택에 보관
 * - Ctrl+Z로 마지막 확정 액션을 취소
 * - cancelVerification mutation을 사용하여 서버에도 반영
 */
export function useUndoStack() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [isUndoing, setIsUndoing] = useState(false);
  const [cancelVerificationMutation] = useCancelVerification();

  const pushUndo = useCallback((action: UndoAction) => {
    setUndoStack((prev) => [...prev.slice(-(MAX_UNDO_STACK - 1)), action]);
  }, []);

  const undo = useCallback(async (): Promise<UndoAction | null> => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction || isUndoing) return null;

    setIsUndoing(true);
    try {
      // 승인/거절된 모든 항목의 검증을 취소
      const allIds = [...lastAction.approvedIds, ...lastAction.rejectedIds];

      await Promise.all(
        allIds.map((id) =>
          cancelVerificationMutation({
            variables: {
              productMappingId: parseInt(id),
              reason: '실행 취소',
            },
          }),
        ),
      );

      setUndoStack((prev) => prev.slice(0, -1));
      return lastAction;
    } catch (error) {
      console.error('Undo failed:', error);
      return null;
    } finally {
      setIsUndoing(false);
    }
  }, [undoStack, isUndoing, cancelVerificationMutation]);

  const clearStack = useCallback(() => {
    setUndoStack([]);
  }, []);

  return {
    pushUndo,
    undo,
    clearStack,
    canUndo: undoStack.length > 0 && !isUndoing,
    isUndoing,
    lastAction: undoStack[undoStack.length - 1] ?? null,
    stackSize: undoStack.length,
  };
}
