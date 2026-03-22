/** Колір грейду для бейджа (узгоджено з heat-логікою картки). */
export function gradeColorForRouteGrade(grade: string): string {
  const n = parseFloat(grade);
  if (Number.isNaN(n)) return '#64748b';
  if (n <= 6) return '#22c55e';
  if (n <= 7) return '#f59e0b';
  if (n <= 8) return '#f97316';
  return '#ef4444';
}
