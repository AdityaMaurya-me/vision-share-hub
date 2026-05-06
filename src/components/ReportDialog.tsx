import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoId?: string;
}

const ReportDialog = ({ open, onOpenChange }: ReportDialogProps) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Please describe the issue before submitting");
      return;
    }
    toast.success("Report submitted. Thank you!");
    setReason("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl border-border bg-card">
        <SheetHeader className="text-left">
          <SheetTitle>Report this photo</SheetTitle>
          <SheetDescription>
            Tell us what's wrong. Our team will review your report.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the reason for reporting this photo…"
            rows={5}
            className="resize-none bg-secondary"
          />
        </div>
        <SheetFooter className="flex-row justify-end gap-2">
          <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Submit Report
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ReportDialog;
