'use client';

import { Share } from '@/components/common/icons';
import { useToast } from '@/components/common/Toast';
import { EVENT } from '@/constants/mixpanel';

const ShareButton = ({ title, page }: { title: string; page?: keyof typeof EVENT.PAGE }) => {
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SHARE.NAME, {
      //   type: EVENT.PRODUCT_SHARE.TYPE.SHARE_API,
      //   page: EVENT.PAGE.RECOMMEND,
      // });

      navigator.share({
        title,
        url: window.location.href,
      });
    } else {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SHARE.NAME, {
      //   type: EVENT.PRODUCT_SHARE.TYPE.NOT_SHARE_API,
      //   page: EVENT.PAGE.RECOMMEND,
      // });

      navigator.clipboard.writeText(window.location.href);
      toast(
        <>
          링크가 클립보드에 복사되었어요!
          <br />
          원하는 곳에 붙여 넣어 공유해보세요!
        </>,
      );
    }
  };
  return (
    <button
      onClick={handleShare}
      className="-m-2 p-2 hover:cursor-pointer"
      aria-label="공유하기"
      title="공유하기"
    >
      <Share />
    </button>
  );
};

export default ShareButton;
