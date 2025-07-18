"use client";
import React, { useState, useEffect, useRef } from "react";

const mockExam = {
  name: "Examen de Matemáticas Básicas",
  questions: Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    text: `Esta es la pregunta número ${i + 1}`, // Backticks para interpolar
    options: [
      `Opción A para pregunta ${i + 1}`, // Backticks
      `Opción B para pregunta ${i + 1}`,
      `Opción C para pregunta ${i + 1}`,
      `Opción D para pregunta ${i + 1}`,
    ],
  })),
};

function FormExam() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: number]: number;
  }>({});
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const currentQuestion = mockExam.questions[currentIndex];

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestion.id]: optionIndex,
    });
  };

  const goNext = () => {
    if (currentIndex < mockExam.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    alert("Examen enviado! Gracias.");
  };

  useEffect(() => {
    const ref = itemRefs.current[currentIndex];
    if (ref) {
      ref.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  const isLastQuestion = currentIndex === mockExam.questions.length - 1;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 0 }}>{mockExam.name}</h2>

      <div
        style={{
          display: "flex",
          gap: 20,
          height: 450,
          minWidth: 720,
        }}
      >
        {/* Card lateral con scroll automático */}
        <div
          style={{
            width: 220,
            height: 450,
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            backgroundColor: "#fff",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: 15,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            userSelect: "none",
          }}
          aria-label="Navegación preguntas"
        >
          {mockExam.questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedOptions.hasOwnProperty(q.id);

            let backgroundColor = "#bbdefb"; // azul claro default
            let color = "#0d47a1"; // azul oscuro texto

            if (isCurrent) {
              backgroundColor = "#213763"; // azul oscuro fondo
              color = "#fff";
            } else if (isAnswered) {
              backgroundColor = "#4caf50"; // verde fondo
              color = "#fff";
            }

            return (
              <div
                key={q.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  cursor: "pointer",
                  padding: "12px 16px",
                  borderRadius: 8,
                  backgroundColor,
                  color,
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                  userSelect: "none",
                  transition: "background-color 0.3s, color 0.3s",
                }}
                title={`Pregunta ${q.id}`} // Aquí sí comillas y backticks
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setCurrentIndex(idx);
                  }
                }}
              >
                Pregunta {q.id}
              </div>
            );
          })}
        </div>

        {/* Card principal */}
        <div
          style={{
            flexGrow: 1,
            minWidth: 480,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgb(0 0 0 / 0.1)",
            border: "1px solid #ddd",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            minHeight: 350,
          }}
        >
          <h3 style={{ marginBottom: 20 }}>
            Pregunta {currentQuestion.id}: {currentQuestion.text}
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 15,
              flexGrow: 1,
              overflowY: "auto",
              paddingRight: 10,
            }}
          >
            {currentQuestion.options.map((option, i) => {
              const isSelected = selectedOptions[currentQuestion.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  style={{
                    padding: "12px 20px",
                    borderRadius: 8,
                    border: isSelected ? "2px solid #213763" : "1px solid #ccc",
                    backgroundColor: isSelected ? "#e1e8f7" : "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 16,
                    userSelect: "none",
                    transition: "all 0.2s",
                    boxShadow: isSelected
                      ? "0 0 8px rgba(33, 55, 99, 0.5)"
                      : "none",
                  }}
                  aria-pressed={isSelected}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <button
              onClick={goBack}
              disabled={currentIndex === 0}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                border: "none",
                backgroundColor: currentIndex === 0 ? "#ccc" : "#213763",
                color: "#fff",
                cursor: currentIndex === 0 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                userSelect: "none",
                fontSize: 16,
              }}
            >
              Atrás
            </button>

            {currentIndex === mockExam.questions.length - 1 ? (
              <button
                onClick={() => alert("Examen enviado! Gracias.")}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  userSelect: "none",
                  fontSize: 16,
                }}
              >
                Enviar examen
              </button>
            ) : (
              <button
                onClick={goNext}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#213763",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "bold",
                  userSelect: "none",
                  fontSize: 16,
                }}
              >
                Siguiente
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormExam;
