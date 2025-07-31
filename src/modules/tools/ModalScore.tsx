interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  examDetails: any; // Asegúrate de que 'examDetails' contiene lo que necesitas
}

export const Modal = ({ isOpen, onClose, examDetails }: ModalProps) => {
  if (!isOpen) return null; // Si el modal no está abierto, no lo renderizamos

  // Si examDetails está vacío, muestra un mensaje de advertencia
  if (!examDetails || !examDetails.best_attempt || !examDetails.last_attempt) {
    return <p>No hay datos para mostrar.</p>;
  }

  // Formateamos la fecha para mostrarla de manera legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Esto convierte la fecha a un formato legible
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Resultados del Examen</h2>

        <div>
          <h3 className="text-lg font-semibold mb-2">Mejor Intento</h3>
          <p>
            <strong>Fecha del Intento:</strong>{" "}
            {formatDate(examDetails.best_attempt.attempt_date)}
          </p>
          <p>
            <strong>Respuestas Correctas:</strong>{" "}
            {examDetails.best_attempt.correct_count}
          </p>
          <p>
            <strong>Respuestas Incorrectas:</strong>{" "}
            {examDetails.best_attempt.incorrect_count}
          </p>
          <p>
            <strong>Respuestas Sin Responder:</strong>{" "}
            {examDetails.best_attempt.unanswered_count}
          </p>
          <p>
            <strong>Puntaje Total:</strong> {examDetails.best_attempt.score}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {examDetails.best_attempt.passed ? "Aprobado" : "Reprobado"}
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">Último Intento</h3>
          <p>
            <strong>Fecha del Intento:</strong>{" "}
            {formatDate(examDetails.last_attempt.attempt_date)}
          </p>
          <p>
            <strong>Respuestas Correctas:</strong>{" "}
            {examDetails.last_attempt.correct_count}
          </p>
          <p>
            <strong>Respuestas Incorrectas:</strong>{" "}
            {examDetails.last_attempt.incorrect_count}
          </p>
          <p>
            <strong>Respuestas Sin Responder:</strong>{" "}
            {examDetails.last_attempt.unanswered_count}
          </p>
          <p>
            <strong>Puntaje Total:</strong> {examDetails.last_attempt.score}
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            {examDetails.last_attempt.passed ? "Aprobado" : "Reprobado"}
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
