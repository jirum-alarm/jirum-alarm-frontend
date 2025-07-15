export default function ViewerCount({ count }: { count: number }) {
  return (
    <div className="flex h-[48px] w-full items-center justify-center whitespace-nowrap bg-secondary-50">
      <span className="text-sm text-gray-700">
        지금&nbsp;
        <strong className="font-semibold text-secondary-500">
          {count.toLocaleString('ko-kr')}명
        </strong>
        이 보고 있어요
      </span>
    </div>
  );
}
