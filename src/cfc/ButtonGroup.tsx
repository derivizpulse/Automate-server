import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type ButtonGroupAlign = "left" | "center" | "right";

export type ButtonGroupProps = CfcProps & {
  align?: ButtonGroupAlign;
};

export function ButtonGroup({
  align,
  className,
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "cfc-button-group",
        align === "left" && "cfc-button-group--left",
        align === "center" && "cfc-button-group--center",
        align === "right" && "cfc-button-group--right",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
