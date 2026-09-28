import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { useEmployees, useDeleteEmployee, Employee } from "./use-employees";
import { EmployeeDialog } from "./EmployeeDialog";
import { ResetPasswordDialog } from "./ResetPasswordDialog";
import { useAuth } from "@/lib/auth-store";
import { apiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

const ROLE_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  STAFF: "Staff",
};

export function EmployeesPage() {
  const currentUser = useAuth((s) => s.user);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const [resetting, setResetting] = useState<Employee | null>(null);

  const { data, isLoading } = useEmployees();
  const del = useDeleteEmployee();
  const canManage = currentUser?.role === "OWNER";

  function handleCreateClick() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting.id);
      toast.success("Employee removed");
      setDeleting(null);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>
          <p className="text-sm text-muted-foreground">
            Staff accounts and permissions
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreateClick} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" /> New employee
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {canManage && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground py-8"
                  >
                    No employees yet.
                  </TableCell>
                </TableRow>
              )}
              {data?.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.name}
                    {e.id === currentUser?.id && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {e.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={e.role === "OWNER" ? "default" : "secondary"}
                    >
                      {ROLE_LABEL[e.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {e.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reset password"
                          onClick={() => setResetting(e)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(e);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {e.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleting(e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={editing}
      />

      <ResetPasswordDialog
        open={!!resetting}
        onOpenChange={(v) => !v && setResetting(null)}
        employee={resetting}
      />

      <Dialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove employee?</DialogTitle>
            <DialogDescription>
              "{deleting?.name}" will lose access to this business.
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
              {del.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
