export const color = {
  white: '#FFFFFF',
  black: '#000000',
  error: '#FF0000',
  link: '#587DFF',

  gray_900: '#101828',
  gray_800: '#1D2939',
  gray_700: '#344054',
  gray_600: '#475467',
  gray_500: '#667085',
  gray_400: '#98A2B3',
  gray_300: '#D0D5DD',
  gray_200: '#E4E7EC',
  gray_100: '#F2F4F7',
  gray_50: '#475467',

  main_900: '#203009',
  main_800: '#3F6112',
  main_700: '#5F911C',
  main_600: '#7FC125',
  main_500: '#9EF22E',
  main_400: '#B2F458',
  main_300: '#C5F782',
  main_200: '#D8FAAB',
  main_100: '#ECFCD',
  main_50: '#F5FDEA',

  dim: 'rgba(0,0,0,0.6)',
} as const

export type ColorType = typeof color
