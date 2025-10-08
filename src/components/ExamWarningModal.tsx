"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Play } from "lucide-react";

interface ExamWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExamWarningModal({
  isOpen,
  onClose,
  onConfirm,
}: ExamWarningModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-red-600">
            <ShieldAlert className="w-6 h-6" />
            Aviso Importante - Supervisión del Examen
          </DialogTitle>
          <DialogDescription className="text-left mt-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 font-medium mb-4">
                Nuestros exámenes cuentan con tecnología avanzada de supervisión
                digital que detecta comportamientos inusuales, incluyendo:
              </p>

              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>
                    Cambiar de pestaña o salir de la página del examen.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Intentos de desconexión deliberada.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Accesos simultáneos desde múltiples dispositivos.</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">
                  En caso de que sea detectado alguno de estos comportamientos,
                  su examen se cerrará automáticamente y podrá considerarse
                  anulado.
                </p>
              </div>
            </div>

            <p className="text-gray-600 text-sm">
              Al continuar, confirmas que has leído y entiendes estas
              condiciones de supervisión.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Entiendo, Iniciar Examen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
