import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { SupplierInput, useCreateSupplier } from "./use-suppliers";
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

const empty: SupplierInput = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

export function SupplierDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState<SupplierInput>(empty);
  const create = useCreateSupplier();

  useEffect(() => {
    if (open) setForm(empty);
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const cleaned = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === "" ? undefined : v]),
      ) as SupplierInput;
      await create.mutateAsync(cleaned);
      toast.success("Supplier created");
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New supplier</DialogTitle>
          <DialogDescription>
            Add a supplier to your directory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sname">Company name</Label>
            <Input
              id="sname"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scontact">Contact person</Label>
              <Input
                id="scontact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sphone">Phone</Label>
              <Input
                id="sphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="semail">Email</Label>
            <Input
              id="semail"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saddress">Address</Label>
            <Input
              id="saddress"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
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
              {create.isPending ? "Saving..." : "Create supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
