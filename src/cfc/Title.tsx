import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export type TitleProps = CfcProps & {
  black?: boolean;
  small?: boolean;
  secondary?: boolean;
};

export function Title({
  black,
  small,
  secondary,
  className,
  children,
  ...props
}: TitleProps) {
  return (
    <div
      className={cn(
        "cfc-title",
        black && "cfc-title--black",
        small && "cfc-title--small",
        secondary && "cfc-title--secondary",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TitleMain({
  className,
  children,
  ...props
}: CfcProps<HTMLHeadingElement>) {
  return (
    <h2 className={cn("cfc-title__main", className)} {...props}>
      {children}
    </h2>
  );
}

export function TitleSub({
  className,
  children,
  ...props
}: CfcProps<HTMLParagraphElement>) {
  return (
    <p className={cn("cfc-title__sub", className)} {...props}>
      {children}
    </p>
  );
}
