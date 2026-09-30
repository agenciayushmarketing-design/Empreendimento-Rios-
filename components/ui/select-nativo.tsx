import * as React from "react";
import { cn } from "@/lib/utils";

// <select> nativo com o visual do Input do shadcn. Funciona em formularios GET e server actions
// sem precisar de estado no cliente.
const SelectNativo = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
SelectNativo.displayName = "SelectNativo";

export { SelectNativo };
