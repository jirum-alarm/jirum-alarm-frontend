import PermissionManager from './components/PermissionManager';

const PermissionPage = () => (
  <>
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xl font-semibold text-black dark:text-white sm:text-2xl">권한 관리</h2>
      <p className="mt-1 text-sm text-bodydark2">
        역할마다 볼 수 있는 섹션을 정하고 계정에 역할을 줍니다. 역할이 없는 계정은 어떤 메뉴도 볼 수
        없습니다. admin 역할만 이 화면을 씁니다.
      </p>
    </div>
    <PermissionManager />
  </>
);

export default PermissionPage;
