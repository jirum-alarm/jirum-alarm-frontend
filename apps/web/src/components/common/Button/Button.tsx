import { type VariantProps } from 'class-variance-authority';
import { type HTMLMotionProps, motion } from 'motion/react';

import { cn } from '@/lib/cn';

import { buttonVaraint } from './variant/button';

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'color'>, VariantProps<typeof buttonVaraint> {
  children?: React.ReactNode;
}

export const Button = ({ size, variant, color, className, children, ...rest }: ButtonProps) => {
  return (
    <motion.button
      {...rest}
      type={rest.type ?? 'button'}
      className={cn(buttonVaraint({ size, variant, color }), className)}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
};

Button.displayName = 'Button';
