import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = "Confirmar Exclusão",
  message = "Esta ação não pode ser desfeita. Deseja continuar?"
}: ConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <div className="text-center p-6">
          <AlertTriangle className="text-red-500 w-16 h-16 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-primary mb-2">{title}</h3>
          <p className="text-textLight mb-6">{message}</p>
          
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
