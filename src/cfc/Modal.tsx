import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type ModalSize = "small" | "medium" | "large";

export type ModalProps = CfcProps & {
  active?: boolean;
  size?: ModalSize;
};

export function Modal({
  active = false,
  size,
  className,
  children,
  ...props
}: ModalProps) {
  return (
    <div
      className={cn(
        "cfc-modal",
        active && "is-active",
        size === "small" && "cfc-modal--small",
        size === "medium" && "cfc-modal--medium",
        size === "large" && "cfc-modal--large",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalContainer({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-modal__container", className)} {...props}>
      {children}
    </div>
  );
}

export function ModalHeader({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-modal__header", className)} {...props}>
      {children}
    </div>
  );
}

export function ModalContent({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-modal__content", className)} {...props}>
      {children}
    </div>
  );
}

export function ModalContentInner({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-modal__content-inner", className)} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-modal__footer", className)} {...props}>
      {children}
    </div>
  );
}
