import React, {isValidElement} from 'react';
import {type VariantProps} from 'class-variance-authority';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
} from 'react-native';
import {cn} from '@/shared/lib/styling';
import {
  buttonVaraint,
  textVariant,
} from '@/shared/components/ui/Button/variant/button.ts';

interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVaraint> {
  children?: React.ReactNode;
  loading?: boolean;
}

const Button = ({
  children,
  size = 'lg',
  variant = 'filled',
  color = 'primary',
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      className={cn(buttonVaraint({size, variant, color}), className)}
      {...rest}>
      {({pressed}) => {
        return loading ? (
          <ActivityIndicator size="small" color={'white'} />
        ) : isValidElement(children) ? (
          children
        ) : (
          <Text
            className={cn(
              textVariant({size, color, variant, disabled, pressed}),
            )}>
            {children}
          </Text>
        );
      }}
    </Pressable>
  );
};

export default Button;
