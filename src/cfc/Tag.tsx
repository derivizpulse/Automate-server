import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type TagStyle = "fill" | "outline" | "semiFill";

export type TagColor =
  | "green"
  | "red"
  | "orange"
  | "blue"
  | "gray"
  | "turquoise"
  | "purple";

export type TagProps = CfcProps<HTMLSpanElement> & {
  variant?: TagStyle;
  color?: TagColor;
};

const styleClass: Record<TagStyle, string> = {
  fill: "cfc-tag--fill",
  outline: "cfc-tag--outline",
  semiFill: "cfc-tag--semiFill",
};

export function Tag({
  variant = "fill",
  color = "gray",
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        "cfc-tag",
        styleClass[variant],
        `cfc-tag--${color}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
