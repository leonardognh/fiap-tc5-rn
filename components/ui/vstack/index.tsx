import React, { useMemo } from 'react';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { View } from 'react-native';

import { vstackStyle } from './styles';
import { useSettingsStore } from '@/src/settings/store/settings.store';

type IVStackProps = React.ComponentProps<typeof View> &
  VariantProps<typeof vstackStyle>;

const VStack = React.forwardRef<React.ComponentRef<typeof View>, IVStackProps>(
  function VStack({ className, space, reversed, style, ...props }, ref) {
    const spaceScale = useSettingsStore((s) => s.preferences.spaceScale ?? 1);
    const scaledGap = useMemo(() => {
      if (!space) return undefined;
      const baseMap: Record<string, number> = {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
      };
      const base = baseMap[String(space)] ?? 0;
      return Math.round(base * (spaceScale || 1));
    }, [space, spaceScale]);

    return (
      <View
        className={vstackStyle({
          space,
          reversed: reversed as boolean,
          class: className,
        })}
        style={[style, scaledGap ? { rowGap: scaledGap } : null]}
        {...props}
        ref={ref}
      />
    );
  }
);

VStack.displayName = 'VStack';

export { VStack };
