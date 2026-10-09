import NotificationHistory from './components/NotificationHistory';
import NotificationSender from './components/NotificationSender';

const NotificationPage = async () => {
  return (
    <>
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl font-semibold text-black sm:text-2xl dark:text-white">알림 관리</h2>
      </div>
      <div className="flex flex-col gap-6">
        <NotificationSender />
        <NotificationHistory />
      </div>
    </>
  );
};

export default NotificationPage;
