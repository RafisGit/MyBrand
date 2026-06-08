import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        secondary: "bg-white/80 text-black ring-1 ring-black/10 backdrop-blur",
        outline: "bg-transparent text-black ring-1 ring-black/15",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
