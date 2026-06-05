import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type SlideoutWidth =
  | "x-small"
  | "small"
  | "medium"
  | "large"
  | "x-large"
  | "xx-large";

export type SlideoutSide = "left" | "right";

export type SlideoutProps = CfcProps & {
  active?: boolean;
  side?: SlideoutSide;
  width?: SlideoutWidth;
};

const widthClass: Record<SlideoutWidth, string> = {
  "x-small": "cfc-slideout-new--x-small",
  small: "cfc-slideout-new--small",
  medium: "cfc-slideout-new--medium",
  large: "cfc-slideout-new--large",
  "x-large": "cfc-slideout-new--x-large",
  "xx-large": "cfc-slideout-new--xx-large",
};

export function Slideout({
  active = false,
  side = "right",
  width,
  className,
  children,
  ...props
}: SlideoutProps) {
  return (
    <div
      className={cn(
        "cfc-slideout-new",
        side === "left" && "cfc-slideout-new--left",
        side === "right" && "cfc-slideout-new--right",
        width && widthClass[width],
        active && "is-active",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SlideoutHeader({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-slideout-new__header", className)} {...props}>
      {children}
    </div>
  );
}

export function SlideoutContent({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-slideout-new__content", className)} {...props}>
      {children}
    </div>
  );
}

export function SlideoutContentInner({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-slideout-new__content-inner", className)} {...props}>
      {children}
    </div>
  );
}

export function SlideoutFooter({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-slideout-new__footer", className)} {...props}>
      {children}
    </div>
  );
}
