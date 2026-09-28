import { z } from "zod";

export const GroupByEnum = z.enum(["day", "week", "month"]);

export const ReportRangeQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  groupBy: GroupByEnum.default("day"),
});

export const TopProductsQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const ExportQuery = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type GroupByInput = z.infer<typeof GroupByEnum>;
