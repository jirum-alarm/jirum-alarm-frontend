import AlertDialog from '@/components/common/AlertDialog';
import Button from '@/components/common/Button';
import { useToast } from '@/components/common/Toast';
import { MutationWithdraw } from '@/graphql/auth';
import { StorageTokenKey } from '@/types/enum/auth';
import { useMutation } from '@apollo/client';
import React from 'react';

const DeleteAccount = () => {
  const { toast } = useToast();
  const [deleteAccount] = useMutation<unknown, { password: string }>(MutationWithdraw, {
    onCompleted: () => {
      localStorage.removeItem(StorageTokenKey.ACCESS_TOKEN);
      localStorage.removeItem(StorageTokenKey.REFRESH_TOKEN);
      window.location.href = '/';
    },
    onError: () => {
      toast('회원탈퇴가 실패했어요. 다시 시도해주세요.');
    },
  });
  const onDeleteAccount = () => {
    deleteAccount();
  };
  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <button className="px-6 py-3 text-[13px] text-gray-500">회원탈퇴</button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title className="pt-3 font-semibold text-gray-900">
            회원탈퇴
          </AlertDialog.Title>
          <AlertDialog.Description>
            <p className="text-gray-700">
              회원탈퇴 시 모든 계정 정보가 삭제돼요.
              <br />
              지름알림에서 <span className="font-semibold">회원탈퇴</span>할까요?
            </p>
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button color="secondary">취소</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild onClick={onDeleteAccount}>
            <Button color="error">회원탈퇴</Button>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

export default DeleteAccount;
