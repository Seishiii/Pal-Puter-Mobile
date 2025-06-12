import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wide",
  {
    variants: {
      variant: {
        locked:
          "bg-neutral-300 text-primary-foreground hover:bg-neutral-300/90 border-neutral-400 border-b-4 active:border-b-0",
        default:
          "bg-white text-purple-800 border-purple-200 border-2 border-b-4 active:border-b-2 hover:bg-purple-50 text-purple-600 cursor-pointer",
        primary:
          "bg-purple-500 text-white hover:bg-purple-500/90 border-purple-600 border-b-4 active:border-b-0 cursor-pointer",
        primaryOutline:
          "bg-transparent text-purple-500 border-purple-500 border-2 hover:bg-purple-500/10 cursor-pointer",
        secondary:
          "bg-emerald-500 text-white hover:bg-emerald-500/90 border-emerald-600 border-b-4 active:border-b-0 cursor-pointer",
        secondaryOutline:
          "bg-transparent text-emerald-500 border-emerald-500 border-2 hover:bg-emerald-500/10 cursor-pointer",
        danger:
          "bg-rose-500 text-white hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-0 cursor-pointer",
        dangerOutline:
          "bg-transparent text-rose-500 border-rose-500 border-2 hover:bg-rose-500/10 cursor-pointer",
        super:
          "bg-violet-500 text-white hover:bg-violet-500/90 border-violet-600 border-b-4 active:border-b-0 cursor-pointer",
        superOutline:
          "bg-transparent text-violet-500 border-violet-500 border-2 hover:bg-violet-500/10 cursor-pointer",
        ghost:
          "bg-transparent text-purple-300 border-transparent border-0 hover:bg-purple-500/20 cursor-pointer",
        sidebar:
          "bg-transparent text-purple-200 border-2 border-transparent hover:bg-purple-500/30 transition-none cursor-pointer",
        sidebarOutline:
          "bg-purple-500/15 text-purple-200 border-purple-400 border-2 hover:bg-purple-500/25 transition-none cursor-pointer",
      },
      size: {
        default: "h-11 px-4 py-2",
        xs: "h-8 px-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
