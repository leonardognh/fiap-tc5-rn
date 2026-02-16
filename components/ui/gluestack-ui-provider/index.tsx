import React, { useEffect } from 'react';
import { config, highContrastConfig } from './config';
import { View, ViewProps } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';

export type ModeType = 'light' | 'dark' | 'system';
export type ContrastMode = 'normal' | 'high';

export function GluestackUIProvider({
  mode = 'light',
  contrast = 'normal',
  ...props
}: {
  mode?: ModeType;
  contrast?: ContrastMode;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const contrastVars =
    contrast === 'high' ? highContrastConfig[colorScheme!] : null;

  useEffect(() => {
    setColorScheme(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  return (
    <View
      style={[
        config[colorScheme!],
        contrastVars,
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
