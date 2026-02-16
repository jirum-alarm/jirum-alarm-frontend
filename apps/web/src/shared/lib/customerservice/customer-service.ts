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
}

const CHANNEL_PLUGIN_KEY = 'a3e5d0f0-64d2-4d45-ad6f-0ce107803f6a';

class CustomerService {
  private customerService: ICustomerService;
  constructor(customerService: ICustomerService) {
    this.customerService = customerService;
  }

  onBootStrap() {
    this.customerService.loadScript();
    this.customerService.boot({
      pluginKey: CHANNEL_PLUGIN_KEY,
      hideChannelButtonOnBoot: true,
      zIndex: 200,
    });
  }

  onShowMessenger() {
    this.customerService.showMessenger();
  }
}

const customerService = new CustomerService(new ChannelService());
export default customerService;
