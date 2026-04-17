"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline:
          "border-border bg-background hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 gap-2 px-4 py-2",
        xs: "h-7 gap-1 px-2.5 text-xs",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
        lg: "h-10 gap-2 rounded-md px-6",
        xl: "h-11 gap-2 rounded-md px-8",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function composeEventHandlers<E>(
  childHandler?: (event: E) => void,
  parentHandler?: (event: E) => void
) {
  return (event: E) => {
    childHandler?.(event);
    parentHandler?.(event);
  };
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, children, ...props }, ref) => {
    const mergedClassName = cn(buttonVariants({ variant, size }), className);

    if (asChild) {
      const child = React.Children.only(children);
      if (!React.isValidElement(child)) return null;

      const childProps = child.props as {
        className?: string;
        onClick?: (event: React.MouseEvent<HTMLElement>) => void;
      };

      return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        ...props,
        className: cn(mergedClassName, childProps.className),
        onClick: composeEventHandlers(childProps.onClick, props.onClick as never),
      });
    }

    return (
      <button
        ref={ref}
        className={mergedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
