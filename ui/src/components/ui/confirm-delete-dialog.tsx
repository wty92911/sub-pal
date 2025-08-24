import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  subscriptionName?: string;
  title?: string;
  description?: string;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  subscriptionName,
  title = "Delete Subscription?",
  description
}: ConfirmDeleteDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const defaultDescription = subscriptionName
    ? `Are you sure you want to delete "${subscriptionName}"? This action cannot be undone.`
    : "Are you sure you want to delete this subscription? This action cannot be undone.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[320px] sm:max-w-[425px] mx-4 p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-destructive/10 flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left text-base sm:text-lg leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-left mt-1.5 sm:mt-2 text-sm leading-relaxed">
                {description || defaultDescription}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2 sm:pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto text-sm py-2 sm:py-2.5"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="w-full sm:w-auto text-sm py-2 sm:py-2.5"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
