import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type EmptyStateVariant =
  | "no-data"
  | "information"
  | "user-action"
  | "error"
  | "no-operatory"
  | "upload"
  | "click-action"
  | "error-loading";

export type EmptyStateProps = CfcProps & {
  variant?: EmptyStateVariant;
};

export function EmptyState({
  variant,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "cfc-empty-state",
        variant && `cfc-empty-state--${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyStateImage({ className, ...props }: CfcProps) {
  return <div className={cn("cfc-empty-state__image", className)} {...props} />;
}

export function EmptyStateContent({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-empty-state__content", className)} {...props}>
      {children}
    </div>
  );
}

export function EmptyStateTitle({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-empty-state__title", className)} {...props}>
      {children}
    </div>
  );
}

export function EmptyStateText({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-empty-state__text", className)} {...props}>
      {children}
    </div>
  );
}

export function EmptyStateAction({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-empty-state__action", className)} {...props}>
      {children}
    </div>
  );
}
