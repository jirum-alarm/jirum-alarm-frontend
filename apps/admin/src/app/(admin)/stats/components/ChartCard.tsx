import Panel from '@/components/Panel';
import Spinner from '@/components/Spinner';

interface ChartCardProps {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
}

const ChartCard = ({ title, loading, children }: ChartCardProps) => {
  return (
    <Panel className="min-w-0 p-4 sm:p-6">
      <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">{title}</h3>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        children
      )}
    </Panel>
  );
};

export default ChartCard;
