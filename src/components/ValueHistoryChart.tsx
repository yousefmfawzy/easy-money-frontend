import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { HistoryPoint } from '../types/api';
import { formatLocalDateTime } from '../lib/datetime';
import { formatCurrency } from '../lib/money';
import EmptyState from './EmptyState';
import styles from './ValueHistoryChart.module.css';

interface ValueHistoryChartProps {
  history: HistoryPoint[];
  currency: string;
}

export default function ValueHistoryChart({ history, currency }: ValueHistoryChartProps) {
  if (!history || history.length === 0) {
    return <EmptyState title="No price history yet" description="There are no recorded price changes for this ETF." />;
  }

  interface ChartPoint {
    t: string;
    v: number;
    raw: string;
  }

  // Important and deliberate: Number() here is used only to give Recharts a plottable y-coordinate.
  // Every value rendered as text — the tooltip figure especially — must come from the original raw
  // decimal string via formatCurrency(raw, currency), never from the numeric field.
  const data: ChartPoint[] = history.map(p => ({
    t: formatLocalDateTime(p.created_at),
    v: Number(p.new_value),
    raw: p.new_value
  }));

  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ payload: ChartPoint }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    const props = payload;
    if (active && props && props.length > 0) {
      const { raw, t } = props[0].payload;
      return (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTime}>{t}</div>
          <div className={styles.tooltipValue}>{formatCurrency(raw, currency)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-bg-base)" />
          <XAxis 
            dataKey="t" 
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }}
            tickFormatter={(val) => val.toString()}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="v" 
            stroke="var(--color-text-primary)" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-text-primary)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
