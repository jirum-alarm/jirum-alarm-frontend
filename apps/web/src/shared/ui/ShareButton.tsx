'use client';

import { motion } from 'motion/react';

import { EVENT } from '@/shared/config/mixpanel';
import { shareNative, triggerHaptic } from '@/shared/lib/webview';
import { Share } from '@/shared/ui/common/icons';
import { useToast } from '@/shared/ui/common/Toast';

const ShareButton = ({ title, page }: { title: string; page?: keyof typeof EVENT.PAGE }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    triggerHaptic('light');

    const url = window.location.href;

    try {
      await shareNative({ title, url });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;

      navigator.clipboard.writeText(url);
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
    <motion.button
      onClick={handleShare}
      className="-m-2 rounded-full p-2 hover:cursor-pointer"
      aria-label="공유하기"
      title="공유하기"
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <Share />
    </motion.button>
  );
};

export default ShareButton;
