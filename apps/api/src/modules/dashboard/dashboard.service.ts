import { prisma } from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BUSINESS_UTC_OFFSET_MS = 8 * 60 * 60 * 1000;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function startOfBusinessDay(d: Date): Date {
  const x = new Date(d.getTime() + BUSINESS_UTC_OFFSET_MS);
  x.setUTCHours(0, 0, 0, 0);
  return new Date(x.getTime() - BUSINESS_UTC_OFFSET_MS);
}

function startOfBusinessMonth(d: Date): Date {
  const x = new Date(d.getTime() + BUSINESS_UTC_OFFSET_MS);
  x.setUTCDate(1);
  x.setUTCHours(0, 0, 0, 0);
  return new Date(x.getTime() - BUSINESS_UTC_OFFSET_MS);
}

// ─── Overall business summary ──────────────────────────
export async function summary(businessId: string) {
  const now = new Date();
  const todayStart = startOfBusinessDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY);
  const monthStart = startOfBusinessMonth(now);
  const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * MS_PER_DAY);

  const mtdSales = await prisma.sale.aggregate({
    where: { businessId, deletedAt: null, paidAt: { gte: monthStart } },
    _sum: { total: true },
    _count: true,
  });

  const mtdExpenses = await prisma.expense.aggregate({
    where: { businessId, deletedAt: null, spentAt: { gte: monthStart } },
    _sum: { amount: true },
  });

  const [inventoryRow] = await prisma.$queryRaw<
    Array<{
      units: number;
      costValue: string;
      retailValue: string;
      itemCount: number;
    }>
  >`
    SELECT
      COALESCE(SUM(stock), 0)::int AS units,
      COALESCE(SUM(stock * cost), 0)::text AS "costValue",
      COALESCE(SUM(stock * price), 0)::text AS "retailValue",
      COUNT(*)::int AS "itemCount"
    FROM "Product"
    WHERE "businessId"::text = ${businessId}
      AND "deletedAt" IS NULL
      AND status = 'ACTIVE'
  `;

  const lowStockCount = await prisma.product.count({
    where: { businessId, deletedAt: null, status: "ACTIVE", stock: { lte: 5 } },
  });

  const lowStockItems = await prisma.product.findMany({
    where: { businessId, deletedAt: null, status: "ACTIVE", stock: { lte: 5 } },
    select: { id: true, name: true, sku: true, stock: true },
    orderBy: { stock: "asc" },
    take: 5,
  });

  const [customerCount, supplierCount, employeeCount] = await Promise.all([
    prisma.customer.count({ where: { businessId, deletedAt: null } }),
    prisma.supplier.count({ where: { businessId, deletedAt: null } }),
    prisma.user.count({ where: { businessId, deletedAt: null } }),
  ]);

  const pendingPOs = await prisma.purchase.count({
    where: { businessId, deletedAt: null, status: "PENDING" },
  });

  const recentSales = await prisma.sale.findMany({
    where: { businessId, deletedAt: null },
    orderBy: { paidAt: "desc" },
    take: 10,
    select: {
      id: true,
      total: true,
      paymentMethod: true,
      paidAt: true,
      customer: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const daily = await prisma.$queryRaw<
    Array<{ day: string; total: string; count: number }>
  >`
    SELECT
      TO_CHAR(
        DATE_TRUNC('day', "paidAt" + INTERVAL '8 hours'),
        'YYYY-MM-DD'
      ) AS day,
      COALESCE(SUM(total), 0)::text AS total,
      COUNT(*)::int AS count
    FROM "Sale"
    WHERE "businessId"::text = ${businessId}
      AND "deletedAt" IS NULL
      AND "paidAt" >= ${thirtyDaysAgo}
      AND "paidAt" < ${tomorrowStart}
    GROUP BY DATE_TRUNC('day', "paidAt" + INTERVAL '8 hours')
    ORDER BY DATE_TRUNC('day', "paidAt" + INTERVAL '8 hours') ASC
  `;
  const dailyByDay = new Map(daily.map((row) => [row.day, row]));
  const todayDay = new Date(now.getTime() + BUSINESS_UTC_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
  const todaySales = dailyByDay.get(todayDay);
  const daily30d = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(
      thirtyDaysAgo.getTime() + index * MS_PER_DAY + BUSINESS_UTC_OFFSET_MS,
    )
      .toISOString()
      .slice(0, 10);
    const row = dailyByDay.get(day);
    return {
      day,
      total: round2(Number(row?.total ?? 0)),
      count: row?.count ?? 0,
    };
  });

  const revenueMTD = Number(mtdSales._sum.total ?? 0);
  const expensesMTD = Number(mtdExpenses._sum.amount ?? 0);

  return {
    today: {
      salesTotal: round2(Number(todaySales?.total ?? 0)),
      salesCount: todaySales?.count ?? 0,
    },
    mtd: {
      revenue: round2(revenueMTD),
      salesCount: mtdSales._count,
      expenses: round2(expensesMTD),
      profit: round2(revenueMTD - expensesMTD),
    },
    inventory: {
      itemCount: inventoryRow?.itemCount ?? 0,
      units: inventoryRow?.units ?? 0,
      costValue: round2(Number(inventoryRow?.costValue ?? 0)),
      retailValue: round2(Number(inventoryRow?.retailValue ?? 0)),
      lowStockCount,
      lowStockItems,
    },
    counts: {
      customers: customerCount,
      suppliers: supplierCount,
      employees: employeeCount,
      pendingPurchaseOrders: pendingPOs,
    },
    recentSales,
    daily30d,
  };
}

// ─── Staff Performance Overview ────────────────────────
export async function staffOverview(businessId: string) {
  const now = new Date();
  const todayStart = startOfBusinessDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY);
  const monthStart = startOfBusinessMonth(now);

  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      salesCount: number;
      revenue: string;
      todayCount: number;
      todayRevenue: string;
      mtdCount: number;
      mtdRevenue: string;
      lastSaleAt: Date | null;
    }>
  >`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role::text AS role,
      COUNT(s.id)::int AS "salesCount",
      COALESCE(SUM(s.total), 0)::text AS revenue,
      COUNT(CASE WHEN s."paidAt" >= ${todayStart} AND s."paidAt" < ${tomorrowStart} THEN 1 END)::int AS "todayCount",
      COALESCE(
        SUM(CASE WHEN s."paidAt" >= ${todayStart} AND s."paidAt" < ${tomorrowStart} THEN s.total ELSE 0 END),
        0
      )::text AS "todayRevenue",
      COUNT(CASE WHEN s."paidAt" >= ${monthStart} THEN 1 END)::int AS "mtdCount",
      COALESCE(
        SUM(CASE WHEN s."paidAt" >= ${monthStart} THEN s.total ELSE 0 END),
        0
      )::text AS "mtdRevenue",
      MAX(s."paidAt") AS "lastSaleAt"
    FROM "User" u
    LEFT JOIN "Sale" s
      ON s."userId" = u.id
      AND s."deletedAt" IS NULL
    WHERE u."businessId"::text = ${businessId}
      AND u."deletedAt" IS NULL
    GROUP BY u.id, u.name, u.email, u.role
    ORDER BY COALESCE(SUM(s.total), 0) DESC, u.name ASC
  `;

  return rows.map((r) => {
    const revenue = Number(r.revenue);
    return {
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role as "OWNER" | "MANAGER" | "STAFF",
      salesCount: r.salesCount,
      revenue: round2(revenue),
      avgSale: r.salesCount > 0 ? round2(revenue / r.salesCount) : 0,
      todayCount: r.todayCount,
      todayRevenue: round2(Number(r.todayRevenue)),
      mtdCount: r.mtdCount,
      mtdRevenue: round2(Number(r.mtdRevenue)),
      lastSaleAt: r.lastSaleAt,
    };
  });
}

export async function todaySalesTotal(businessId: string) {
  const todayStart = startOfBusinessDay(new Date());
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY);
  const result = await prisma.sale.aggregate({
    where: {
      businessId,
      deletedAt: null,
      paidAt: { gte: todayStart, lt: tomorrowStart },
    },
    _sum: { total: true },
  });
  return round2(Number(result._sum.total ?? 0));
}

// ─── Individual Staff Detail ───────────────────────────
export async function staffDetail(businessId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, businessId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "Staff member not found");
  }

  const now = new Date();
  const todayStart = startOfBusinessDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + MS_PER_DAY);
  const monthStart = startOfBusinessMonth(now);
  const fourteenDaysAgo = new Date(todayStart.getTime() - 13 * MS_PER_DAY);

  const [totalAgg, todayAgg, mtdAgg] = await Promise.all([
    prisma.sale.aggregate({
      where: { businessId, userId, deletedAt: null },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        businessId,
        userId,
        deletedAt: null,
        paidAt: { gte: todayStart, lt: tomorrowStart },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        businessId,
        userId,
        deletedAt: null,
        paidAt: { gte: monthStart },
      },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  const daily = await prisma.$queryRaw<
    Array<{ day: string; total: string; count: number }>
  >`
    SELECT
      TO_CHAR(
        DATE_TRUNC('day', "paidAt" + INTERVAL '8 hours'),
        'YYYY-MM-DD'
      ) AS day,
      COALESCE(SUM(total), 0)::text AS total,
      COUNT(*)::int AS count
    FROM "Sale"
    WHERE "businessId"::text = ${businessId}
      AND "userId"::text = ${userId}
      AND "deletedAt" IS NULL
      AND "paidAt" >= ${fourteenDaysAgo}
    GROUP BY DATE_TRUNC('day', "paidAt" + INTERVAL '8 hours')
    ORDER BY DATE_TRUNC('day', "paidAt" + INTERVAL '8 hours') ASC
  `;

  const topProducts = await prisma.$queryRaw<
    Array<{
      productId: string;
      name: string;
      sku: string;
      unitsSold: number;
      revenue: string;
    }>
  >`
    SELECT
      si."productId",
      si.name,
      si.sku,
      SUM(si.quantity)::int AS "unitsSold",
      SUM(si."lineTotal")::text AS revenue
    FROM "SaleItem" si
    JOIN "Sale" s ON s.id = si."saleId"
    WHERE s."businessId"::text = ${businessId}
      AND s."userId"::text = ${userId}
      AND s."deletedAt" IS NULL
    GROUP BY si."productId", si.name, si.sku
    ORDER BY SUM(si.quantity) DESC
    LIMIT 5
  `;

  const recentSales = await prisma.sale.findMany({
    where: { businessId, userId, deletedAt: null },
    orderBy: { paidAt: "desc" },
    take: 10,
    select: {
      id: true,
      total: true,
      paymentMethod: true,
      paidAt: true,
      customer: { select: { name: true } },
    },
  });

  const paymentBreakdown = await prisma.sale.groupBy({
    by: ["paymentMethod"],
    where: { businessId, userId, deletedAt: null },
    _sum: { total: true },
    _count: true,
  });

  const totalRevenue = Number(totalAgg._sum.total ?? 0);

  return {
    staff: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "OWNER" | "MANAGER" | "STAFF",
      joinedAt: user.createdAt,
      salesCount: totalAgg._count,
      revenue: round2(totalRevenue),
      avgSale: totalAgg._count > 0 ? round2(totalRevenue / totalAgg._count) : 0,
      todayCount: todayAgg._count,
      todayRevenue: round2(Number(todayAgg._sum.total ?? 0)),
      mtdCount: mtdAgg._count,
      mtdRevenue: round2(Number(mtdAgg._sum.total ?? 0)),
    },
    daily14d: daily.map((d) => ({
      day: d.day,
      total: round2(Number(d.total)),
      count: d.count,
    })),
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      name: p.name,
      sku: p.sku,
      unitsSold: p.unitsSold,
      revenue: round2(Number(p.revenue)),
    })),
    recentSales: recentSales.map((s) => ({
      id: s.id,
      total: Number(s.total),
      paymentMethod: s.paymentMethod,
      paidAt: s.paidAt,
      customerName: s.customer?.name ?? "Walk-in",
    })),
    paymentBreakdown: paymentBreakdown.map((p) => ({
      method: p.paymentMethod,
      count: p._count,
      total: round2(Number(p._sum.total ?? 0)),
    })),
  };
}
