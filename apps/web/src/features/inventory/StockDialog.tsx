import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { Product } from "@/features/products/use-products";
import { useAdjustStock, useStockIn, useStockOut } from "./use-inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
}

export function StockDialog({ open, onOpenChange, product }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState("");

  const stockIn = useStockIn();
  const stockOut = useStockOut();
  const adjust = useAdjustStock();

  useEffect(() => {
    if (open) {
      setQuantity(1);
      setDelta(0);
      setReason("");
    }
  }, [open, product]);

  if (!product) return null;

  const pending = stockIn.isPending || stockOut.isPending || adjust.isPending;

  async function handleStockIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await stockIn.mutateAsync({
        productId: product!.id,
        quantity,
        reason: reason || "Stock in",
      });
      toast.success(`Stock: ${result.previous} → ${result.product.stock}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleStockOut(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await stockOut.mutateAsync({
        productId: product!.id,
        quantity,
        reason: reason || "Stock out",
      });
      toast.success(`Stock: ${result.previous} → ${result.product.stock}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (delta === 0) {
      toast.error("Delta cannot be 0");
      return;
    }
    try {
      const result = await adjust.mutateAsync({
        productId: product!.id,
        delta,
        reason: reason || "Manual adjustment",
      });
      toast.success(`Stock: ${result.previous} → ${result.product.stock}`);
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            {product.name} · <span className="font-mono">{product.sku}</span> ·
            current stock: <strong>{product.stock}</strong>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="in" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="in">Stock In</TabsTrigger>
            <TabsTrigger value="out">Stock Out</TabsTrigger>
            <TabsTrigger value="adjust">Adjust</TabsTrigger>
          </TabsList>

          {/* ─── Stock In ─── */}
          <TabsContent value="in">
            <form onSubmit={handleStockIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="in-qty">Quantity to add</Label>
                <Input
                  id="in-qty"
                  type="number"
                  min="1"
                  value={quantity || ""}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value === ""
                        ? 1
                        : Math.max(1, Number(e.target.value)),
                    )
                  }
                  placeholder="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="in-reason">Reason</Label>
                <Input
                  id="in-reason"
                  placeholder="e.g., Received from supplier"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending
                    ? "Adding..."
                    : `Add ${quantity} → ${product.stock + quantity} total`}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* ─── Stock Out ─── */}
          <TabsContent value="out">
            <form onSubmit={handleStockOut} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="out-qty">Quantity to remove</Label>
                <Input
                  id="out-qty"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity || ""}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value === ""
                        ? 1
                        : Math.max(1, Number(e.target.value)),
                    )
                  }
                  placeholder="1"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Available: {product.stock}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="out-reason">Reason</Label>
                <Input
                  id="out-reason"
                  placeholder="e.g., Damaged, Shrinkage, Internal use"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={pending || quantity > product.stock}
                >
                  {pending
                    ? "Removing..."
                    : `Remove ${quantity} → ${Math.max(0, product.stock - quantity)} total`}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* ─── Adjust ─── */}
          <TabsContent value="adjust">
            <form onSubmit={handleAdjust} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adj-delta">Delta (use negative for loss)</Label>
                <Input
                  id="adj-delta"
                  type="number"
                  value={delta || ""}
                  onChange={(e) =>
                    setDelta(e.target.value === "" ? 0 : Number(e.target.value))
                  }
                  placeholder="0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  New stock will be: <strong>{product.stock + delta}</strong>
                  {product.stock + delta < 0 && (
                    <span className="text-destructive ml-2">
                      ⚠ Would go negative
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adj-reason">Reason</Label>
                <Input
                  id="adj-reason"
                  placeholder="e.g., Physical count correction"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={pending || product.stock + delta < 0}
                >
                  {pending
                    ? "Adjusting..."
                    : `Apply ${delta > 0 ? "+" : ""}${delta}`}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
