import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export function Page({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-page", className)} {...props}>
      {children}
    </div>
  );
}

export function PagePanel({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-page__panel", className)} {...props}>
      {children}
    </div>
  );
}

export function PageContent({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-page__content", className)} {...props}>
      {children}
    </div>
  );
}

export function PageContentInner({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-page__content-inner", className)} {...props}>
      {children}
    </div>
  );
}

export function PageSidebar({ className, children, ...props }: CfcProps) {
  return (
    <aside className={cn("cfc-page__sidebar", className)} {...props}>
      {children}
    </aside>
  );
}

export function PageMain({ className, children, ...props }: CfcProps) {
  return (
    <main className={cn("cfc-page__main", className)} {...props}>
      {children}
    </main>
  );
}
