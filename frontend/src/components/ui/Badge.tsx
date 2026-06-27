import React from 'react';

type BadgeVariant = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning' | 'default' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  default: 'bg-surface-3 text-text-secondary border-border-subtle',
  outline: 'bg-transparent text-text-secondary border-border-default',
};

const dotColors: Record<BadgeVariant, string> = {
  critical: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
  info: 'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  default: 'bg-text-tertiary',
  outline: 'bg-text-tertiary',
};

export function severityToBadgeVariant(severity: string): BadgeVariant {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'medium': return 'medium';
    case 'low': return 'low';
    default: return 'info';
  }
}

export function statusToBadgeVariant(status?: string): BadgeVariant {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'resolved': return 'success';
    case 'running':
    case 'investigating': return 'warning';
    case 'failed': return 'critical';
    case 'dismissed': return 'default';
    case 'queued': return 'info';
    case 'open': return 'critical';
    default: return 'default';
  }
}

export default function Badge({ variant = 'default', children, dot, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${variantStyles[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
