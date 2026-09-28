import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import {
  Employee,
  CreateEmployeeInput,
  Role,
  useCreateEmployee,
  useUpdateEmployee,
} from "./use-employees";
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
  employee?: Employee | null;
}

export function EmployeeDialog({ open, onOpenChange, employee }: Props) {
  const isEdit = !!employee;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("STAFF");
  const create = useCreateEmployee();
  const update = useUpdateEmployee();

  useEffect(() => {
    if (!open) return;
    if (employee) {
      setName(employee.name);
      setEmail(employee.email);
      setPassword("");
      setRole(employee.role);
    } else {
      setName("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
    }
  }, [open, employee]);

  const pending = create.isPending || update.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (isEdit && employee) {
        await update.mutateAsync({ id: employee.id, name, role });
        toast.success("Employee updated");
      } else {
        const input: CreateEmployeeInput = { name, email, password, role };
        await create.mutateAsync(input);
        toast.success("Employee added");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit employee" : "New employee"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update employee details."
              : "Add a staff account to your business."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ename">Name</Label>
            <Input
              id="ename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eemail">Email</Label>
            <Input
              id="eemail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEdit}
            />
          </div>
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="epassword">Password</Label>
              <Input
                id="epassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Min 8 chars, one uppercase, one lowercase, one digit
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="OWNER">Owner</SelectItem>
              </SelectContent>
            </Select>
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
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
