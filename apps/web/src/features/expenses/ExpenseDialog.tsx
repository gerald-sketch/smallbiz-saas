import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { ExpenseInput, useCreateExpense } from "./use-expenses";
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

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const empty: ExpenseInput = {
  category: "Rent",
  description: "",
  amount: 0,
  spentAt: new Date().toISOString().slice(0, 10),
};

const CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Supplies",
  "Transport",
  "Marketing",
  "Taxes",
  "Other",
];

export function ExpenseDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<ExpenseInput>(empty);
  const create = useCreateExpense();

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        ...form,
        spentAt: form.spentAt
          ? new Date(form.spentAt).toISOString()
          : undefined,
      });
      toast.success("Expense recorded");
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New expense</DialogTitle>
          <DialogDescription>Record a business expense.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ecat">Category</Label>
            <select
              id="ecat"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edesc">Description</Label>
            <Input
              id="edesc"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eamount">Amount (₱)</Label>
              <Input
                id="eamount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    amount: e.target.value === "" ? 0 : Number(e.target.value),
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edate">Date</Label>
              <Input
                id="edate"
                type="date"
                value={form.spentAt}
                onChange={(e) => setForm({ ...form, spentAt: e.target.value })}
              />
            </div>
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
              {create.isPending ? "Saving..." : "Record expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
