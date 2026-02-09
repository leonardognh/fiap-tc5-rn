import RNSlider from '@react-native-community/slider';
import * as React from 'react';
import { View } from 'react-native';

type Props = React.ComponentProps<typeof RNSlider> & {
  containerClassName?: string;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
};

export function Slider({ containerClassName, ...props }: Props) {
  return (
    <View className={containerClassName ?? 'w-full'}>
      <RNSlider {...props} />
    </View>
  );
}
