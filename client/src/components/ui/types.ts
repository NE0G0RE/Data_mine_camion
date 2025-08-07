import * as React from 'react';

export type WithChildren<T = {}> = T & { children?: React.ReactNode };
export type WithClassName<T = {}> = T & { className?: string };
export type ComponentWithChildren<T = {}> = WithChildren<WithClassName<T>>;

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface BaseProps {
  className?: string;
}

export interface ButtonBaseProps extends BaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export interface InputBaseProps extends BaseProps, React.InputHTMLAttributes<HTMLInputElement> {}

export interface SelectBaseProps extends BaseProps, React.SelectHTMLAttributes<HTMLSelectElement> {}

export interface TableBaseProps extends BaseProps, React.TableHTMLAttributes<HTMLTableElement> {}

export interface CardBaseProps extends ComponentWithChildren {}

export interface DialogBaseProps extends ComponentWithChildren {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface AlertDialogBaseProps extends DialogBaseProps {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
