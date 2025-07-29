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
    <div className="w-56 rounded-md shadow-md bg-white overflow-y-auto border border-gray-300 p-4 flex flex-col gap-3">
      {questions.map((q, idx) => {
        const isCurrent = idx === currentIndex;
        const isAnswered = selectedOptions.hasOwnProperty(q.id);
        const bgColor =
          isCurrent || isAnswered
            ? "bg-blue-900 text-white"
            : "bg-blue-100 text-blue-900";
        return (
          <div
            key={q.id}
            ref={(el) => {
              if (el) itemRefs.current[idx] = el;
            }}
            onClick={() => onSelect(idx)}
            className={`cursor-pointer px-4 py-3 rounded-md text-center font-bold text-base ${bgColor}`}
          >
            Pregunta {idx + 1}
          </div>
        );
      })}
    </div>
  );
}
