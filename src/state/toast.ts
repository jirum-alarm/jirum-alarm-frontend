import { atomFamily } from 'recoil'

export const toastAtom = atomFamily({
  key: 'toastAtom',
  default: {
    show: false,
    message: '',
  },
})
