import Card from '@/components/Card';

interface Props {
  name: string;
  description?: string;
}

const GroupDetailInfo = ({ name, description }: Props) => {
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <div>
          <span className="text-sm font-medium text-slate-500">그룹 이름</span>
          <h3 className="text-xl font-bold text-black dark:text-white">{name}</h3>
        </div>
        {description && (
          <div>
            <span className="text-sm font-medium text-slate-500">설명</span>
            <p className="text-black dark:text-white">{description}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupDetailInfo;
