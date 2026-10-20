import { WebViewBridge } from '@/shared/lib/webview/sender';
import { WebViewEventType } from '@/shared/lib/webview/type';

import ChannelService from './channel-service';

interface BootOption {
  pluginKey: string;
  hideChannelButtonOnBoot: boolean;
  zIndex?: number;
}

export interface ICustomerService {
  showMessenger: () => void;
  loadScript: () => void;
  boot: (option: BootOption) => void;
  onShowMessenger: (callback: () => void) => void;
  onHideMessenger: (callback: () => void) => void;
}

const CHANNEL_PLUGIN_KEY = 'a3e5d0f0-64d2-4d45-ad6f-0ce107803f6a';

class CustomerService {
  private customerService: ICustomerService;
  private booted = false;
  constructor(customerService: ICustomerService) {
    this.customerService = customerService;
  }

  // 한 번만. 마이페이지는 본문·PC 사이드바가 CustomerServiceBoot 를 같이 달아 두 effect 가 같은 커밋에 돌고,
  // 둘 다 바뀌기 전 atom(false)을 봐서 스크립트를 두 번 넣었다(「ChannelIO script included twice.」, 10/20 web-screens).
  onBootStrap() {
    if (this.booted) return;
    this.booted = true;
    this.customerService.loadScript();
    this.customerService.boot({
      pluginKey: CHANNEL_PLUGIN_KEY,
      hideChannelButtonOnBoot: true,
      zIndex: 200,
    });
    this.customerService.onShowMessenger(() => {
      WebViewBridge.sendMessage(WebViewEventType.CHANNEL_TALK_VISIBILITY, {
        data: { isOpen: true },
      });
    });
    this.customerService.onHideMessenger(() => {
      WebViewBridge.sendMessage(WebViewEventType.CHANNEL_TALK_VISIBILITY, {
        data: { isOpen: false },
      });
    });
  }

  onShowMessenger() {
    this.customerService.showMessenger();
  }
}

const customerService = new CustomerService(new ChannelService());
export default customerService;
