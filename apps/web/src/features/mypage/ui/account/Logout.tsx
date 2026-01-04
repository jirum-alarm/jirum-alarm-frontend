import { useLogout } from '@/shared/hooks/useLogout';
import AlertDialog from '@/shared/ui/AlertDialog';
import Button from '@/shared/ui/Button';

const Logout = () => {
  const logout = useLogout();
  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <button className="px-6 py-3 text-[13px] text-gray-500">로그아웃</button>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title className="pt-3 font-semibold text-gray-900">
            로그아웃
          </AlertDialog.Title>
          <AlertDialog.Description>
            <p className="text-gray-700">
              로그아웃 시 알림을 받을 수 없어요.
              <br />
              지름알림에서 <span className="font-semibold">로그아웃</span>
              할까요?
            </p>
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button color="secondary">취소</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild onClick={logout}>
            <Button color="error">로그아웃</Button>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

export default Logout;
