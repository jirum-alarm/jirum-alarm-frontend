import ChannelService from './channel-service';

export interface ICustomerService {
  showMessenger: () => void;
  loadScript: () => void;
  boot: (option: { pluginKey: string }) => void;
  hideChannelButton: () => void;
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
    });
    this.customerService.hideChannelButton();
  }
  onShowMessenger() {
    this.customerService.showMessenger();
  }
}

export default new CustomerService(new ChannelService());
