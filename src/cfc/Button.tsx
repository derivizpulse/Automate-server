import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  danger?: boolean;
  className?: string;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "ghost", danger = false, className, children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "cfc-button",
          variant === "primary" && "cfc-button--primary",
          variant === "secondary" && "cfc-button--secondary",
          danger && "cfc-button--danger",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
