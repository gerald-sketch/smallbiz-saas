import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  method: "GCASH" | "MAYA";
  qrUrl: string | null;
  amount: number;
}

function peso(n: number) {
  return `₱${n.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const LABELS = {
  GCASH: "GCash",
  MAYA: "Maya",
};

export function PaymentQrDialog({
  open,
  onOpenChange,
  method,
  qrUrl,
  amount,
}: Props) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!open) setZoom(false);
  }, [open]);

  const label = LABELS[method];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          zoom
            ? "max-w-2xl w-[calc(100vw-1rem)] p-0 overflow-hidden"
            : "max-w-md w-[calc(100vw-1rem)] p-0 overflow-hidden"
        }
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogTitle className="text-lg text-center">
            Scan to pay with {label}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6">
          {qrUrl ? (
            <button
              type="button"
              onClick={() => setZoom(!zoom)}
              className="block w-full"
            >
              <div className="rounded-2xl border border-border/60 p-4 bg-white">
                <img
                  src={qrUrl}
                  alt={`${label} QR code`}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                {zoom ? "Tap to shrink" : "Tap to enlarge"}
              </p>
            </button>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="h-7 w-7 text-amber-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </div>
              <p className="font-medium mb-1">No {label} QR code uploaded</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ask the owner to upload it in{" "}
                <strong>Settings → Payment QR Codes</strong>.
              </p>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount due</span>
              <span className="text-2xl font-bold tabular-nums">
                {peso(amount)}
              </span>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            After payment, ask the customer to show the confirmation screen,
            then enter the reference number.
          </p>
        </div>

        <div className="px-6 pb-6">
          <Button
            className="w-full h-11 rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
