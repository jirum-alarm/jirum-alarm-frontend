export default function ViewerCount({ count }: { count: number }) {
  return (
    <div className="bg-secondary-50 flex h-[44px] w-full items-center justify-center whitespace-nowrap">
      <span className="text-fg-secondary-strong text-sm">
        <strong className="text-secondary-500 font-semibold" suppressHydrationWarning>
          {count.toLocaleString('ko-kr')}명
        </strong>
        이 살펴본 상품
      </span>
    </div>
  );
}
