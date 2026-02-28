'use client';
import React from 'react';
import { createPopover } from '@gluestack-ui/core/popover/creator';
import { tva } from '@gluestack-ui/utils/nativewind-utils';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import {
  Pressable,
  PressableStateCallbackType,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

const popoverContentStyle = tva({
  base: 'rounded-md bg-background-0 border border-outline-100 shadow-hard-5 overflow-hidden z-[2000]',
});

const popoverBodyStyle = tva({
  base: 'p-0',
});

const popoverBackdropStyle = tva({
  base: 'absolute top-0 bottom-0 left-0 right-0 web:cursor-default z-[1990]',
});

const popoverArrowStyle = tva({
  base: 'bg-background-0 border border-outline-100',
});

const popoverHeaderStyle = tva({
  base: 'p-3 border-b border-outline-200',
});

const popoverFooterStyle = tva({
  base: 'p-3 border-t border-outline-200',
});

const popoverCloseButtonStyle = tva({
  base: 'rounded-full p-1',
});

const UIPopover = createPopover({
  Root: View,
  Arrow: View,
  Content: MotionView,
  Header: View,
  Footer: View,
  Body: View,
  Backdrop: Pressable,
  CloseButton: Pressable,
  AnimatePresence,
});

cssInterop(MotionView, { className: 'style' });

type IPopoverProps = React.ComponentProps<typeof UIPopover> &
  VariantProps<typeof popoverContentStyle> & { className?: string };
type IPopoverContentProps = React.ComponentProps<typeof UIPopover.Content> &
  VariantProps<typeof popoverContentStyle> & { className?: string };
type IPopoverBodyProps = React.ComponentProps<typeof UIPopover.Body> &
  VariantProps<typeof popoverBodyStyle> & { className?: string };
type IPopoverBackdropProps = React.ComponentProps<typeof UIPopover.Backdrop> &
  VariantProps<typeof popoverBackdropStyle> & { className?: string };
type IPopoverArrowProps = React.ComponentProps<typeof UIPopover.Arrow> &
  VariantProps<typeof popoverArrowStyle> & { className?: string };
type IPopoverHeaderProps = React.ComponentProps<typeof UIPopover.Header> &
  VariantProps<typeof popoverHeaderStyle> & { className?: string };
type IPopoverFooterProps = React.ComponentProps<typeof UIPopover.Footer> &
  VariantProps<typeof popoverFooterStyle> & { className?: string };
type IPopoverCloseButtonProps = React.ComponentProps<
  typeof UIPopover.CloseButton
> &
  VariantProps<typeof popoverCloseButtonStyle> & { className?: string };

const Popover = React.forwardRef<
  React.ComponentRef<typeof UIPopover>,
  IPopoverProps
>(function Popover({ className, ...props }, ref) {
  const rootStyle = Array.isArray(props.style)
    ? [...props.style, { flex: 1 }]
    : [props.style, { flex: 1 }];
  return (
    <UIPopover
      ref={ref}
      {...props}
      className={className}
      style={rootStyle}
    />
  );
});

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Content>,
  IPopoverContentProps
>(function PopoverContent({ className, ...props }, ref) {
  const contentStyle = Array.isArray(props.style)
    ? [...props.style, { zIndex: 2000, elevation: 50 }]
    : [props.style, { zIndex: 2000, elevation: 50 }];
  return (
    <UIPopover.Content
      ref={ref}
      className={popoverContentStyle({ class: className })}
      style={contentStyle}
      {...props}
    />
  );
});

const PopoverBody = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Body>,
  IPopoverBodyProps
>(function PopoverBody({ className, ...props }, ref) {
  return (
    <UIPopover.Body
      ref={ref}
      className={popoverBodyStyle({ class: className })}
      {...props}
    />
  );
});

const PopoverBackdrop = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Backdrop>,
  IPopoverBackdropProps
>(function PopoverBackdrop({ className, ...props }, ref) {
  const baseStyle = props.style as
    | StyleProp<ViewStyle>
    | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
    | undefined;
  const backdropStyle =
    typeof baseStyle === 'function'
      ? (state: PressableStateCallbackType) => [
          baseStyle(state),
          { zIndex: 1990, elevation: 49 },
        ]
      : Array.isArray(baseStyle)
        ? [...baseStyle, { zIndex: 1990, elevation: 49 }]
        : [baseStyle, { zIndex: 1990, elevation: 49 }];
  return (
    <UIPopover.Backdrop
      ref={ref}
      className={popoverBackdropStyle({ class: className })}
      style={backdropStyle}
      {...props}
    />
  );
});

const PopoverArrow = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Arrow>,
  IPopoverArrowProps
>(function PopoverArrow({ className, ...props }, ref) {
  return (
    <UIPopover.Arrow
      ref={ref}
      className={popoverArrowStyle({ class: className })}
      {...props}
    />
  );
});

const PopoverHeader = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Header>,
  IPopoverHeaderProps
>(function PopoverHeader({ className, ...props }, ref) {
  return (
    <UIPopover.Header
      ref={ref}
      className={popoverHeaderStyle({ class: className })}
      {...props}
    />
  );
});

const PopoverFooter = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Footer>,
  IPopoverFooterProps
>(function PopoverFooter({ className, ...props }, ref) {
  return (
    <UIPopover.Footer
      ref={ref}
      className={popoverFooterStyle({ class: className })}
      {...props}
    />
  );
});

const PopoverCloseButton = React.forwardRef<
  React.ComponentRef<typeof UIPopover.CloseButton>,
  IPopoverCloseButtonProps
>(function PopoverCloseButton({ className, ...props }, ref) {
  return (
    <UIPopover.CloseButton
      ref={ref}
      className={popoverCloseButtonStyle({ class: className })}
      {...props}
    />
  );
});

Popover.displayName = 'Popover';
PopoverContent.displayName = 'PopoverContent';
PopoverBody.displayName = 'PopoverBody';
PopoverBackdrop.displayName = 'PopoverBackdrop';
PopoverArrow.displayName = 'PopoverArrow';
PopoverHeader.displayName = 'PopoverHeader';
PopoverFooter.displayName = 'PopoverFooter';
PopoverCloseButton.displayName = 'PopoverCloseButton';

export {
  Popover,
  PopoverContent,
  PopoverBody,
  PopoverBackdrop,
  PopoverArrow,
  PopoverHeader,
  PopoverFooter,
  PopoverCloseButton,
};
