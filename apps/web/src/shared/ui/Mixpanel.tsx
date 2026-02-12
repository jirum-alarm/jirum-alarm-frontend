// 'use client';

// import { type Mixpanel as MixpanelType } from 'mixpanel-browser';
// import { useEffect } from 'react';

// import { MixpanelService } from '@/shared/lib/mixpanel';

// type MixpanelInstance = MixpanelType & {
//   set_user: typeof MixpanelService.setUser;
// };

// export let mp: MixpanelInstance | null = null;

// export default function Mixpanel() {
//   useEffect(() => {
//     if (mp) {
//       return;
//     }
//     const instance = MixpanelService.getInstance();
//     mp = Object.assign(instance, {
//       set_user: MixpanelService.setUser,
//     });
//   }, []);

//   return null;
// }
