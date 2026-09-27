import UserListTable from './components/UserListTable';

const UserListPage = async () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-black dark:text-white">사용자 관리</h2>
      </div>
      <UserListTable />
    </>
  );
};

export default UserListPage;
