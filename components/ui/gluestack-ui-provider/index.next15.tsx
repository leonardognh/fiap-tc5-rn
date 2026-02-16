// This is a Next.js 15 compatible version of the GluestackUIProvider
'use client';
import React, { useEffect, useLayoutEffect } from 'react';
import { config, highContrastConfig } from './config';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { setFlushStyles } from '@gluestack-ui/utils/nativewind-utils';
import { script } from './script';

const variableStyleTagId = 'nativewind-style';
const createStyle = (styleTagId: string) => {
  const style = document.createElement('style');
  style.id = styleTagId;
  style.appendChild(document.createTextNode(''));
  return style;
};

export const useSafeLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function GluestackUIProvider({
  mode = 'light',
  contrast = 'normal',
  ...props
}: {
  mode?: 'light' | 'dark' | 'system';
  contrast?: 'normal' | 'high';
  children?: React.ReactNode;
}) {
  const applyContrast = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    const documentElement = document.documentElement;
    if (!documentElement) return;

    const keys = Object.keys(highContrastConfig.light);
    keys.forEach((key) => documentElement.style.removeProperty(key));

    if (contrast !== 'high') {
      documentElement.dataset['contrast'] = 'normal';
      return;
    }

    const isDark = documentElement.classList.contains('dark');
    const vars = highContrastConfig[isDark ? 'dark' : 'light'];
    Object.entries(vars).forEach(([key, value]) => {
      documentElement.style.setProperty(key, String(value));
    });
    documentElement.dataset['contrast'] = 'high';
  }, [contrast]);

  let cssVariablesWithMode = ``;
  Object.keys(config).forEach((configKey) => {
    cssVariablesWithMode +=
      configKey === 'dark' ? `\n .dark {\n ` : `\n:root {\n`;
    const cssVariables = Object.keys(
      config[configKey as keyof typeof config]
    ).reduce((acc: string, curr: string) => {
      acc += `${curr}:${config[configKey as keyof typeof config][curr]}; `;
      return acc;
    }, '');
    cssVariablesWithMode += `${cssVariables} \n}`;
  });

  setFlushStyles(cssVariablesWithMode);

  const handleMediaQuery = React.useCallback(
    (e: MediaQueryListEvent) => {
      script(e.matches ? 'dark' : 'light');
      applyContrast();
    },
    [applyContrast]
  );

  useSafeLayoutEffect(() => {
    if (mode !== 'system') {
      const documentElement = document.documentElement;
      if (documentElement) {
        documentElement.classList.add(mode);
        documentElement.classList.remove(mode === 'light' ? 'dark' : 'light');
        documentElement.style.colorScheme = mode;
        applyContrast();
      }
    }
  }, [mode, applyContrast]);

  useSafeLayoutEffect(() => {
    if (mode !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    media.addListener(handleMediaQuery);
    applyContrast();

    return () => media.removeListener(handleMediaQuery);
  }, [handleMediaQuery, applyContrast, mode]);

  useSafeLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      const documentElement = document.documentElement;
      if (documentElement) {
        const head = documentElement.querySelector('head');
        let style = head?.querySelector(`[id='${variableStyleTagId}']`);
        if (!style) {
          style = createStyle(variableStyleTagId);
          style.innerHTML = cssVariablesWithMode;
          if (head) head.appendChild(style);
        }
      }
    }
  }, []);

  return (
    <OverlayProvider>
      <ToastProvider>{props.children}</ToastProvider>
    </OverlayProvider>
  );
}
