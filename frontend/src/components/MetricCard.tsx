import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function MetricCard({
  label,
  value,
  detail,
  trend,
  icon: Icon,
  iconClass = 'metric-icon-default',
}: {
  label: string;
  value: string;
  detail: string;
  trend?: string;
  icon: LucideIcon;
  iconClass?: string;
}) {
  const down = trend?.startsWith('-');

  return (
    <div className="metric-card">
      <div className="metric-card-glow" />

      <div className="metric-card-content">
        <div className="metric-card-top">
          <div className="metric-card-heading">
            <p className="metric-label">{label}</p>

            <p className="metric-value">
              {value}
            </p>
          </div>

          <div className={`metric-icon ${iconClass}`}>
            <Icon size={18} strokeWidth={1.8} />
          </div>
        </div>

        <div className="metric-card-bottom">
          {trend && (
            <span
              className={`metric-trend ${
                down ? 'metric-trend-down' : 'metric-trend-up'
              }`}
            >
              {down ? (
                <ArrowDownRight size={13} />
              ) : (
                <ArrowUpRight size={13} />
              )}

              {trend.replace('-', '')}
            </span>
          )}

          <span className="metric-detail">
            {detail}
          </span>
        </div>
      </div>
    </div>
  );
}