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

    // 유입 시 붙어 온 utm(예: 카톡방송의 utm_source=kakao)이 재공유로 전파되면 채널 귀속이
    // 오염된다 — 기존 utm 을 제거하고 공유 채널 utm 으로 교체 (2026-07-20).
    const shareUrl = new URL(window.location.href);
    [...shareUrl.searchParams.keys()]
      .filter((k) => k.startsWith('utm_'))
      .forEach((k) => shareUrl.searchParams.delete(k));
    shareUrl.searchParams.set('utm_source', 'share');
    shareUrl.searchParams.set('utm_medium', 'native_share');
    const url = shareUrl.toString();

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
