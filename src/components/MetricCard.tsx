import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badge?: string;
  trend?: string;
  accent?: 'cyan' | 'lime' | 'pink' | 'amber' | 'purple';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  accent = 'cyan',
  icon
}) => {
  const accentText = {
    cyan: 'text-cyan-400',
    lime: 'text-lime-400',
    pink: 'text-pink-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
  }[accent];

  return (
    <div className="p-4 sm:p-5 rounded-lg bg-[#0c0e14] border border-zinc-800/80 hover:border-zinc-700 transition-colors duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-500">
            {label}
          </span>
          {icon && <span className={accentText}>{icon}</span>}
        </div>

        <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white block">
          {value}
        </span>
      </div>

      {subtext && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800/60 text-sm text-zinc-500">
          {subtext}
        </div>
      )}
    </div>
  );
};
