interface ChartCardProps {
  title: string;
  loading?: boolean;
  children: React.ReactNode;
}

const ChartCard = ({ title, loading, children }: ChartCardProps) => {
  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">{title}</h3>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default ChartCard;
