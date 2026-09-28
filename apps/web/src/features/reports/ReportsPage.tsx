import { useState } from "react";
import {
  useSalesSummary,
  useProfitLoss,
  useInventoryValuation,
  useTopProducts,
} from "./use-reports";
import { api, apiErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Award,
  Download,
  Loader2,
} from "lucide-react";

function peso(n: number) {
  return `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ReportsPage() {
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");
  const [downloading, setDownloading] = useState(false);

  const summary = useSalesSummary(groupBy);
  const pl = useProfitLoss();
  const valuation = useInventoryValuation();
  const top = useTopProducts();

  async function downloadCsv() {
    setDownloading(true);
    try {
      const res = await api.get("/reports/export/sales.csv", {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Sales report downloaded");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setDownloading(false);
    }
  }

  const chartData = (summary.data?.rows ?? []).map((r) => ({
    period: groupBy === "month" ? r.period.slice(0, 7) : r.period.slice(5),
    total: r.total,
    subtotal: r.subtotal,
    discount: r.discount,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">
            Business insights and analytics
          </p>
        </div>
        <Button
          variant="outline"
          onClick={downloadCsv}
          disabled={downloading}
          className="rounded-xl"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {downloading ? "Downloading..." : "Export CSV"}
        </Button>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="top">Top Products</TabsTrigger>
        </TabsList>

        {/* ─── Sales ─── */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex gap-2">
            {(["day", "week", "month"] as const).map((g) => (
              <Button
                key={g}
                variant={groupBy === g ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy(g)}
                className="rounded-xl"
              >
                By {g}
              </Button>
            ))}
          </div>

          {summary.isLoading || !summary.data ? (
            <Skeleton className="h-96" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {summary.data.totalSales}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      transactions
                    </p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {peso(summary.data.grandTotal)}
                    </div>
                    <p className="text-xs text-muted-foreground">gross total</p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Sale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {peso(
                        summary.data.totalSales > 0
                          ? summary.data.grandTotal / summary.data.totalSales
                          : 0,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      per transaction
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="card-soft">
                <CardHeader>
                  <CardTitle>Sales by {groupBy}</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-12">
                      No sales data in this range.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="period"
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(v) => `₱${v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                          formatter={(value: unknown) => [
                            peso(Number(value ?? 0)),
                            "Total",
                          ]}
                        />
                        <Bar
                          dataKey="total"
                          fill="hsl(var(--primary))"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {summary.data.rows.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground py-8"
                        >
                          No data in this range.
                        </TableCell>
                      </TableRow>
                    )}
                    {summary.data.rows.map((r) => (
                      <TableRow key={r.period}>
                        <TableCell className="font-medium">
                          {r.period}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.salesCount}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {peso(r.subtotal)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {peso(r.discount)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {peso(r.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── Profit & Loss ─── */}
        <TabsContent value="pl" className="space-y-4">
          {pl.isLoading || !pl.data ? (
            <Skeleton className="h-64" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Revenue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {peso(pl.data.revenue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subtotal − discount
                    </p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">COGS</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {peso(pl.data.cogs)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cost of goods sold
                    </p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Gross Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${pl.data.grossProfit >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {peso(pl.data.grossProfit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Margin {pl.data.grossMargin}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {pl.data.netProfit >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      Net Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${pl.data.netProfit >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {peso(pl.data.netProfit)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Margin {pl.data.netMargin}%
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle>Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium">{peso(pl.data.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      − Cost of goods sold
                    </span>
                    <span className="font-medium">{peso(pl.data.cogs)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Gross profit</span>
                    <span className="font-medium">
                      {peso(pl.data.grossProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      − Operating expenses
                    </span>
                    <span className="font-medium">
                      {peso(pl.data.expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base">
                    <span className="font-bold">Net profit</span>
                    <span
                      className={`font-bold ${pl.data.netProfit >= 0 ? "text-primary" : "text-destructive"}`}
                    >
                      {peso(pl.data.netProfit)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── Inventory ─── */}
        <TabsContent value="inventory" className="space-y-4">
          {valuation.isLoading || !valuation.data ? (
            <Skeleton className="h-64" />
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" /> Total Units
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {valuation.data.totalUnits}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {valuation.data.itemCount} SKUs
                    </p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cost Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {peso(valuation.data.totalCostValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">at cost</p>
                  </CardContent>
                </Card>
                <Card className="card-soft">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Retail Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {peso(valuation.data.totalRetailValue)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Potential profit {peso(valuation.data.potentialProfit)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Cost Value</TableHead>
                      <TableHead className="text-right">Retail Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {valuation.data.items.map((i) => (
                      <TableRow key={i.productId}>
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {i.sku}
                        </TableCell>
                        <TableCell className="text-right">{i.stock}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {peso(i.cost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {peso(i.costValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {peso(i.retailValue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>

        {/* ─── Top Products ─── */}
        <TabsContent value="top" className="space-y-4">
          {top.isLoading || !top.data ? (
            <Skeleton className="h-64" />
          ) : top.data.rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No sales data yet.
            </p>
          ) : (
            <>
              <Card className="card-soft">
                <CardHeader>
                  <CardTitle>Top Products by Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={top.data.rows} layout="vertical">
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `₱${v}`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fontSize: 12 }}
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                        formatter={(value: unknown) => [
                          peso(Number(value ?? 0)),
                          "Revenue",
                        ]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="hsl(var(--primary))"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Units Sold</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top.data.rows.map((r, idx) => (
                      <TableRow key={r.productId}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <Award className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-muted-foreground">
                              {idx + 1}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.sku}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.unitsSold}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {peso(r.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
