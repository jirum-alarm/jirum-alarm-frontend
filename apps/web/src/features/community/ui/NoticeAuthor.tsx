import { RoundedLogo } from '@/shared/ui/common/icons';

// 공지글 작성자 표시 — 개인 닉네임 대신 공식 계정(로고 + 지름알림)으로 보여준다.
export default function NoticeAuthor({ size = 20 }: { size?: number }) {
  return (
    <span className="flex items-center gap-x-1.5">
      <RoundedLogo size={size} className="rounded-full ring-1 ring-gray-200" />
      <span className="text-sm font-semibold text-gray-900">지름알림</span>
    </span>
  );
}
