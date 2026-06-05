import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type AlertVariant = "info" | "success" | "caution" | "warning";

export type AlertProps = CfcProps & {
  variant?: AlertVariant;
};

export function Alert({
  variant = "info",
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      className={cn("cfc-alert", `cfc-alert--${variant}`, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertLeft({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-alert__left", className)} {...props}>
      {children}
    </div>
  );
}

export function AlertIcon({ className, children, ...props }: CfcProps) {
  return (
    <span className={cn("cfc-alert__icon", className)} {...props}>
      {children}
    </span>
  );
}

export function AlertContent({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-alert__content", className)} {...props}>
      {children}
    </div>
  );
}

export function AlertTitle({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-alert__title", className)} {...props}>
      {children}
    </div>
  );
}

export function AlertText({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-alert__text", className)} {...props}>
      {children}
    </div>
  );
}

export function AlertAction({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-alert__action", className)} {...props}>
      {children}
    </div>
  );
}
