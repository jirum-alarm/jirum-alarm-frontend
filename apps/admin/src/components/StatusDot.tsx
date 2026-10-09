export type StatusLevel = 'ok' | 'warn' | 'danger' | 'muted';

const COLOR: Record<StatusLevel, string> = {
  ok: 'bg-success',
  warn: 'bg-warning',
  danger: 'bg-danger',
  muted: 'bg-bodydark2',
};

const StatusDot = ({ level }: { level: StatusLevel }) => (
  <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${COLOR[level]}`} />
);

export default StatusDot;
