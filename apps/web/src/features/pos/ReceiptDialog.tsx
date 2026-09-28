import { Sale } from "./use-pos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Printer, CheckCircle2 } from "lucide-react";

interface Props {
  sale: Sale | null;
  businessName: string;
  onClose: () => void;
}

function peso(n: number | string) {
  return `₱${Number(n).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Line() {
  return <div className="border-t border-dashed border-border/70 my-2" />;
}

function Row({
  label,
  value,
  bold,
  muted,
  small,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={[
        "flex justify-between gap-3",
        bold ? "font-bold text-[13px]" : "",
        muted ? "text-muted-foreground" : "",
        small ? "text-[11px]" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="shrink-0">{label}</span>
      <span className="tabular-nums text-right">{value}</span>
    </div>
  );
}

export function ReceiptDialog({ sale, businessName, onClose }: Props) {
  if (!sale) return null;

  const hasChange = sale.changeDue !== null && Number(sale.changeDue) > 0;
  const saleDate = new Date(sale.paidAt);
  const itemCount = sale.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Dialog open={!!sale} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[340px] p-0 overflow-hidden print:max-w-none print:shadow-none print:border-none">
        {/* ─── Success banner ─── */}
        <div className="bg-primary/5 border-b border-primary/15 px-5 py-4 print:hidden">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-[14px] leading-tight">
                Payment successful
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {saleDate.toLocaleString("en-PH", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Receipt body ─── */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto bg-background">
          <div className="font-mono text-[12px] text-foreground leading-tight">
            <div className="text-center space-y-1">
              <p className="font-bold text-[15px] tracking-[0.15em] uppercase">
                {businessName}
              </p>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Official Receipt
              </p>
            </div>

            <Line />

            <div className="space-y-0.5 text-[11px]">
              <Row
                label="Receipt #"
                value={sale.id.slice(0, 8).toUpperCase()}
                muted
              />
              <Row
                label="Date"
                value={saleDate.toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })}
                muted
              />
              <Row
                label="Time"
                value={saleDate.toLocaleTimeString("en-PH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                muted
              />
              <Row label="Cashier" value="—" muted />
              {sale.customer && (
                <Row label="Customer" value={sale.customer.name} muted />
              )}
            </div>

            <Line />

            <div className="space-y-2.5">
              {sale.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between gap-2">
                    <span className="font-medium truncate">{item.name}</span>
                    <span className="tabular-nums shrink-0 font-medium">
                      {peso(item.lineTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                    <span>
                      {item.quantity} × {peso(item.unitPrice)}
                    </span>
                    <span className="tabular-nums">{item.sku}</span>
                  </div>
                </div>
              ))}
            </div>

            <Line />

            <div className="space-y-1">
              <Row
                label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
                value={peso(sale.subtotal)}
                muted
              />

              {Number(sale.discount) > 0 && (
                <Row label="Discount" value={`−${peso(sale.discount)}`} muted />
              )}

              {Number(sale.tax) > 0 && (
                <Row
                  label="VAT (included)"
                  value={peso(sale.tax)}
                  muted
                  small
                />
              )}
            </div>

            <Line />

            <div className="flex justify-between items-baseline py-1">
              <span className="font-bold text-[13px] tracking-wider">
                TOTAL
              </span>
              <span className="font-bold text-[16px] tabular-nums">
                {peso(sale.total)}
              </span>
            </div>

            <Line />

            <div className="space-y-1">
              <Row
                label={
                  sale.paymentMethod === "CASH" ? "Cash" : sale.paymentMethod
                }
                value={peso(sale.amountTendered ?? sale.total)}
                muted
              />
              {sale.paymentReference && (
                <Row
                  label="Reference"
                  value={sale.paymentReference}
                  muted
                  small
                />
              )}
              {hasChange && (
                <div className="flex justify-between items-baseline pt-1">
                  <span className="font-bold text-[12px]">CHANGE</span>
                  <span className="font-bold text-[14px] tabular-nums">
                    {peso(sale.changeDue!)}
                  </span>
                </div>
              )}
            </div>

            <Line />

            <div className="text-center space-y-1.5 pt-1">
              <p className="text-[11px]">Thank you for your business!</p>
              <p className="text-[9px] text-muted-foreground">
                This serves as your official receipt
              </p>
              <p className="text-[9px] text-muted-foreground tracking-widest pt-2">
                • • •
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 py-3.5 border-t border-border/60 bg-muted/20 print:hidden">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Close
          </Button>
          <Button onClick={() => window.print()} className="rounded-xl flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
