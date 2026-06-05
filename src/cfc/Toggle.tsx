import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type ToggleProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
};

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { className, ...props },
  ref
) {
  return (
    <label className={cn("cfc-toggle-switch", className)}>
      <input
        ref={ref}
        type="checkbox"
        className="cfc-toggle-switch__input"
        {...props}
      />
      <span className="cfc-toggle-switch__slider" />
    </label>
  );
});
