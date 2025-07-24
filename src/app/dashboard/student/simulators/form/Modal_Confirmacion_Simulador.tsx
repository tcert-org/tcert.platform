import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  unansweredCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  open,
  unansweredCount,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <h3 className="text-lg font-bold">
            {unansweredCount > 0
              ? "Preguntas sin responder"
              : "¿Enviar examen?"}
          </h3>
        </DialogHeader>
        <div className="py-4 text-sm text-gray-700">
          {unansweredCount > 0
            ? `Aún tienes ${unansweredCount} preguntas sin responder. ¿Estás seguro de que deseas enviar el examen?`
            : "¿Estás seguro de que deseas enviar el examen y finalizar el intento?"}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>
            Enviar examen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
