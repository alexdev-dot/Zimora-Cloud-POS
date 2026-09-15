import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        outline: "border border-input bg-card shadow-sm hover:bg-muted/60 text-foreground",
        ghost: "hover:bg-muted/70 text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success: "bg-success text-white shadow-sm hover:bg-success/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 min-h-[44px] px-3 text-[13px] [&_svg]:size-3.5 sm:h-8 sm:min-h-0",
        default: "h-9 min-h-[44px] px-3.5 text-sm [&_svg]:size-4 sm:h-9 sm:min-h-0",
        lg: "h-10 min-h-[44px] px-5 text-sm [&_svg]:size-4 sm:h-10 sm:min-h-0",
        xl: "h-12 min-h-[44px] px-6 text-base [&_svg]:size-5 sm:h-12 sm:min-h-0",
        icon: "h-9 min-h-[44px] w-9 [&_svg]:size-4 sm:h-9 sm:min-h-0",
        "icon-sm": "h-8 min-h-[44px] w-8 [&_svg]:size-4 sm:h-8 sm:min-h-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
