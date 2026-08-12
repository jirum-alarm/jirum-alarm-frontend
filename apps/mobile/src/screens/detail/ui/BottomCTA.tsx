import React, {useCallback} from 'react';
import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Button from '@/shared/components/ui/Button';
import {MixpanelService} from '@/shared/lib/analytics/mixpanel';
import {openInAppBrowser} from '@/shared/lib/navigation';

import type {ProductDetail} from '../model/types';

export default function BottomCTA({product}: {product: ProductDetail}) {
  const insets = useSafeAreaInsets();

  const handlePurchase = useCallback(() => {
    if (!product.detailUrl) return;

    // web 은 GTM dataLayer 로 보낸다. RN 에는 GTM 이 없으므로 Mixpanel 로 대체 —
    // 그냥 지우면 구매 클릭 추적(수익 지표)이 사라진다.
    MixpanelService.track('purchase_link_click', {
      product_id: String(product.id),
      click_url: product.detailUrl,
      monetized: product.isProfitUrl ?? false,
      profit_provider: product.profitLinkProvider ?? null,
    });

    openInAppBrowser(product.detailUrl);
  }, [
    product.detailUrl,
    product.id,
    product.isProfitUrl,
    product.profitLinkProvider,
  ]);

  return (
    <View
      className="border-t border-t-[#D0D5DD] bg-white px-5 pt-2"
      style={{paddingBottom: Math.max(insets.bottom, 8)}}>
      <Button
        className="h-[48px] w-full"
        onPress={handlePurchase}
        disabled={!product.detailUrl}>
        <Text className="text-base font-semibold text-white">
          구매하러 가기
        </Text>
      </Button>
    </View>
  );
}
