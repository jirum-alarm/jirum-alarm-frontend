import { cx } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(cx(inputs))
}
export type ClassValue = ClassArray | ClassDictionary | string | number | null | boolean | undefined
export type ClassDictionary = Record<string, any>
export type ClassArray = ClassValue[]
