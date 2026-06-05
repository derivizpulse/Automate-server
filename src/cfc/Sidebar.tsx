import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export function Sidebar({ className, children, ...props }: CfcProps) {
  return (
    <nav className={cn("cfc-sidebar", className)} {...props}>
      {children}
    </nav>
  );
}

export type SidebarItemProps = CfcProps & {
  selected?: boolean;
};

export function SidebarItem({
  selected = false,
  className,
  children,
  ...props
}: SidebarItemProps) {
  return (
    <div
      className={cn("cfc-sidebar__item", selected && "selected", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function SidebarIcon({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-sidebar__icon", className)} {...props}>
      <span>{children}</span>
    </div>
  );
}

export function SidebarText({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-sidebar__text", className)} {...props}>
      {children}
    </div>
  );
}
