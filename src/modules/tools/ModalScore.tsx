import { X, Calendar, CheckCircle, XCircle, Clock, Award } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  examDetails: any; // Asegúrate de que 'examDetails' contiene lo que necesitas
}

export const Modal = ({ isOpen, onClose, examDetails }: ModalProps) => {
  if (!isOpen) return null; // Si el modal no está abierto, no lo renderizamos

  // Si examDetails está vacío, muestra un mensaje de advertencia
  if (!examDetails || !examDetails.best_attempt || !examDetails.last_attempt) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-gray-600">No hay datos para mostrar.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formateamos la fecha para mostrarla de manera legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({
    attempt,
    title,
    icon: Icon,
    accentColor,
    bgColor,
  }: any) => (
    <div
      className={`${bgColor} rounded-xl p-6 shadow-lg border-l-4 ${accentColor}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/80 rounded-lg">
            <Icon className="h-6 w-6 text-gray-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-3 w-3" />
              {formatDate(attempt.attempt_date)}
            </div>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            attempt.passed ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {attempt.passed ? "✓ Aprobado" : "✗ Reprobado"}
        </div>
      </div>

      {/* Estadísticas horizontales */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-2xl font-bold text-green-600">
              {attempt.correct_count}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">Correctas</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <XCircle className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-2xl font-bold text-red-600">
              {attempt.incorrect_count}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">Incorrectas</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-yellow-600 mr-1" />
            <span className="text-2xl font-bold text-yellow-600">
              {attempt.unanswered_count}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">Sin responder</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Award className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-3xl font-bold text-blue-600">
              {attempt.score}%
            </span>
          </div>
          <p className="text-xs text-gray-600 font-medium">Puntaje Final</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Award className="h-6 w-6 text-blue-600" />
              Resultados del Examen
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <StatCard
            attempt={examDetails.best_attempt}
            title="Mejor Intento"
            icon={Award}
            accentColor="border-green-500"
            bgColor="bg-green-50"
          />

          <StatCard
            attempt={examDetails.last_attempt}
            title="Último Intento"
            icon={Clock}
            accentColor="border-blue-500"
            bgColor="bg-blue-50"
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
