import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Tags } from "lucide-react";
import { useProducts, useDeleteProduct, Product } from "./use-products";
import { ProductDialog } from "./ProductDialog";
import { ManageCategoriesDialog } from "@/features/categories/ManageCategoriesDialog";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function peso(n: number | string) {
  return `₱${Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const { data, isLoading } = useProducts(page, search);
  const del = useDeleteProduct();

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success("Product deleted");
      setDeleting(null);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">Manage your catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCategoriesOpen(true)}
            className="rounded-xl"
          >
            <Tags className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Categories</span>
          </Button>
          <Button onClick={openCreate} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New product</span>
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or SKU..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No products yet. Click "New product" to add one.
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.sku}
                    </TableCell>
                    <TableCell>
                      {p.category ? (
                        <Badge
                          variant="outline"
                          className="border-border/60 text-xs"
                        >
                          {p.category.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {peso(p.price)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {peso(p.cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          p.stock <= 5 ? "text-destructive font-medium" : ""
                        }
                      >
                        {p.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          p.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {p.status === "ACTIVE" ? "Active" : "Discontinued"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleting(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Page {data.page} of {data.pages} · {data.total} total
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
      />

      <ManageCategoriesDialog
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              "{deleting?.name}" will be hidden from your catalog. This can't be
              undone.
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
    </div>
  );
}
