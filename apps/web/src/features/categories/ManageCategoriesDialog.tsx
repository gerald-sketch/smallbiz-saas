import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Tag } from "lucide-react";
import { apiErrorMessage } from "@/lib/api";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "./use-categories";
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

export function ManageCategoriesDialog({ open, onOpenChange }: Props) {
  const { data: categories = [], isLoading } = useCategories();
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<(typeof categories)[number] | null>(
    null,
  );

  const create = useCreateCategory();
  const del = useDeleteCategory();

  useEffect(() => {
    if (open) setName("");
  }, [open]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await create.mutateAsync({ name: trimmed });
      toast.success(`Category "${trimmed}" added`);
      setName("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success(`Category "${deleting.name}" deleted`);
      setDeleting(null);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage categories</DialogTitle>
            <DialogDescription>
              Categories help organize products on the POS screen.
            </DialogDescription>
          </DialogHeader>

          {/* Add new */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cat-name" className="sr-only">
                Category name
              </Label>
              <Input
                id="cat-name"
                placeholder="e.g. Coffee, Pastries, Cakes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={64}
              />
            </div>
            <Button
              type="submit"
              disabled={!name.trim() || create.isPending}
              className="rounded-xl shrink-0"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {create.isPending ? "Adding..." : "Add"}
            </Button>
          </form>

          {/* List */}
          <div className="rounded-xl border border-border/60 divide-y divide-border/40 max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No categories yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add one above to get started
                </p>
              </div>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {cat._count.products}{" "}
                        {cat._count.products === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setDeleting(cat)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              "{deleting?.name}" will be removed.{" "}
              {deleting?._count.products ?? 0}{" "}
              {(deleting?._count.products ?? 0) === 1 ? "product" : "products"}{" "}
              will become uncategorized.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={del.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={del.isPending}
            >
              {del.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
