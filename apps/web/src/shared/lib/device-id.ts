import { v7 as uuidv7 } from 'uuid';

export const generateDeviceId = () => {
  const deviceId = uuidv7();
  return deviceId;
};
