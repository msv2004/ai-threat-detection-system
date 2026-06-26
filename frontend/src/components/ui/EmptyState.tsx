import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-xl bg-surface-2 border border-border-subtle flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-text-tertiary" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-md mb-6 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
