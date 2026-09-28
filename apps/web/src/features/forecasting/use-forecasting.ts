import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type VelocityClass = "FAST" | "MEDIUM" | "SLOW" | "DEAD";
export type TrendDirection = "up" | "down" | "flat";
export type AlertUrgency = "CRITICAL" | "WARNING" | "WATCH";

export interface ForecastItem {
  productId: string;
  name: string;
  sku: string;
  stock: number;
  cost: number;
  price: number;
  stockValue: number;
  recentUnits: number;
  priorUnits: number;
  dailyVelocity: number;
  daysRemaining: number | null;
  stockoutDate: string | null;
  reorderPoint: number;
  suggestedOrderQty: number;
  velocityClass: VelocityClass;
  trend: number | null;
  trendDirection: TrendDirection;
}

export interface ReorderAlert extends ForecastItem {
  urgency: AlertUrgency;
}

export interface DailyPattern {
  day: string;
  units: number;
  revenue: number;
}

export interface ForecastingInsights {
  generatedAt: string;
  windowDays: number;
  leadTimeDays: number;
  safetyStockDays: number;
  summary: {
    totalProducts: number;
    activeProducts: number;
    deadProducts: number;
    totalStockValue: number;
    willRunOutSoonCount: number;
  };
  reorderAlerts: ReorderAlert[];
  fastMovers: ForecastItem[];
  slowMovers: ForecastItem[];
  deadStock: ForecastItem[];
  patterns: {
    busiestDay: string | null;
    busiestDayMultiplier: number;
    slowestDay: string | null;
    dailyBreakdown: DailyPattern[];
  };
}

export function useForecastingInsights() {
  return useQuery({
    queryKey: ["forecasting", "insights"],
    queryFn: async () =>
      (await api.get<ForecastingInsights>("/forecasting/insights")).data,
    staleTime: 5 * 60 * 1000, // 5 min — this is derived data
  });
}
