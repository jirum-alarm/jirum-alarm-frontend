export default function ViewerCount({ count }: { count: number }) {
  return (
    <div className="bg-secondary-50 flex h-[48px] w-full items-center justify-center whitespace-nowrap">
      <span className="text-sm text-gray-700">
        지금&nbsp;
        <strong className="text-secondary-500 font-semibold">
          {count.toLocaleString('ko-kr')}명
        </strong>
        이 보고 있어요
      </span>
    </div>
  );
}
