import { Hotdeal } from '@/components/common/icons';
import Link from '@/features/Link';
import { INotification } from '@/graphql/interface';
import { displayTime } from '@/util/displayTime';

const AlarmItem = ({ notification }: { notification: INotification }) => {
  return (
    <li className="flex gap-x-3 p-5">
      <div>
        <Hotdeal />
      </div>
      <Link href={notification.url ?? ''}>
        <p className="text-sm">{notification.title}</p>
        <span className="text-xs text-gray-400">{displayTime(notification.createdAt)}</span>
      </Link>
    </li>
  );
};

export default AlarmItem;
