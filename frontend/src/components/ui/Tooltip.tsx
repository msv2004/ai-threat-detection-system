import React, { useState, useRef } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children || <Info className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help transition-colors" />}
      {visible && (
        <span
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} px-3 py-2 text-xs text-text-primary bg-surface-4 border border-border-default rounded-lg shadow-xl max-w-xs whitespace-normal pointer-events-none animate-fade-in`}
          style={{ animationDuration: '0.15s' }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export function InfoTip({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <Info className="w-3.5 h-3.5 text-text-tertiary hover:text-text-secondary cursor-help transition-colors" />
    </Tooltip>
  );
}
