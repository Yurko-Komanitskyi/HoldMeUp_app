import type { AscentType } from '@/entities/ascent/model/ascent';

export type StatsPeriodPreset = 'week' | 'month' | 'year' | 'all';

export interface StatsPeriodRange {
  dateFrom: string;
  dateTo: string;
  periodPreset?: StatsPeriodPreset;
}

export interface AscentStatsFiltersDto {
  gymId?: string;
}

export type AscentStatsByType = Partial<Record<AscentType, number>>;

export interface AscentStatsCurrent {
  totalAscents: number;
  successfulAscents: number;
  uniqueRoutes: number;
  byType: AscentStatsByType;
  maxGrade: string | { value?: string; label?: string } | null;
}

export interface AscentStatsComparisonBlock {
  totalAscents?: number;
  successfulAscents?: number;
  uniqueRoutes?: number;
}

export interface AscentStatsResponse {
  period: StatsPeriodRange;
  filters?: AscentStatsFiltersDto;
  gradeScale: string[];
  current: AscentStatsCurrent;
  previous?: AscentStatsCurrent;
  comparison?: AscentStatsComparisonBlock;
  dailyCounts: { date: string; count: number }[];
}

export interface GymStatsDateQuery {
  period?: StatsPeriodPreset;
  dateFrom?: string;
  dateTo?: string;
  sectorId?: string;
}

export interface GymStatsSummaryResponse {
  totalAscents: number;
  uniqueClimbers: number;
  uniqueRoutesWithAscents: number;
  successRatePercent: number;
  avgFeeling: number | null;
  feelingsRecorded: number;
  byType: AscentStatsByType;
  period: StatsPeriodRange;
  sectorId?: string;
  sectorName?: string;
}

export interface GymRoutesInventorySectorRow {
  sectorId: string;
  sectorName?: string;
  activeRoutes: number;
  archivedRoutes: number;
}

export interface GymRoutesInventoryResponse {
  bySector: GymRoutesInventorySectorRow[];
  totalRoutes: number;
  activeTotal: number;
  archivedTotal: number;
}
