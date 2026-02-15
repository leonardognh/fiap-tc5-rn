import React from 'react';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { textStyle } from './styles';
import { useSettingsStore } from '@/src/settings/store/settings.store';

type ITextProps = React.ComponentProps<'span'> & VariantProps<typeof textStyle>;

const Text = React.forwardRef<React.ComponentRef<'span'>, ITextProps>(
  function Text(
    {
      className,
      isTruncated,
      bold,
      underline,
      strikeThrough,
      size = 'md',
      sub,
      italic,
      highlight,
      style,
      ...props
    }: { className?: string } & ITextProps,
    ref
  ) {
    const fontScale = useSettingsStore((s) => s.preferences.fontScale ?? 1);
    const spaceScale = useSettingsStore((s) => s.preferences.spaceScale ?? 1);
    const resolvedSize = (sub ? 'xs' : size) ?? 'md';
    const sizeMap: Record<string, number> = {
      '2xs': 10,
      'xs': 12,
      'sm': 14,
      'md': 16,
      'lg': 18,
      'xl': 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    };
    const baseSize = sizeMap[resolvedSize] ?? 16;
    const scaledStyle =
      !fontScale || fontScale === 1
        ? undefined
        : ({
            fontSize: baseSize * fontScale,
            lineHeight: `${Math.round(baseSize * fontScale * 1.25)}px`,
          } as const);

    const spacingStyle =
      !spaceScale || spaceScale === 1
        ? undefined
        : ({
            letterSpacing: `${Math.round((spaceScale - 1) * 2 * 10) / 10}px`,
            wordSpacing: `${Math.round((spaceScale - 1) * 3 * 10) / 10}px`,
            lineHeight: `${Math.round(baseSize * (fontScale || 1) * 1.3)}px`,
          } as const);

    return (
      <span
        className={textStyle({
          isTruncated: isTruncated as boolean,
          bold: bold as boolean,
          underline: underline as boolean,
          strikeThrough: strikeThrough as boolean,
          size,
          sub: sub as boolean,
          italic: italic as boolean,
          highlight: highlight as boolean,
          class: className,
        })}
        style={{ ...(style ?? {}), ...(scaledStyle ?? {}), ...(spacingStyle ?? {}) }}
        {...props}
        ref={ref}
      />
    );
  }
);

Text.displayName = 'Text';

export { Text };
