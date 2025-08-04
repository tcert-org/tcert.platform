import React from "react";

export default function QuestionSidebar({
  questions,
  currentIndex,
  selectedOptions,
  onSelect,
  itemRefs,
}: {
  questions: { id: number }[];
  currentIndex: number;
  selectedOptions: Record<number, number>;
  onSelect: (idx: number) => void;
  itemRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <div className="w-80 rounded-xl shadow-lg bg-white overflow-y-auto border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Navegación</h3>
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span>Respondida</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span>Pendiente</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = selectedOptions.hasOwnProperty(q.id);

          let buttonClasses =
            "cursor-pointer px-4 py-3 rounded-lg text-center font-semibold text-sm transition-all duration-200 border-2 ";

          if (isCurrent) {
            // Pregunta actual - azul oscuro con borde
            buttonClasses +=
              "bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-500/30";
          } else if (isAnswered) {
            // Pregunta respondida - azul claro
            buttonClasses +=
              "bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300 hover:border-blue-400";
          } else {
            // Pregunta sin responder - gris claro
            buttonClasses +=
              "bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600";
          }

          return (
            <div
              key={q.id}
              ref={(el) => {
                if (el) itemRefs.current[idx] = el;
              }}
              onClick={() => onSelect(idx)}
              className={buttonClasses}
            >
              <div className="flex items-center justify-center space-x-2">
                <span>Pregunta {idx + 1}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-blue-600">
              {Object.keys(selectedOptions).length}
            </span>{" "}
            de <span className="font-semibold">{questions.length}</span>{" "}
            respondidas
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (Object.keys(selectedOptions).length / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
