"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

function FormExam() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("simulatorId");

  const [examName, setExamName] = useState("Cargando título...");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [options, setOptions] = useState([]); // Opciones para la pregunta actual
  const [loadingOptions, setLoadingOptions] = useState(false);
  const itemRefs = useRef([]);

  useEffect(() => {
    async function fetchData() {
      if (!examId) {
        setExamName("ID del examen no proporcionado");
        setQuestions([]);
        return;
      }

      try {
        // 1. Fetch exam name
        const examRes = await fetch(`/api/exam?id=${examId}`);
        if (!examRes.ok) throw new Error("Error al obtener examen");
        const examData = await examRes.json();
        setExamName(examData.name_exam || "Sin nombre");

        // 2. Fetch questions
        const questionRes = await fetch(`/api/exam/question?exam_id=${examId}`);
        if (!questionRes.ok) throw new Error("Error al obtener preguntas");
        const questionResponse = await questionRes.json();

        const questionDataArray = questionResponse.data || [];
        const questionsTransformed = questionDataArray.map((q) => ({
          id: q.id,
          text: q.content,
        }));

        setQuestions(questionsTransformed);
        setCurrentIndex(0);
        setSelectedOptions({});
      } catch (error) {
        setExamName("Error cargando el examen o preguntas");
        setQuestions([]);
        console.error(error);
      }
    }

    fetchData();
  }, [examId]);

  // Cargar opciones cada vez que cambie la pregunta actual
  useEffect(() => {
    async function fetchOptions() {
      if (!questions[currentIndex]) {
        setOptions([]);
        return;
      }

      const questionId = questions[currentIndex].id;
      setLoadingOptions(true);
      try {
        const res = await fetch(
          `/api/exam/question/elections?question_id=${questionId}`
        );
        if (!res.ok) throw new Error("Error al obtener opciones");
        const data = await res.json();
        setOptions(data.data || []);
      } catch (error) {
        console.error(error);
        setOptions([]);
      }
      setLoadingOptions(false);
    }

    fetchOptions();
  }, [currentIndex, questions]);

  const currentQuestion = questions[currentIndex] || {};

  const handleOptionSelect = (optionIndex) => {
    setSelectedOptions({
      ...selectedOptions,
      [currentQuestion.id]: optionIndex,
    });
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const isLastQuestion = currentIndex === questions.length - 1;

  if (questions.length === 0)
    return (
      <div
        style={{
          maxWidth: 900,
          margin: "40px auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ textAlign: "center" }}>{examName}</h2>
        <p style={{ textAlign: "center", marginTop: 30 }}>
          No hay preguntas para mostrar.
        </p>
      </div>
    );

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
      <h2 style={{ textAlign: "center", marginBottom: 0 }}>{examName}</h2>

      <div style={{ display: "flex", gap: 20, height: 450, minWidth: 720 }}>
        {/* Preguntas laterales */}
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
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = selectedOptions.hasOwnProperty(q.id);

            // Ahora, preguntas contestadas y la actual tienen azul oscuro
            let backgroundColor =
              isCurrent || isAnswered ? "#213763" : "#bbdefb";
            let color = isCurrent || isAnswered ? "#fff" : "#0d47a1";

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
                title={`Pregunta ${idx + 1}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setCurrentIndex(idx);
                  }
                }}
              >
                Pregunta {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Pregunta actual */}
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
          <h3 style={{ marginBottom: 20 }}>{currentQuestion.text}</h3>

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
            {loadingOptions ? (
              <p>Cargando opciones...</p>
            ) : options.length === 0 ? (
              <p>No hay opciones para esta pregunta.</p>
            ) : (
              options.map((option, i) => {
                const isSelected = selectedOptions[currentQuestion.id] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 8,
                      border: isSelected
                        ? "2px solid #213763"
                        : "1px solid #ccc",
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
                    {option.content || option.text || `Opción ${i + 1}`}
                  </button>
                );
              })
            )}
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

            {isLastQuestion ? (
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
