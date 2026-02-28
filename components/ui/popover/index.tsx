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
  Platform,
} from 'react-native';
import {
  Motion,
  AnimatePresence,
  MotionComponentProps,
} from '@legendapp/motion';

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

type PopoverFocusContextValue = {
  setContentRef: (node: View | null) => void;
  focusRequestId: number;
};

const PopoverFocusContext = React.createContext<PopoverFocusContextValue | null>(
  null
);

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
  const { onOpen, onClose, isOpen } = props;
  const contentRef = React.useRef<View | null>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);
  const wasOpenRef = React.useRef(false);
  const [focusRequestId, setFocusRequestId] = React.useState(0);

  const setContentRef = React.useCallback((node: View | null) => {
    contentRef.current = node;
  }, []);

  const focusContent = React.useCallback(() => {
    if (typeof document === 'undefined') return;
    const active = document.activeElement as HTMLElement | null;
    if (!lastFocusedRef.current && active) {
      lastFocusedRef.current = active;
    }
    active?.blur?.();

    setFocusRequestId((value) => value + 1);
  }, []);

  const restoreFocus = React.useCallback(() => {
    if (typeof document === 'undefined') return;
    const node = lastFocusedRef.current;
    if (node?.focus) {
      const focusNow = () => node.focus?.();
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(focusNow);
      } else {
        setTimeout(focusNow, 0);
      }
    }
    lastFocusedRef.current = null;
  }, []);

  const handleOpen = React.useCallback(() => {
    if (typeof document !== 'undefined') {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
    wasOpenRef.current = true;
    onOpen?.();
    focusContent();
  }, [focusContent, onOpen]);

  const handleClose = React.useCallback(() => {
    onClose?.();
    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      restoreFocus();
    }
  }, [onClose, restoreFocus]);

  React.useEffect(() => {
    if (isOpen) {
      focusContent();
      wasOpenRef.current = true;
      return;
    }
    if (isOpen === false && wasOpenRef.current) {
      wasOpenRef.current = false;
      restoreFocus();
    }
  }, [focusContent, isOpen, restoreFocus]);

  const rootStyle = Array.isArray(props.style)
    ? [...props.style, { flex: 1 }]
    : [props.style, { flex: 1 }];
  return (
    <PopoverFocusContext.Provider value={{ setContentRef, focusRequestId }}>
      <UIPopover
        ref={ref}
        {...props}
        onOpen={handleOpen}
        onClose={handleClose}
        className={className}
        style={rootStyle}
      />
    </PopoverFocusContext.Provider>
  );
});

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof UIPopover.Content>,
  IPopoverContentProps
>(function PopoverContent({ className, ...props }, ref) {
  const focusContext = React.useContext(PopoverFocusContext);
  const localRef = React.useRef<View | null>(null);
  const setRefs = React.useCallback(
    (node: React.ComponentRef<typeof UIPopover.Content> | null) => {
      localRef.current = node as unknown as View | null;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
      focusContext?.setContentRef(node as unknown as View | null);
    },
    [focusContext, ref]
  );
  React.useEffect(() => {
    if (!focusContext?.focusRequestId) return;
    const node = localRef.current as unknown as { focus?: () => void } | null;
    if (node?.focus) {
      const focusNow = () => node.focus?.();
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(focusNow);
      } else {
        setTimeout(focusNow, 0);
      }
    }
  }, [focusContext?.focusRequestId]);
  const contentStyle = Array.isArray(props.style)
    ? [...props.style, { zIndex: 2000, elevation: 50 }]
    : [props.style, { zIndex: 2000, elevation: 50 }];
  return (
    <UIPopover.Content
      ref={setRefs}
      className={popoverContentStyle({ class: className })}
      style={contentStyle}
      tabIndex={-1}
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
  const { onPress, onFocus, ...restProps } = props;
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
      tabIndex={Platform.OS === 'web' ? -1 : undefined}
      focusable={Platform.OS === 'web' ? false : undefined}
      accessible={Platform.OS === 'web' ? false : undefined}
      onFocus={(event) => {
        onFocus?.(event);
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
      }}
      onPress={(event) => {
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
          (document.activeElement as HTMLElement | null)?.blur?.();
        }
        onPress?.(event as any);
      }}
      {...restProps}
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
