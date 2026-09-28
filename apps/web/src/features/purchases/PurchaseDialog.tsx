import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { apiErrorMessage } from "@/lib/api";
import { useCreatePurchase, PurchaseInput } from "./use-purchases";
import { useSuppliers } from "@/features/suppliers/use-suppliers";
import { useProducts, Product } from "@/features/products/use-products";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface DraftLine {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitCost: number;
}

function peso(n: number) {
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function PurchaseDialog({ open, onOpenChange }: Props) {
  const [supplierId, setSupplierId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [picking, setPicking] = useState(false);

  const { data: suppliers = [] } = useSuppliers("");
  const { data: productsPage } = useProducts(1, "");
  const products = productsPage?.items ?? [];

  const create = useCreatePurchase();

  useEffect(() => {
    if (open) {
      setSupplierId("");
      setReference("");
      setNotes("");
      setLines([]);
      setPicking(false);
    }
  }, [open]);

  function addLine(p: Product) {
    if (lines.find((l) => l.productId === p.id)) return;
    setLines([
      ...lines,
      {
        productId: p.id,
        name: p.name,
        sku: p.sku,
        quantity: 1,
        unitCost: Number(p.cost),
      },
    ]);
    setPicking(false);
  }

  function updateLine(productId: string, patch: Partial<DraftLine>) {
    setLines(
      lines.map((l) => (l.productId === productId ? { ...l, ...patch } : l)),
    );
  }

  function removeLine(productId: string) {
    setLines(lines.filter((l) => l.productId !== productId));
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unitCost, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Select a supplier");
      return;
    }
    if (lines.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    try {
      const input: PurchaseInput = {
        supplierId,
        reference: reference || undefined,
        notes: notes || undefined,
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          unitCost: l.unitCost,
        })),
      };
      await create.mutateAsync(input);
      toast.success("Purchase order created");
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New purchase order</DialogTitle>
          <DialogDescription>
            Create a PO. Stock updates when you receive it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ref">Reference #</Label>
              <Input
                id="ref"
                placeholder="PO-2026-001"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPicking(!picking)}
              >
                <Plus className="h-3 w-3 mr-1" /> Add item
              </Button>
            </div>

            {picking && (
              <div className="border rounded-lg max-h-48 overflow-y-auto p-2 space-y-1 bg-muted/20">
                {products.length === 0 && (
                  <p className="text-sm text-muted-foreground p-2">
                    No products
                  </p>
                )}
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addLine(p)}
                    disabled={!!lines.find((l) => l.productId === p.id)}
                    className="w-full text-left p-2 hover:bg-background rounded text-sm disabled:opacity-40"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">
                        cost {peso(Number(p.cost))}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{p.sku}</div>
                  </button>
                ))}
              </div>
            )}

            {lines.length > 0 && (
              <div className="border rounded-lg divide-y">
                {lines.map((l) => (
                  <div
                    key={l.productId}
                    className="p-3 grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <p className="text-sm font-medium truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.sku}</p>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="1"
                        value={l.quantity || ""}
                        onChange={(e) =>
                          updateLine(l.productId, {
                            quantity:
                              e.target.value === ""
                                ? 1
                                : Math.max(1, Number(e.target.value)),
                          })
                        }
                        placeholder="1"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.unitCost || ""}
                        onChange={(e) =>
                          updateLine(l.productId, {
                            unitCost:
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value),
                          })
                        }
                        placeholder="0.00"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeLine(l.productId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold">{peso(total)}</span>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating..." : "Create PO"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
