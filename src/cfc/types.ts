import type { HTMLAttributes, ReactNode } from "react";

export type CfcProps<T extends HTMLElement = HTMLDivElement> =
  HTMLAttributes<T> & {
    className?: string;
    children?: ReactNode;
  };
