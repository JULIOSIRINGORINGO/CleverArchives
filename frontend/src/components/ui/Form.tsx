import * as React from "react";
import { Box, BoxProps } from "./Box";

/**
 * Form - Semantic wrapper for HTML form.
 * Extends BoxProps to handle layout directly.
 */
export type FormProps = BoxProps & Omit<React.FormHTMLAttributes<HTMLFormElement>, keyof BoxProps | "display">;

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ children, ...props }, ref) => {
  return (
    <Box asChild {...props}>
      <form ref={ref}>
        {children}
      </form>
    </Box>
  );
});

Form.displayName = "Form";

export { Form };
