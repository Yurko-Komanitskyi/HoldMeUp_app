export const ROUTE_CARD_STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-500/15 text-emerald-600',
    dotClass: 'bg-emerald-500',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-400/15 text-slate-500',
    dotClass: 'bg-slate-400',
  },
  draft: {
    label: 'Draft',
    className: 'bg-amber-400/15 text-amber-600',
    dotClass: 'bg-amber-400',
  },
};
