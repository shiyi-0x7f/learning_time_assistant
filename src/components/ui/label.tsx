import React from 'react';
import { cn } from '@/lib/utils';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 block',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';
