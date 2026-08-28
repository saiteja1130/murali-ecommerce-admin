import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  subValue,
  change,
  icon: Icon,
  badge,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between">
      {/* Top Header Row with Label & Icon */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] font-semibold text-[#A68758] font-sans truncate">
            {label}
          </span>
          {Icon && (
            <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-[#1A1A1A] group-hover:border-[#C8A87C] group-hover:text-[#C8A87C] transition-colors shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Primary Metric Value */}
        <div className="font-mono-data text-xl sm:text-2xl font-bold text-[#1A1A1A] mt-2 tracking-tight truncate" title={typeof value === 'string' ? value : undefined}>
          {value}
        </div>

        {/* Subvalue Description */}
        {subValue && (
          <div className="text-[11px] text-[#6B6864] mt-1 truncate" title={subValue}>
            {subValue}
          </div>
        )}
      </div>

      {/* Bottom Footer Row with Trends & Badges */}
      <div className="mt-4 pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs gap-1">
        {change ? (
          <div className="flex items-center gap-1 font-medium min-w-0">
            {change.isPositive ? (
              <>
                <TrendingUp className="w-3 h-3 text-[#4A7A5E] shrink-0" />
                <span className="text-[#4A7A5E] font-mono-data text-[11px] font-semibold">{change.value}</span>
                <span className="text-[#6B6864] text-[10px] hidden sm:inline truncate">vs last period</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-[#A5432F] shrink-0" />
                <span className="text-[#A5432F] font-mono-data text-[11px] font-semibold">{change.value}</span>
                <span className="text-[#6B6864] text-[10px] hidden sm:inline truncate">vs last period</span>
              </>
            )}
          </div>
        ) : (
          <div className="text-[#6B6864] text-[10px] truncate">Real-time metrics</div>
        )}

        {badge && (
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider shrink-0 ${
              badge === 'Urgent' || badge === 'Low'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-[#C8A87C]/15 text-[#A68758]'
            }`}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
