import React from 'react';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

export function CardHeader({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 border-b border-border-subtle ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base font-semibold text-text-primary ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-text-secondary mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 border-t border-border-subtle bg-surface-1/50 rounded-b-xl flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

const variantStyles: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card-elevated',
  outlined: 'border border-border-strong rounded-xl bg-transparent',
  interactive: 'card cursor-pointer hover:border-accent/40 active:translate-y-[1px]',
};

export default function Card({ variant = 'default', children, className = '', ...props }: CardProps) {
  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
