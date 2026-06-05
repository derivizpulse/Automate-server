import { cn } from "../lib/cn";
import type { CfcProps } from "./types";

export function TableContainer({ className, children, ...props }: CfcProps) {
  return (
    <div className={cn("cfc-table-container", className)} {...props}>
      {children}
    </div>
  );
}

export type TableProps = CfcProps & {
  tableClassName?: string;
};

export function Table({
  className,
  tableClassName,
  children,
  ...props
}: TableProps) {
  return (
    <div className={cn("cfc-table", className)} {...props}>
      <table className={tableClassName}>{children}</table>
    </div>
  );
}

export function TableHead({
  className,
  children,
  ...props
}: CfcProps<HTMLTableSectionElement>) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: CfcProps<HTMLTableSectionElement>) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}
