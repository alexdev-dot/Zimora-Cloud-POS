import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-lg border border-input bg-card text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] placeholder:text-muted-foreground/70 focus-ring disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input type={type} ref={ref} className={cn(baseField, "h-9 min-h-[44px] px-3 sm:h-9 sm:min-h-0", className)} {...props} suppressHydrationWarning />
  )
);
Input.displayName = "Input";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(baseField, "min-h-[88px] px-3 py-2 sm:min-h-[72px]", className)} {...props} suppressHydrationWarning />
  )
);
Textarea.displayName = "Textarea";

function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[13px] font-medium leading-none text-foreground", className)}
      {...props}
    />
  );
}

function NativeSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          baseField,
          "h-9 min-h-[44px] appearance-none pl-3 pr-8 sm:h-9 sm:min-h-0 [&>option]:bg-card",
          className
        )}
        {...props}
        suppressHydrationWarning
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

function FormField({ label, htmlFor, required, hint, error, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export { Input, Textarea, Label, NativeSelect, FormField, baseField };
