import React from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
        <p className="text-sm text-text-secondary mt-1 max-w-2xl">{description}</p>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
