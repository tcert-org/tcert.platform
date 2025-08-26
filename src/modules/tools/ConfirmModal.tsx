import React from "react";

interface ConfirmModalProps {
  open: boolean;
  unansweredCount: number;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  description?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  unansweredCount,
  onClose,
  onConfirm,
  confirmText = "Enviar",
  cancelText = "Cancelar",
  title = "¿Estás seguro de enviar tus respuestas?",
  description,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 text-center">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">
          {description ||
            (unansweredCount > 0
              ? `Aún tienes ${unansweredCount} pregunta${
                  unansweredCount === 1 ? "" : "s"
                } sin responder.`
              : "¿Deseas continuar?")}
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700 shadow-lg transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
