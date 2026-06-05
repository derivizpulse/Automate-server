import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export function TabWrapper({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-tab-wrapper", className)} {...props}>
      {children}
    </div>
  );
}

export type TabListProps = CfcProps<HTMLUListElement> & {
  secondary?: boolean;
};

export function TabList({
  secondary = true,
  className,
  children,
  ...props
}: TabListProps) {
  return (
    <ul
      className={cn(
        "cfc-tab",
        secondary && "cfc-tab--secondary",
        className
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

export type TabItemProps = CfcProps<HTMLLIElement> & {
  active?: boolean;
};

export function TabItem({
  active = false,
  className,
  children,
  ...props
}: TabItemProps) {
  return (
    <li
      className={cn("cfc-tab__item", active && "is-active", className)}
      {...props}
    >
      {children}
    </li>
  );
}
