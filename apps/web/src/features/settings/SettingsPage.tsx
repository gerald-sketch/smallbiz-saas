import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Building2,
  Percent,
  Info,
  Upload,
  X,
  QrCode,
  ImageIcon,
} from "lucide-react";
import { useBusinessProfile, useUpdateBusinessProfile } from "./use-settings";
import { apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { fileToCompressedDataUrl } from "@/lib/image-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface QrUploadProps {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

function QrUpload({ label, value, onChange, disabled }: QrUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      onChange(dataUrl);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl border-2 border-dashed transition-colors",
          value ? "border-border/60 p-2" : "border-border/60 p-6",
          !disabled &&
            !value &&
            "cursor-pointer hover:border-primary/40 hover:bg-muted/30",
        )}
        onClick={() => !disabled && !value && inputRef.current?.click()}
      >
        {value ? (
          <>
            <img
              src={value}
              alt={label}
              className="max-h-48 w-auto rounded-lg"
            />
            {!disabled && (
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  title="Replace"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(null);
                  }}
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">
              {busy ? "Processing..." : "Click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG or JPG, will be resized automatically
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          disabled={disabled || busy}
        />
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { data, isLoading } = useBusinessProfile();
  const update = useUpdateBusinessProfile();
  const currentUser = useAuth((s) => s.user);
  const [name, setName] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [gcashQrUrl, setGcashQrUrl] = useState<string | null>(null);
  const [mayaQrUrl, setMayaQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setTaxRate(data.taxRate);
      setGcashQrUrl(data.gcashQrUrl);
      setMayaQrUrl(data.mayaQrUrl);
    }
  }, [data]);

  const canEdit = currentUser?.role === "OWNER";
  const dirty =
    data &&
    (name !== data.name ||
      taxRate !== data.taxRate ||
      gcashQrUrl !== data.gcashQrUrl ||
      mayaQrUrl !== data.mayaQrUrl);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({ name, taxRate, gcashQrUrl, mayaQrUrl });
      toast.success("Business settings saved");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (isLoading || !data) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Business profile and preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Business Profile
            </CardTitle>
            <CardDescription>
              {canEdit
                ? "Update your business details"
                : "Only owners can edit these settings"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bname">Business name</Label>
              <Input
                id="bname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax" className="flex items-center gap-1">
                <Percent className="h-3 w-3" /> Tax rate (VAT)
              </Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={taxRate || ""}
                onChange={(e) =>
                  setTaxRate(e.target.value === "" ? 0 : Number(e.target.value))
                }
                placeholder="0.12"
                disabled={!canEdit}
              />
              <p className="text-xs text-muted-foreground">
                Decimal between 0 and 1. Example: <code>0.12</code> for 12% VAT.
                Current: <strong>{(taxRate * 100).toFixed(2)}%</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" /> Payment QR Codes
            </CardTitle>
            <CardDescription>
              Upload your GCash and Maya QR codes. They'll be shown to customers
              at checkout when those payment methods are selected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <QrUpload
                label="GCash QR Code"
                value={gcashQrUrl}
                onChange={setGcashQrUrl}
                disabled={!canEdit}
              />
              <QrUpload
                label="Maya QR Code"
                value={mayaQrUrl}
                onChange={setMayaQrUrl}
                disabled={!canEdit}
              />
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
              <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">
                  How to get your QR code:
                </strong>{" "}
                Open the GCash or Maya app, tap <strong>Receive</strong> or{" "}
                <strong>QR</strong>, and save the QR code image to your phone.
                Upload it here. Customers scan it at the counter and pay
                directly to your account — the money never touches this
                platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!dirty || update.isPending}
              className="rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        )}
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Account Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Business ID</span>
            <span className="font-mono text-xs">{data.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Signed in as</span>
            <span className="font-medium">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Your role</span>
            <Badge
              variant={currentUser?.role === "OWNER" ? "default" : "secondary"}
            >
              {currentUser?.role}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
