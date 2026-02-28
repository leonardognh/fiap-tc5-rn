'use client';
import React from 'react';
import { Switch as RNSwitch, useColorScheme as useSystemColorScheme } from 'react-native';
import { createSwitch } from '@gluestack-ui/core/switch/creator';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import { withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { useSettingsStore } from '@/src/settings/store/settings.store';

const UISwitch = createSwitch({
  Root: withStyleContext(RNSwitch),
});

const switchStyle = tva({
  base: 'data-[focus=true]:outline-0 data-[focus=true]:ring-2 data-[focus=true]:ring-indicator-primary web:cursor-pointer disabled:cursor-not-allowed data-[disabled=true]:opacity-40 data-[invalid=true]:border-error-700 data-[invalid=true]:rounded-xl data-[invalid=true]:border-2',

  variants: {
    size: {
      sm: 'scale-75',
      md: '',
      lg: 'scale-125',
    },
  },
});

type ISwitchProps = React.ComponentProps<typeof UISwitch> &
  VariantProps<typeof switchStyle> & {
    activeThumbColor?: string;
    activeTrackColor?: string;
  };
const Switch = React.forwardRef<
  React.ComponentRef<typeof UISwitch>,
  ISwitchProps
>(function Switch(
  {
    className,
    size = 'md',
    trackColor,
    thumbColor,
    activeThumbColor,
    activeTrackColor,
    ios_backgroundColor,
    ...props
  },
  ref
) {
  const themeMode = useSettingsStore((s) => s.preferences.theme);
  const systemScheme = useSystemColorScheme();
  const resolvedTheme = themeMode === 'system' ? systemScheme : themeMode;
  const isDark = resolvedTheme === 'dark';
  const defaultTrack = {
    false: isDark ? '#4b4b4b' : '#e0e0e0',
    true: isDark ? '#bdbdbd' : '#5a5a5a',
  };
  const userTrack =
    typeof trackColor === 'object' && trackColor !== null ? trackColor : null;
  const mergedTrackColor = { ...defaultTrack, ...(userTrack ?? {}) };
  const resolvedThumb = thumbColor ?? (isDark ? '#ffffff' : '#0a0a0a');
  const resolvedActiveThumb = activeThumbColor ?? resolvedThumb;
  const resolvedActiveTrack = activeTrackColor ?? mergedTrackColor.true;
  const isOn = typeof props.value === 'boolean' ? props.value : false;
  const resolvedIOSBackground =
    ios_backgroundColor ?? mergedTrackColor.false;
  const resolvedTrackColor = {
    ...mergedTrackColor,
    true: resolvedActiveTrack,
  };
  const resolvedThumbColor = isOn ? resolvedActiveThumb : resolvedThumb;

  return (
    <UISwitch
      ref={ref}
      {...props}
      className={switchStyle({ size, class: className })}
      trackColor={resolvedTrackColor}
      thumbColor={resolvedThumbColor}
      ios_backgroundColor={resolvedIOSBackground ?? undefined}
    />
  );
});

Switch.displayName = 'Switch';
export { Switch };
